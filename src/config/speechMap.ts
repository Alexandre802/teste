/**
 * Mapa de fala da narração (public/audio/narration.mp3).
 *
 * Gerado por análise de envelope RMS do áudio (janela de 10 ms):
 * 41 grupos de fala detectados entre 0.11s e 69.72s. Serve para (a) posicionar
 * os cortes de cena dentro de pausas reais e (b) ancorar acentos de animação
 * e efeitos sonoros no ritmo da locução.
 *
 * Se você trocar o arquivo de narração, rode novamente:
 *   node tools/analyze-audio.mjs public/audio/narration.mp3
 */

export type Phrase = { start: number; end: number };

export const PHRASES: Phrase[] = [
  { start: 0.11, end: 2.27 },
  { start: 2.57, end: 3.35 },
  { start: 3.6, end: 5.32 },
  { start: 5.77, end: 6.72 },
  { start: 7.16, end: 8.96 },
  { start: 9.24, end: 11.47 },
  { start: 11.74, end: 13.26 },
  { start: 13.57, end: 15.31 },
  { start: 15.69, end: 16.16 },
  { start: 16.78, end: 18.27 },
  { start: 18.41, end: 19.37 },
  { start: 19.66, end: 21.73 },
  { start: 22.59, end: 24.74 },
  { start: 25.4, end: 26.45 },
  { start: 26.78, end: 29.7 },
  { start: 30.04, end: 30.56 },
  { start: 30.93, end: 31.98 },
  { start: 32.37, end: 33.45 },
  { start: 33.93, end: 35.05 },
  { start: 35.44, end: 36.68 },
  { start: 37.0, end: 38.66 },
  { start: 39.04, end: 39.92 },
  { start: 40.29, end: 40.89 },
  { start: 41.19, end: 42.14 },
  { start: 42.73, end: 43.93 },
  { start: 44.42, end: 46.43 },
  { start: 46.79, end: 47.75 },
  { start: 48.09, end: 48.47 },
  { start: 48.84, end: 50.31 },
  { start: 50.73, end: 52.0 },
  { start: 52.54, end: 54.82 },
  { start: 55.18, end: 56.67 },
  { start: 57.03, end: 58.93 },
  { start: 59.36, end: 60.76 },
  { start: 61.09, end: 61.74 },
  { start: 62.06, end: 62.96 },
  { start: 63.36, end: 64.82 },
  { start: 65.23, end: 66.84 },
  { start: 67.1, end: 67.65 },
  { start: 67.92, end: 68.55 },
  { start: 68.69, end: 69.72 },
];

/**
 * Pausas mais longas — as usadas como pontos de corte entre cenas estão
 * marcadas com ←  (ver SCENE_STARTS em timeline.ts).
 */
export const MAJOR_PAUSES = [
  { at: 5.54, len: 0.45 },
  { at: 6.94, len: 0.44 },
  { at: 16.47, len: 0.62 }, // ← corte cena 1 → 2
  { at: 22.16, len: 0.86 },
  { at: 25.07, len: 0.66 }, // ← corte cena 2 → 3
  { at: 33.69, len: 0.48 },
  { at: 42.44, len: 0.59 }, // ← corte cena 3 → 4
  { at: 44.17, len: 0.49 },
  { at: 52.27, len: 0.54 },
  { at: 59.14, len: 0.43 }, // ← corte cena 4 → 5
];

/** Início das frases dentro de uma janela (em segundos), relativo à janela. */
export const phraseOnsetsBetween = (from: number, to: number): number[] =>
  PHRASES.filter((p) => p.start >= from && p.start < to).map((p) => p.start - from);
