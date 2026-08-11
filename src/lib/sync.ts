/**
 * ============================================================================
 *  SYNC — trava as animações no que está sendo falado
 * ============================================================================
 *
 *  Nenhuma cena usa mais frames "inventados". Cada elemento entra num beat da
 *  narração, vindo de src/config/speechMap.ts (gerado por
 *  `npm run analyze` a partir do próprio áudio):
 *
 *    S.phrase(i)   início da i-ésima FRASE da cena      (troca de assunto)
 *    S.beat(i)     início da i-ésima PALAVRA da cena    (âncora principal)
 *    S.syl(i)      i-ésima SÍLABA da cena               (acentos finos)
 *    S.spread(n,f) distribui n elementos por n beats a partir do beat f
 *
 *  Todos devolvem frames RELATIVOS ao início da cena, prontos para usar como
 *  delay nas funções de animação.
 */

import { WORDS } from "../config/narrationText";
import { BEATS, PHRASES, SYLLABLES } from "../config/speechMap";
import { FPS, SceneId, sceneById } from "../config/timeline";

const toFrame = (sec: number) => Math.round(sec * FPS);

/** normaliza para comparar palavras da narração (sem acento, sem pontuação) */
const normalizeWord = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** pega o item i de uma lista de frames, clampando nas pontas */
const at = (list: number[], i: number, fallback: number) => {
  if (list.length === 0) return fallback;
  const idx = Math.min(Math.max(Math.round(i), 0), list.length - 1);
  return list[idx];
};

export type SceneSync = {
  /** frame relativo do início da i-ésima frase falada dentro da cena */
  phrase: (i: number) => number;
  /** frame relativo do início da i-ésima palavra falada dentro da cena */
  beat: (i: number) => number;
  /** frame relativo da i-ésima sílaba dentro da cena */
  syl: (i: number) => number;
  /**
   * Distribui `count` elementos em beats consecutivos a partir de `fromBeat`.
   * Com `step` > 1 pula beats (elementos mais espaçados na fala).
   */
  spread: (count: number, fromBeat: number, step?: number) => number[];
  /** distribui `count` elementos entre dois índices de beat (inclusive) */
  spreadBetween: (count: number, fromBeat: number, toBeat: number) => number[];
  /** frame relativo do beat mais próximo de um instante absoluto (em segundos) */
  atSecond: (absoluteSec: number) => number;
  /**
   * Frame relativo do instante em que uma PALAVRA da narração é falada,
   * procurando só dentro desta cena.
   *
   *   h1: S.atWord("Quantas", 6)   // entra quando a locução diz "Quantas"
   *
   * `fallbackBeat` é usado quando não há transcrição (ou a palavra não aparece
   * na cena), para o vídeo continuar sincronizado pelo ritmo.
   */
  atWord: (needle: string, fallbackBeat?: number) => number;
  /**
   * Como `atWord`, mas para uma sequência: o cursor avança a cada palavra
   * encontrada, então palavras repetidas ("você", "mais") caem na ocorrência
   * certa.
   */
  atWords: (needles: string[], fallbackFromBeat?: number) => number[];
  /** distribui `count` elementos pelos beats entre dois instantes absolutos */
  spreadSeconds: (count: number, fromSec: number, toSec: number) => number[];
  /** quantos beats/frases/sílabas a cena contém */
  beatCount: number;
  phraseCount: number;
  sylCount: number;
  /** listas cruas (frames relativos), para casos especiais */
  beats: number[];
  phrases: number[];
  syllables: number[];
  /** duração de conteúdo da cena, em frames */
  duration: number;
};

/**
 * Constrói o localizador de beats de uma cena. Chamado no topo de cada arquivo
 * de cena — é uma função pura, sem hooks.
 */
export const sceneSync = (id: SceneId): SceneSync => {
  const slot = sceneById(id);
  const from = slot.from;
  const endFrame = from + slot.duration;

  // uma tolerância de 2 frames evita perder um beat que cai exatamente no corte
  const inScene = (sec: number) => {
    const f = toFrame(sec);
    return f >= from - 2 && f < endFrame;
  };

  const rel = (sec: number) => Math.max(0, toFrame(sec) - from);

  const beats = BEATS.filter(inScene).map(rel);
  const phrases = PHRASES.map((p) => p.start)
    .filter(inScene)
    .map(rel);
  const syllables = SYLLABLES.filter(inScene).map(rel);

  /** palavras da transcrição que caem dentro desta cena */
  const sceneWords = WORDS.filter((w) => {
    const f = toFrame(w.start);
    return f >= from - 2 && f < endFrame;
  });

  const beat = (i: number) => at(beats, i, 0);

  return {
    phrase: (i) => at(phrases, i, 0),
    beat,
    syl: (i) => at(syllables, i, 0),

    spread: (count, fromBeat, step = 1) =>
      Array.from({ length: count }, (_, k) => beat(fromBeat + k * step)),

    spreadBetween: (count, fromBeat, toBeat) => {
      if (count <= 1) return [beat(fromBeat)];
      const span = toBeat - fromBeat;
      return Array.from({ length: count }, (_, k) =>
        beat(fromBeat + (span * k) / (count - 1)),
      );
    },

    atSecond: (absoluteSec) => {
      const target = toFrame(absoluteSec) - from;
      if (beats.length === 0) return Math.max(0, target);
      return beats.reduce(
        (best, b) => (Math.abs(b - target) < Math.abs(best - target) ? b : best),
        beats[0],
      );
    },

    atWord: (needle, fallbackBeat = 0) => {
      const n = normalizeWord(needle);
      const hit = sceneWords.find((w) => normalizeWord(w.text).startsWith(n));
      if (!hit) return at(beats, fallbackBeat, 0);
      return Math.max(0, toFrame(hit.start) - from);
    },

    atWords: (needles, fallbackFromBeat = 0) => {
      let cursor = 0;
      return needles.map((needle, k) => {
        const n = normalizeWord(needle);
        const idx = sceneWords.findIndex(
          (w, i) => i >= cursor && normalizeWord(w.text).startsWith(n),
        );
        if (idx < 0) return at(beats, fallbackFromBeat + k, 0);
        cursor = idx + 1;
        return Math.max(0, toFrame(sceneWords[idx].start) - from);
      });
    },

    spreadSeconds: (count, fromSec, toSec) => {
      if (count <= 1) return [Math.max(0, toFrame(fromSec) - from)];
      const window = beats.filter(
        (b) => b >= toFrame(fromSec) - from - 2 && b <= toFrame(toSec) - from + 2,
      );
      if (window.length === 0) {
        const a = toFrame(fromSec) - from;
        const b = toFrame(toSec) - from;
        return Array.from({ length: count }, (_, k) =>
          Math.max(0, Math.round(a + ((b - a) * k) / (count - 1))),
        );
      }
      return Array.from({ length: count }, (_, k) =>
        window[Math.min(window.length - 1, Math.round(((window.length - 1) * k) / (count - 1)))],
      );
    },

    beatCount: beats.length,
    phraseCount: phrases.length,
    sylCount: syllables.length,
    beats,
    phrases,
    syllables,
    duration: slot.duration,
  };
};

/**
 * Revela uma lista de palavras (ou linhas) uma por beat falado.
 * Devolve o delay de cada palavra, em frames relativos à cena.
 */
export const wordBeats = (
  S: SceneSync,
  wordCount: number,
  fromBeat = 0,
  step = 1,
): number[] => S.spread(wordCount, fromBeat, step);

// ---------------------------------------------------------------------------
// alinhamento de texto por peso silábico
// ---------------------------------------------------------------------------

/**
 * Conta sílabas de uma palavra em pt-BR por grupos de vogais.
 * Aproximação boa o suficiente para distribuir tempo: "oportunidades" → 6,
 * "perdeu" → 2, "só" → 1.
 */
export const countSyllables = (word: string): number => {
  const w = word.toLowerCase().replace(/[^a-záàâãéêíóôõúüç]/g, "");
  if (!w) return 1;
  const groups = w.match(/[aeiouáàâãéêíóôõúü]+/g);
  return Math.max(1, groups ? groups.length : 1);
};

/**
 * Distribui as palavras de um texto dentro de uma janela de fala,
 * proporcionalmente ao número de sílabas de cada uma, e encaixa cada palavra
 * no beat mais próximo.
 *
 * É o que faz o título aparecer palavra por palavra junto com a locução: os
 * títulos das telas são lidos na narração, então o peso silábico já dá o
 * ritmo certo sem precisar de transcrição.
 *
 * @param words      palavras/linhas do título, na ordem
 * @param startSec   início da janela de fala (absoluto, em segundos)
 * @param endSec     fim da janela de fala
 * @param sceneFrom  frame absoluto de início da cena (para devolver relativo)
 */
export const alignWords = (
  words: string[],
  startSec: number,
  endSec: number,
  sceneFrom: number,
): number[] => {
  const weights = words.map((w) => countSyllables(w));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const span = Math.max(0.001, endSec - startSec);

  let acc = 0;
  return words.map((_, i) => {
    const target = startSec + (acc / total) * span;
    acc += weights[i];
    // encaixa no beat mais próximo
    const nearest = BEATS.reduce(
      (best, b) => (Math.abs(b - target) < Math.abs(best - target) ? b : best),
      BEATS[0] ?? target,
    );
    return Math.max(0, toFrame(nearest) - sceneFrom);
  });
};

/**
 * Versão de `alignWords` amarrada às frases da cena: alinha as palavras do
 * título dentro da janela que vai da frase `fromPhrase` até `toPhrase`.
 *
 * Ex.: um título de 4 linhas costuma ser lido em 2 frases — então
 * `alignWordsToPhrase(id, linhas, 0, 1)`.
 */
export const alignWordsToPhrase = (
  id: SceneId,
  words: string[],
  fromPhrase = 0,
  toPhrase = fromPhrase,
): number[] => {
  const slot = sceneById(id);
  const from = slot.from;
  const endFrame = from + slot.duration;

  // Distribui por peso silábico dentro da janela de fala.
  // (Com transcrição, prefira `S.atWords([...])`: usa o instante exato.)
  const inScene = (sec: number) => {
    const f = toFrame(sec);
    return f >= from - 2 && f < endFrame;
  };
  const scenePhrases = PHRASES.filter((p) => inScene(p.start));
  if (scenePhrases.length === 0) return words.map(() => 0);
  const a = scenePhrases[Math.min(fromPhrase, scenePhrases.length - 1)];
  const b = scenePhrases[Math.min(toPhrase, scenePhrases.length - 1)];
  return alignWords(words, a.start, b.end, from);
};
