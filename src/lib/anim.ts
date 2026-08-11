/**
 * ============================================================================
 *  Biblioteca de animação — helpers reutilizáveis por todas as cenas
 * ============================================================================
 *  Toda animação do vídeo passa por aqui, então mudar a "personalidade"
 *  do movimento (mais mola, mais rápido, mais suave) é um ajuste local.
 */

import { Easing, interpolate, spring } from "remotion";

export const EASE = {
  /** saída suave premium (padrão para fades/slides) */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** entrada e saída */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** aceleração de saída (para elementos que somem) */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** leve overshoot sem mola */
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

/** interpolate com clamp nas duas pontas (padrão em 99% dos casos). */
export const ip = (
  frame: number,
  range: readonly number[],
  out: readonly number[],
  easing: (n: number) => number = EASE.out,
) =>
  interpolate(frame, range as number[], out as number[], {
    ...clamp,
    easing,
  });

/** progresso 0→1 de `delay` até `delay + duration`. */
export const prog = (
  frame: number,
  delay: number,
  duration: number,
  easing: (n: number) => number = EASE.out,
) => ip(frame, [delay, delay + duration], [0, 1], easing);

// ---------------------------------------------------------------------------
// molas
// ---------------------------------------------------------------------------

export type SpringPreset = "soft" | "snappy" | "bouncy" | "pop" | "heavy";

const PRESETS: Record<SpringPreset, { damping: number; mass: number; stiffness: number }> = {
  soft: { damping: 200, mass: 0.9, stiffness: 100 },
  snappy: { damping: 26, mass: 0.55, stiffness: 150 },
  bouncy: { damping: 13, mass: 0.7, stiffness: 130 },
  pop: { damping: 11, mass: 0.42, stiffness: 190 },
  heavy: { damping: 30, mass: 1.6, stiffness: 90 },
};

export const spr = (
  frame: number,
  fps: number,
  delay = 0,
  preset: SpringPreset = "snappy",
) =>
  spring({
    frame: frame - delay,
    fps,
    config: PRESETS[preset],
    durationInFrames: undefined,
  });

/** mola com duração fixa (útil para casar exatamente com um beat). */
export const sprIn = (
  frame: number,
  fps: number,
  delay: number,
  durationInFrames: number,
  preset: SpringPreset = "snappy",
) =>
  spring({
    frame: frame - delay,
    fps,
    config: PRESETS[preset],
    durationInFrames,
  });

// ---------------------------------------------------------------------------
// combos prontos (retornam CSSProperties parciais)
// ---------------------------------------------------------------------------

export type Enter = {
  opacity: number;
  transform: string;
  filter?: string;
};

/** fade + slide vertical com mola */
export const fadeUp = (
  frame: number,
  fps: number,
  delay = 0,
  distance = 46,
  preset: SpringPreset = "snappy",
): Enter => {
  const p = spr(frame, fps, delay, preset);
  return {
    opacity: ip(frame, [delay, delay + 8], [0, 1], EASE.out),
    transform: `translateY(${(1 - p) * distance}px)`,
  };
};

/** fade + slide horizontal com mola */
export const fadeSide = (
  frame: number,
  fps: number,
  delay = 0,
  distance = 70,
  preset: SpringPreset = "snappy",
): Enter => {
  const p = spr(frame, fps, delay, preset);
  return {
    opacity: ip(frame, [delay, delay + 8], [0, 1], EASE.out),
    transform: `translateX(${(1 - p) * distance}px)`,
  };
};

/** pop com escala (cards, ícones, badges) */
export const popIn = (
  frame: number,
  fps: number,
  delay = 0,
  from = 0.72,
  preset: SpringPreset = "pop",
): Enter => {
  const p = spr(frame, fps, delay, preset);
  return {
    opacity: ip(frame, [delay, delay + 5], [0, 1], EASE.out),
    transform: `scale(${from + (1 - from) * p})`,
  };
};

/** entrada 3D com leve rotação — usada nos cards de vidro */
export const card3dIn = (
  frame: number,
  fps: number,
  delay = 0,
  opts: { y?: number; x?: number; rotate?: number; rotateY?: number; scale?: number; preset?: SpringPreset } = {},
): Enter => {
  const { y = 54, x = 0, rotate = 0, rotateY = 14, scale = 0.9, preset = "snappy" } = opts;
  const p = spr(frame, fps, delay, preset);
  const inv = 1 - p;
  return {
    opacity: ip(frame, [delay, delay + 7], [0, 1], EASE.out),
    transform: [
      `translate3d(${inv * x}px, ${inv * y}px, 0)`,
      `rotateY(${inv * rotateY}deg)`,
      `rotate(${rotate * p}deg)`,
      `scale(${scale + (1 - scale) * p})`,
    ].join(" "),
    filter: `blur(${inv * 6}px)`,
  };
};

/** stagger: atraso do índice i */
export const stagger = (i: number, step = 4, base = 0) => base + i * step;

// ---------------------------------------------------------------------------
// efeitos contínuos
// ---------------------------------------------------------------------------

/** flutuação suave infinita (parallax / idle motion) */
export const float = (frame: number, amp = 8, periodFrames = 120, phase = 0) =>
  Math.sin((frame / periodFrames) * Math.PI * 2 + phase) * amp;

/** respiração de brilho */
export const glowPulse = (frame: number, min = 0.35, max = 1, periodFrames = 90, phase = 0) => {
  const s = (Math.sin((frame / periodFrames) * Math.PI * 2 + phase) + 1) / 2;
  return min + (max - min) * s;
};

/** rotação constante (graus) */
export const spin = (frame: number, degPerFrame = 0.35) => frame * degPerFrame;

/** deriva de câmera (parallax por camada) */
export const camera = (
  frame: number,
  duration: number,
  opts: { zoom?: number; x?: number; y?: number } = {},
) => {
  const { zoom = 0.06, x = 0, y = -18 } = opts;
  const t = ip(frame, [0, duration], [0, 1], Easing.linear);
  return {
    scale: 1 + zoom * t,
    x: x * t,
    y: y * t,
  };
};

// ---------------------------------------------------------------------------
// texto
// ---------------------------------------------------------------------------

/** máquina de escrever: devolve o trecho visível e se o cursor deve piscar */
export const typewriter = (
  text: string,
  frame: number,
  delay: number,
  charsPerFrame = 0.9,
) => {
  const chars = Math.max(0, Math.floor((frame - delay) * charsPerFrame));
  const visible = text.slice(0, Math.min(chars, text.length));
  const done = chars >= text.length;
  const caretOn = Math.floor(frame / 8) % 2 === 0;
  return { visible, done, caret: !done || caretOn };
};

/** contador progressivo com easing */
export const countUp = (
  frame: number,
  delay: number,
  duration: number,
  to: number,
  from = 0,
  easing: (n: number) => number = EASE.out,
) => {
  const p = prog(frame, delay, duration, easing);
  return from + (to - from) * p;
};

/** formata número no padrão pt-BR (1.248) */
export const ptNumber = (n: number, decimals = 0) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

// ---------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------

/** progresso de desenho de path para stroke-dasharray/offset */
export const drawPath = (
  frame: number,
  delay: number,
  duration: number,
  length: number,
  easing: (n: number) => number = EASE.out,
) => {
  const p = prog(frame, delay, duration, easing);
  return {
    strokeDasharray: length,
    strokeDashoffset: length * (1 - p),
    progress: p,
  };
};
