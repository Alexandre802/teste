/**
 * Timing, transicoes e trilha de efeitos sonoros de cada cena.
 *
 * - `durationInFrames` e o tempo BRUTO da cena (a 30 fps).
 * - `transition` e o cruzamento com a cena SEGUINTE; o overlap e descontado
 *   do total automaticamente por `TOTAL_DURATION`.
 * - `sfx.at` e o frame RELATIVO ao inicio da propria cena.
 *
 * O ritmo segue os 13 blocos da narracao (67 s), mas o video nao leva voz:
 * so efeitos sonoros.
 */

export type SfxName =
  | "whoosh-short"
  | "whoosh-transition"
  | "swipe-fast"
  | "pop-ui"
  | "pop-soft"
  | "click-digital"
  | "tap-button"
  | "notification-pop"
  | "impact-hit"
  | "bass-hit"
  | "sub-boom"
  | "riser-short"
  | "reverse-whoosh"
  | "glitch-digital"
  | "tick-micro"
  | "chime-success"
  | "sparkle-shine"
  | "logo-sting";

export type TransitionKind =
  | "slideUp"
  | "slideLeft"
  | "fadeScale"
  | "wipeGreen"
  | "glitchDark";

export type SfxCue = { at: number; s: SfxName; v?: number };

export type SceneConfig = {
  id: string;
  /** Bloco da copy que essa cena ilustra (documental). */
  beat: string;
  durationInFrames: number;
  transition: { kind: TransitionKind; durationInFrames: number };
  sfx: SfxCue[];
};

/** Atalho para reduzir ruido na lista de cues. */
const c = (at: number, s: SfxName, v = 0.45): SfxCue => ({ at, s, v });

/** Sequencia de ticks igualmente espacados (desenho de graficos). */
const ticks = (from: number, count: number, step: number, v = 0.3): SfxCue[] =>
  Array.from({ length: count }, (_, i) => c(from + i * step, "tick-micro", v));

export const SCENES: SceneConfig[] = [
  {
    id: "s1",
    beat: "Método não dá resultado. Mas sabe por quê?",
    durationInFrames: 198,
    transition: { kind: "slideUp", durationInFrames: 18 },
    sfx: [
      c(0, "reverse-whoosh", 0.5),
      c(6, "whoosh-transition", 0.55),
      c(14, "impact-hit", 0.45),
      c(22, "whoosh-short", 0.5),
      c(31, "whoosh-short", 0.45),
      c(41, "impact-hit", 0.75),
      c(45, "sparkle-shine", 0.32),
      c(54, "pop-soft", 0.4),
      c(64, "pop-ui", 0.45),
      ...ticks(70, 5, 4, 0.22),
      c(80, "pop-ui", 0.45),
      ...ticks(86, 5, 4, 0.22),
      c(98, "pop-soft", 0.4),
      ...ticks(104, 8, 3, 0.2),
      c(112, "pop-ui", 0.45),
      c(122, "swipe-fast", 0.35),
      c(134, "pop-soft", 0.4),
      c(144, "notification-pop", 0.3),
      c(172, "riser-short", 0.4),
    ],
  },
  {
    id: "s2",
    beat: "quando seus ganhos e gastos ficam espalhados…",
    durationInFrames: 226,
    transition: { kind: "fadeScale", durationInFrames: 16 },
    sfx: [
      c(0, "whoosh-transition", 0.55),
      c(2, "whoosh-short", 0.5),
      c(18, "whoosh-short", 0.45),
      c(30, "impact-hit", 0.65),
      c(34, "sparkle-shine", 0.28),
      c(46, "pop-soft", 0.35),
      // enxurrada de cards espalhados
      c(56, "swipe-fast", 0.32),
      c(60, "pop-ui", 0.4),
      c(68, "swipe-fast", 0.3),
      c(72, "pop-soft", 0.38),
      c(80, "swipe-fast", 0.32),
      c(84, "pop-ui", 0.4),
      c(92, "pop-soft", 0.36),
      c(100, "swipe-fast", 0.3),
      c(104, "pop-ui", 0.4),
      c(112, "pop-soft", 0.36),
      c(120, "swipe-fast", 0.32),
      c(124, "pop-ui", 0.4),
      c(132, "pop-soft", 0.34),
      c(140, "swipe-fast", 0.28),
      c(144, "pop-ui", 0.38),
      c(152, "pop-soft", 0.32),
      c(160, "tick-micro", 0.3),
      c(168, "pop-ui", 0.34),
      c(178, "glitch-digital", 0.28),
      c(200, "riser-short", 0.42),
    ],
  },
  {
    id: "s3",
    beat: "você até pode estar fazendo dinheiro… mas não enxerga o lucro real",
    durationInFrames: 198,
    transition: { kind: "slideLeft", durationInFrames: 18 },
    sfx: [
      c(0, "whoosh-transition", 0.5),
      c(1, "whoosh-short", 0.5),
      c(6, "pop-ui", 0.5),
      c(26, "whoosh-short", 0.5),
      c(31, "bass-hit", 0.6),
      c(44, "whoosh-short", 0.45),
      c(49, "pop-ui", 0.45),
      ...ticks(64, 7, 10, 0.3),
      c(136, "sparkle-shine", 0.35),
      c(142, "sub-boom", 0.4),
      c(172, "riser-short", 0.4),
    ],
  },
  {
    id: "s4",
    beat: "quanto entrou, quanto saiu, quanto sobrou — e a próxima semana?",
    durationInFrames: 258,
    transition: { kind: "glitchDark", durationInFrames: 20 },
    sfx: [
      c(0, "whoosh-transition", 0.55),
      c(8, "swipe-fast", 0.38),
      c(4, "whoosh-short", 0.5),
      c(15, "whoosh-short", 0.45),
      c(30, "impact-hit", 0.65),
      c(50, "pop-soft", 0.4),
      c(60, "pop-ui", 0.45),
      ...ticks(66, 4, 4, 0.22),
      c(82, "pop-ui", 0.45),
      c(94, "notification-pop", 0.32),
      c(106, "pop-soft", 0.4),
      ...ticks(112, 6, 4, 0.24),
      c(138, "pop-ui", 0.45),
      ...ticks(148, 8, 5, 0.26),
      c(196, "glitch-digital", 0.3),
      c(212, "pop-soft", 0.4),
      c(232, "riser-short", 0.45),
    ],
  },
  {
    id: "s5",
    beat: "Foi pensando nisso que nasceu a Monttra.",
    durationInFrames: 226,
    transition: { kind: "wipeGreen", durationInFrames: 18 },
    sfx: [
      c(0, "bass-hit", 0.85),
      c(2, "glitch-digital", 0.5),
      c(10, "sub-boom", 0.5),
      c(2, "whoosh-short", 0.5),
      c(7, "pop-ui", 0.5),
      c(32, "whoosh-short", 0.5),
      c(37, "pop-ui", 0.5),
      c(46, "whoosh-short", 0.5),
      c(51, "pop-ui", 0.5),
      c(60, "impact-hit", 0.8),
      c(64, "sparkle-shine", 0.42),
      c(76, "pop-soft", 0.38),
      ...ticks(90, 6, 12, 0.26),
      c(104, "pop-soft", 0.34),
      c(128, "pop-soft", 0.34),
      c(152, "pop-soft", 0.34),
      c(164, "pop-soft", 0.34),
      c(178, "impact-hit", 0.6),
      c(182, "chime-success", 0.4),
      c(200, "riser-short", 0.45),
    ],
  },
  {
    id: "s6",
    beat: "Você acompanha tudo que entrou e saiu por dia, semana, mês, 90 dias ou ano.",
    durationInFrames: 228,
    transition: { kind: "slideUp", durationInFrames: 16 },
    sfx: [
      c(0, "whoosh-transition", 0.6),
      c(2, "whoosh-short", 0.5),
      c(13, "whoosh-short", 0.45),
      c(26, "impact-hit", 0.62),
      c(44, "pop-soft", 0.4),
      c(56, "pop-ui", 0.4),
      c(64, "click-digital", 0.5),
      c(72, "click-digital", 0.5),
      c(80, "tap-button", 0.58),
      c(90, "pop-ui", 0.45),
      c(98, "pop-ui", 0.45),
      c(106, "pop-ui", 0.45),
      ...ticks(114, 3, 6, 0.26),
      c(124, "pop-soft", 0.4),
      ...ticks(130, 6, 6, 0.24),
      c(168, "pop-ui", 0.4),
      c(176, "pop-soft", 0.34),
      c(184, "notification-pop", 0.3),
      ...ticks(188, 5, 4, 0.24),
      c(202, "riser-short", 0.4),
    ],
  },
  {
    id: "s7",
    beat: "Registra suas surebets em uma calculadora inteligente…",
    durationInFrames: 258,
    transition: { kind: "fadeScale", durationInFrames: 16 },
    sfx: [
      c(0, "whoosh-transition", 0.55),
      c(2, "whoosh-short", 0.5),
      c(13, "whoosh-short", 0.45),
      c(26, "impact-hit", 0.62),
      c(44, "pop-soft", 0.4),
      c(54, "whoosh-short", 0.5),
      c(60, "pop-ui", 0.5),
      // simulacao de digitacao
      c(70, "tap-button", 0.42),
      ...ticks(74, 9, 3, 0.2),
      c(104, "click-digital", 0.42),
      c(114, "tap-button", 0.4),
      ...ticks(118, 7, 3, 0.2),
      c(142, "click-digital", 0.42),
      c(150, "tick-micro", 0.3),
      c(156, "tick-micro", 0.3),
      c(164, "click-digital", 0.4),
      c(170, "click-digital", 0.4),
      c(178, "tap-button", 0.45),
      ...ticks(182, 6, 3, 0.2),
      // clique no botao e resultado
      c(198, "tap-button", 0.75),
      c(200, "sparkle-shine", 0.4),
      c(208, "pop-ui", 0.5),
      c(214, "tick-micro", 0.28),
      c(220, "tick-micro", 0.28),
      c(226, "pop-soft", 0.42),
      c(234, "chime-success", 0.5),
      c(244, "click-digital", 0.4),
      c(232, "riser-short", 0.38),
    ],
  },
  {
    id: "s8",
    beat: "E ainda define metas para saber exatamente onde quer chegar.",
    durationInFrames: 196,
    transition: { kind: "slideLeft", durationInFrames: 16 },
    sfx: [
      c(0, "whoosh-transition", 0.55),
      c(2, "whoosh-short", 0.5),
      c(21, "impact-hit", 0.65),
      c(25, "sparkle-shine", 0.32),
      c(40, "pop-soft", 0.36),
      c(52, "pop-ui", 0.45),
      ...ticks(58, 4, 4, 0.22),
      c(66, "pop-ui", 0.45),
      ...ticks(72, 4, 4, 0.22),
      c(80, "pop-ui", 0.45),
      ...ticks(86, 4, 4, 0.22),
      c(96, "pop-soft", 0.45),
      ...ticks(102, 8, 4, 0.22),
      c(136, "pop-ui", 0.4),
      c(142, "chime-success", 0.32),
      c(150, "chime-success", 0.32),
      c(158, "chime-success", 0.34),
      c(166, "pop-soft", 0.36),
      c(170, "riser-short", 0.4),
    ],
  },
  {
    id: "s9",
    beat: "…ter clareza para planejar os próximos passos.",
    durationInFrames: 168,
    transition: { kind: "glitchDark", durationInFrames: 20 },
    sfx: [
      c(0, "whoosh-transition", 0.55),
      c(1, "whoosh-short", 0.5),
      c(12, "whoosh-short", 0.45),
      c(25, "impact-hit", 0.62),
      c(38, "pop-soft", 0.36),
      c(46, "pop-ui", 0.45),
      ...ticks(52, 3, 6, 0.24),
      c(72, "pop-ui", 0.45),
      ...ticks(78, 4, 7, 0.22),
      c(86, "pop-soft", 0.3),
      c(93, "pop-soft", 0.3),
      c(100, "pop-soft", 0.3),
      c(107, "pop-soft", 0.3),
      c(112, "pop-ui", 0.4),
      c(120, "pop-soft", 0.34),
      ...ticks(126, 3, 6, 0.24),
      c(142, "riser-short", 0.45),
      c(148, "bass-hit", 0.5),
    ],
  },
  {
    id: "s10",
    beat: "Quer parar de trabalhar no escuro? Teste a Monttra gratuitamente por 3 dias.",
    durationInFrames: 212,
    transition: { kind: "fadeScale", durationInFrames: 16 },
    sfx: [
      c(0, "bass-hit", 0.9),
      c(2, "glitch-digital", 0.5),
      c(8, "sub-boom", 0.6),
      c(2, "pop-ui", 0.5),
      c(10, "whoosh-short", 0.55),
      c(20, "whoosh-short", 0.5),
      c(33, "impact-hit", 0.85),
      c(37, "sparkle-shine", 0.45),
      c(62, "pop-soft", 0.4),
      c(74, "pop-ui", 0.6),
      c(78, "notification-pop", 0.45),
      c(90, "whoosh-short", 0.5),
      c(102, "pop-soft", 0.4),
      c(110, "pop-soft", 0.4),
      c(118, "pop-soft", 0.4),
      c(126, "pop-soft", 0.4),
      c(134, "pop-soft", 0.4),
      c(142, "chime-success", 0.4),
      c(160, "logo-sting", 0.8),
    ],
  },
];

/** Overlap total consumido pelas transicoes. */
export const TRANSITION_FRAMES = SCENES.slice(0, -1).reduce(
  (acc, s) => acc + s.transition.durationInFrames,
  0,
);

/** Duracao final da composicao, ja descontando os cruzamentos. */
export const TOTAL_DURATION =
  SCENES.reduce((acc, s) => acc + s.durationInFrames, 0) - TRANSITION_FRAMES;
