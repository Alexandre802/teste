/**
 * Transcrição da narração alinhada ao áudio.
 *
 * Este arquivo é GERADO. Enquanto estiver vazio, o vídeo se sincroniza apenas
 * pelo RITMO da fala (frases, palavras e sílabas detectadas em speechMap.ts).
 * Com a transcrição preenchida, ele passa a se sincronizar pelo CONTEÚDO: cada
 * palavra do título entra no instante exato em que é falada.
 *
 * Para preencher:
 *   1. salve o texto da narração em narration.txt (texto puro)
 *   2. rode: npm run align
 *
 * O comando sobrescreve este arquivo e imprime, no terminal, os segundos
 * sugeridos para SCENE_STARTS (src/config/timeline.ts).
 */

export type SpokenWord = { text: string; start: number };

/** vazio = sem transcrição; o vídeo cai no alinhamento por ritmo */
export const WORDS: SpokenWord[] = [];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** instante (s) em que uma palavra é falada; -1 se não estiver na narração */
export const wordTime = (needle: string): number => {
  const n = normalize(needle);
  if (!n) return -1;
  const hit = WORDS.find((w) => normalize(w.text).includes(n));
  return hit ? hit.start : -1;
};

/**
 * Procura, em sequência, o instante de cada trecho de texto.
 * Usa a primeira palavra significativa de cada trecho e avança na transcrição,
 * para que "Pague só" e depois "pelo que usar" caiam nas ocorrências certas.
 *
 * Devolve null se não houver transcrição (aí o chamador usa o ritmo).
 */
export const findSpokenSequence = (lines: string[]): number[] | null => {
  if (WORDS.length === 0) return null;

  const normWords = WORDS.map((w) => normalize(w.text));
  const out: number[] = [];
  let cursor = 0;
  let anyHit = false;

  for (const line of lines) {
    const first = line.split(/\s+/).map(normalize).find((t) => t.length > 1);
    let found = -1;
    if (first) {
      for (let i = cursor; i < normWords.length; i++) {
        if (normWords[i] === first || normWords[i].startsWith(first)) {
          found = i;
          break;
        }
      }
    }
    if (found >= 0) {
      out.push(WORDS[found].start);
      cursor = found + 1;
      anyHit = true;
    } else {
      out.push(-1);
    }
  }

  if (!anyHit) return null;

  // preenche os trechos não encontrados por interpolação entre os vizinhos
  for (let i = 0; i < out.length; i++) {
    if (out[i] >= 0) continue;
    const prev = out.slice(0, i).filter((v) => v >= 0).pop();
    const nextIdx = out.findIndex((v, j) => j > i && v >= 0);
    const next = nextIdx >= 0 ? out[nextIdx] : undefined;
    if (prev !== undefined && next !== undefined) {
      out[i] = prev + ((next - prev) * (i - out.lastIndexOf(prev))) / (nextIdx - out.lastIndexOf(prev));
    } else if (prev !== undefined) {
      out[i] = prev + 0.35;
    } else if (next !== undefined) {
      out[i] = Math.max(0, next - 0.35);
    } else {
      out[i] = 0;
    }
  }

  return out;
};
