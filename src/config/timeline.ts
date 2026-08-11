/**
 * ============================================================================
 *  TIMELINE — fonte única de verdade do vídeo
 * ============================================================================
 *
 *  Para ajustar a duração de qualquer cena, mude apenas `SCENE_STARTS` (em
 *  segundos). Todo o resto (frames, transições, cues de SFX) é derivado daqui.
 *
 *  Os cortes foram posicionados dentro de pausas reais da narração
 *  (ver `speechMap.ts`), portanto cada troca de cena cai no silêncio entre
 *  duas frases.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Duração exata do arquivo de narração (public/audio/narration.mp3). */
export const NARRATION_SEC = 70.1649;

/**
 * Ganho da narração. O arquivo original é baixo (pico -5,5 dBFS); 1.25 leva a
 * voz para ~-3,2 dBFS de pico, sem clipar quando somada aos efeitos.
 */
export const NARRATION_VOLUME = 1.25;

/** Sobra depois da última palavra, para o CTA respirar antes de terminar. */
export const TAIL_SEC = 1.45;

export const TOTAL_SEC = NARRATION_SEC + TAIL_SEC;

/** Quantos frames as cenas se sobrepõem durante a transição (cross-dissolve). */
export const TRANSITION_FRAMES = 12;

export type SceneId =
  | "oportunidades"
  | "eoPior"
  | "precisaConsultar"
  | "cemMais"
  | "pagueSo";

/**
 * Início de cada cena, em segundos de narração.
 *
 * A ORDEM segue o roteiro falado (ver narration.txt / narrationText.ts), não a
 * numeração dos slides — a locução apresenta "mais de 90 tipos de consultas...
 * em segundos" ANTES de "Precisa consultar um veículo?", então a tela 100+ vem
 * antes da tela Precisa consultar.
 *
 * Cada corte cai numa pausa real da locução (speechMap.ts), com uma exceção
 * proposital: o corte para "E o pior..." é seco em cima da palavra, porque é
 * onde a narração vira o tom.
 */
export const SCENE_STARTS: { id: SceneId; start: number; label: string }[] = [
  // "Você que é despachante..." + "Quantas oportunidades você já atrasou ou perdeu?"
  { id: "oportunidades", start: 0.0, label: "2/8 — Quantas oportunidades você perdeu?" },
  // "E o pior..." (falado em 14,76s) + "Cada minuto de espera..."
  { id: "eoPior", start: 14.6, label: "3/8 — E o pior..." },
  // "...nasceu a ConsulTech" + "mais de 90 tipos de consultas... em segundos"
  { id: "cemMais", start: 22.16, label: "5/8 — 100+ tipos de consultas" },
  // "Precisa consultar um veículo? ... Está tudo em um só lugar."
  { id: "precisaConsultar", start: 33.69, label: "5/8 — Precisa consultar?" },
  // "E o melhor: você paga apenas pelo que usar..." + CTA "Cadastre-se agora"
  { id: "pagueSo", start: 46.61, label: "8/8 — Pague só pelo que usar" },
];

export const sec = (s: number) => Math.round(s * FPS);

export type SceneSlot = {
  id: SceneId;
  label: string;
  /** frame absoluto em que a cena entra */
  from: number;
  /** frames de conteúdo (até o começo da cena seguinte) */
  duration: number;
  /** duração renderizada, incluindo a sobreposição da transição de saída */
  renderDuration: number;
  index: number;
};

export const SCENES: SceneSlot[] = SCENE_STARTS.map((s, i, arr) => {
  const from = sec(s.start);
  const next = arr[i + 1] ? sec(arr[i + 1].start) : sec(TOTAL_SEC);
  const duration = next - from;
  const isLast = i === arr.length - 1;
  return {
    id: s.id,
    label: s.label,
    from,
    duration,
    renderDuration: isLast ? duration : duration + TRANSITION_FRAMES,
    index: i,
  };
});

export const TOTAL_FRAMES = sec(TOTAL_SEC);

export const sceneById = (id: SceneId): SceneSlot => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`cena desconhecida: ${id}`);
  return s;
};

/** frame absoluto -> frame relativo ao início da cena */
export const sceneFrame = (id: SceneId, absolute: number) =>
  absolute - sceneById(id).from;
