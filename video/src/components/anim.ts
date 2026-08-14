import { Easing, interpolate, random, spring } from 'remotion';
import { EASE, SPRINGS } from '../config/theme';

type Cubic = readonly [number, number, number, number];

export const bez = (c: Cubic) => Easing.bezier(c[0], c[1], c[2], c[3]);

/** interpolate com clamp nas duas pontas + curva bezier. */
export const tween = (
  frame: number,
  [inA, inB]: [number, number],
  [outA, outB]: [number, number],
  curve: Cubic = EASE.out,
) =>
  interpolate(frame, [inA, inB], [outA, outB], {
    easing: bez(curve),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Progresso 0..1 entre delay e delay+dur. */
export const prog = (
  frame: number,
  delay: number,
  dur: number,
  curve: Cubic = EASE.out,
) => tween(frame, [delay, delay + dur], [0, 1], curve);

export const springAt = (
  frame: number,
  fps: number,
  delay: number,
  config: (typeof SPRINGS)[keyof typeof SPRINGS] = SPRINGS.soft,
) => spring({ frame: frame - delay, fps, config });

/**
 * Entrada padrao do reel: sobe, revela, desfoca e assenta.
 * O blur decai mais rapido que o deslocamento — leitura de motion blur.
 */
export const revealUp = (
  frame: number,
  delay: number,
  dur = 26,
  distance = 90,
) => {
  const p = prog(frame, delay, dur, EASE.out);
  const pf = prog(frame, delay, dur * 0.55, EASE.out);
  return {
    opacity: pf,
    transform: `translate3d(0, ${(1 - p) * distance}px, 0)`,
    filter: `blur(${(1 - pf) * 14}px)`,
  };
};

/** Entrada lateral com leve rotacao — usada em cards. */
export const revealSide = (
  frame: number,
  delay: number,
  dur = 30,
  distance = 160,
  rotate = 4,
) => {
  const p = prog(frame, delay, dur, EASE.out);
  const pf = prog(frame, delay, dur * 0.5, EASE.out);
  return {
    opacity: pf,
    transform: `translate3d(${(1 - p) * distance}px, 0, 0) rotate(${(1 - p) * rotate}deg)`,
    filter: `blur(${(1 - pf) * 12}px)`,
  };
};

/** Escala com overshoot (mola) — pops de UI. */
export const popIn = (
  frame: number,
  fps: number,
  delay: number,
  config = SPRINGS.pop,
) => {
  const s = springAt(frame, fps, delay, config);
  return {
    opacity: prog(frame, delay, 8),
    transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
  };
};

/** Saida da cena — usada no ultimo terco de cada Sequence. */
export const exitOut = (
  frame: number,
  total: number,
  dur = 18,
  distance = -70,
) => {
  const start = total - dur;
  const p = tween(frame, [start, total], [0, 1], EASE.in);
  return {
    opacity: 1 - p,
    transform: `translate3d(0, ${p * distance}px, 0) scale(${1 - p * 0.04})`,
    filter: `blur(${p * 18}px)`,
  };
};

/** Deriva lenta de camera aplicada a cena inteira (parallax macro). */
export const cameraDrift = (
  frame: number,
  total: number,
  amount = 0.05,
  driftX = 0,
  driftY = -18,
) => {
  const p = frame / Math.max(1, total);
  return {
    transform: `scale(${1 + p * amount}) translate3d(${p * driftX}px, ${p * driftY}px, 0)`,
  };
};

/** Oscilacao continua — respiro de icones e brilhos. */
export const breathe = (frame: number, speed = 0.04, amp = 1, phase = 0) =>
  Math.sin(frame * speed + phase) * amp;

/** Ruido pseudo-aleatorio estavel por seed. */
export const rnd = (seed: string | number) => random(seed);

export const rndRange = (seed: string | number, a: number, b: number) =>
  a + random(seed) * (b - a);

/** Stagger classico: atraso por indice com curva opcional. */
export const stagger = (i: number, step = 4, curve = 1) =>
  Math.pow(i, curve) * step;

/**
 * Contador numerico com desaceleracao — os digitos "assentam" no fim.
 */
export const counter = (
  frame: number,
  delay: number,
  dur: number,
  to: number,
  from = 0,
) => {
  const p = prog(frame, delay, dur, EASE.out);
  return from + (to - from) * p;
};

export const fmtBRL = (v: number, decimals = 0) =>
  v.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const hexToRgb = (h: string): [number, number, number] => {
  const s = h.replace('#', '');
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
};

/** Mistura duas cores hex (t=0 -> a, t=1 -> b). */
export const mixHex = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const k = Math.min(1, Math.max(0, t));
  const m = (x: number, y: number) => Math.round(x + (y - x) * k);
  return `rgb(${m(r1, r2)}, ${m(g1, g2)}, ${m(b1, b2)})`;
};

/** Efeito de digitacao com cursor. */
export const typewriter = (
  frame: number,
  delay: number,
  text: string,
  cps = 26,
  fps = 60,
) => {
  const elapsed = Math.max(0, frame - delay) / fps;
  const n = Math.min(text.length, Math.floor(elapsed * cps));
  return {
    shown: text.slice(0, n),
    done: n >= text.length,
    caret: Math.floor((frame - delay) / 16) % 2 === 0,
  };
};

/** Piscada de glitch: 1 em alguns frames especificos. */
export const glitchPulse = (frame: number, at: number, len = 8) => {
  if (frame < at || frame > at + len) return 0;
  const p = (frame - at) / len;
  return (1 - p) * (random(`g${frame}`) > 0.35 ? 1 : 0.25);
};
