/**
 * Curvas e helpers de animação.
 *
 * As curvas são as mesmas usadas em motion design de After Effects
 * (expo/quint/back/circ) — springs do Remotion entram onde é preciso
 * peso físico, e as curvas fechadas onde é preciso timing exato.
 */
import { interpolate, spring, Easing } from "remotion";
import { VIDEO } from "../config/theme";

export const EASE = {
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  outQuint: Easing.bezier(0.22, 1, 0.36, 1),
  outCirc: Easing.bezier(0.08, 0.82, 0.17, 1),
  outBack: Easing.bezier(0.34, 1.56, 0.64, 1),
  inOutCubic: Easing.bezier(0.65, 0, 0.35, 1),
  inOutExpo: Easing.bezier(0.87, 0, 0.13, 1),
  inQuart: Easing.bezier(0.5, 0, 0.75, 0),
  outSoft: Easing.bezier(0.25, 0.46, 0.45, 0.94),
} as const;

type Opts = {
  ease?: (n: number) => number;
  clamp?: boolean;
};

/** Interpolação 0→1 entre dois frames, com clamp e easing por padrão. */
export const tween = (
  frame: number,
  from: number,
  to: number,
  opts: Opts = {},
) =>
  interpolate(frame, [from, to], [0, 1], {
    easing: opts.ease ?? EASE.outExpo,
    extrapolateLeft: opts.clamp === false ? "extend" : "clamp",
    extrapolateRight: opts.clamp === false ? "extend" : "clamp",
  });

/** Mapeia um progresso 0→1 para qualquer faixa de valores. */
export const map = (p: number, a: number, b: number) => a + (b - a) * p;

/** Entra e sai: sobe até 1 no meio da janela e volta a 0. */
export const pulse = (
  frame: number,
  start: number,
  peak: number,
  end: number,
) =>
  interpolate(frame, [start, peak, end], [0, 1, 0], {
    easing: EASE.outSoft,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export type SpringPreset = "snappy" | "soft" | "bouncy" | "heavy" | "punch";

const PRESETS: Record<SpringPreset, { damping: number; mass: number; stiffness: number }> = {
  snappy: { damping: 18, mass: 0.6, stiffness: 150 },
  soft: { damping: 22, mass: 1.0, stiffness: 90 },
  bouncy: { damping: 11, mass: 0.7, stiffness: 170 },
  heavy: { damping: 26, mass: 1.6, stiffness: 120 },
  punch: { damping: 14, mass: 0.45, stiffness: 260 },
};

/** Spring do Remotion com presets nomeados e delay em frames. */
export const spr = (
  frame: number,
  delay = 0,
  preset: SpringPreset = "snappy",
) =>
  spring({
    frame: frame - delay,
    fps: VIDEO.fps,
    config: PRESETS[preset],
  });

/**
 * Aproximação de motion blur: devolve o blur em px proporcional à
 * velocidade do valor animado. Aplicar como `filter: blur(Npx)`.
 */
export const velocityBlur = (
  frame: number,
  sample: (f: number) => number,
  scale = 0.06,
  max = 18,
) => {
  const v = Math.abs(sample(frame) - sample(frame - 1));
  return Math.min(v * scale, max);
};

/** Delay escalonado para listas (stagger). */
export const stagger = (index: number, step = 4, base = 0) => base + index * step;

/** Oscilação contínua — respiração de ícones e elementos parados. */
export const idle = (frame: number, speed = 0.04, amp = 1) =>
  Math.sin(frame * speed) * amp;

/** Ruído 1D suave e determinístico, para trepidação orgânica. */
export const wobble = (frame: number, seed = 0, speed = 0.06, amp = 1) =>
  (Math.sin(frame * speed + seed * 12.9898) * 0.6 +
    Math.sin(frame * speed * 2.3 + seed * 78.233) * 0.4) *
  amp;

/** Shake decrescente disparado por impacto. */
export const impactShake = (
  frame: number,
  at: number,
  duration = 14,
  amp = 10,
) => {
  if (frame < at || frame > at + duration) return { x: 0, y: 0, rot: 0 };
  const p = (frame - at) / duration;
  const decay = (1 - p) ** 2;
  return {
    x: Math.sin(p * Math.PI * 9) * amp * decay,
    y: Math.cos(p * Math.PI * 7) * amp * 0.6 * decay,
    rot: Math.sin(p * Math.PI * 11) * amp * 0.12 * decay,
  };
};
