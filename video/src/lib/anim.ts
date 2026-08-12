import { Easing, interpolate, spring } from 'remotion';
import { FPS } from '../timeline';

/** Curvas de easing usadas no projeto (padrão "premium"/UI motion). */
export const EASE = {
  /** Saída suave, entrada rápida — bom para entradas de UI. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Aceleração forte na saída de elementos. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** Leve overshoot sem mola. */
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  linear: Easing.linear,
};

export const SPRING = {
  /** Mola macia, sem overshoot perceptível. */
  soft: { damping: 200, stiffness: 110, mass: 0.9 },
  /** Entrada com pequeno overshoot. */
  pop: { damping: 14, stiffness: 190, mass: 0.7 },
  /** Overshoot marcado, para pops de ícone. */
  bouncy: { damping: 10, stiffness: 220, mass: 0.6 },
  /** Rápida e seca. */
  snap: { damping: 26, stiffness: 340, mass: 0.7 },
};

type SpringOpts = {
  delay?: number;
  config?: (typeof SPRING)['soft'];
  durationInFrames?: number;
};

/** spring() já amarrado ao fps do projeto. */
export const s = (frame: number, opts: SpringOpts = {}) =>
  spring({
    frame: frame - (opts.delay ?? 0),
    fps: FPS,
    config: opts.config ?? SPRING.soft,
    durationInFrames: opts.durationInFrames,
  });

/** Progresso 0→1 com easing, entre dois frames. */
export const p = (
  frame: number,
  from: number,
  to: number,
  easing = EASE.out,
) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Interpolação com clamp nas duas pontas. */
export const iv = (
  frame: number,
  range: [number, number],
  out: [number, number],
  easing = EASE.out,
) =>
  interpolate(frame, range, out, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Atraso escalonado (stagger) para listas. */
export const stagger = (index: number, per = 5, base = 0) => base + index * per;

export type EnterOpts = {
  delay?: number;
  /** Deslocamento inicial em px. */
  y?: number;
  x?: number;
  /** Escala inicial. */
  scale?: number;
  rotate?: number;
  config?: (typeof SPRING)['soft'];
  /** Frames de fade. */
  fade?: number;
};

export type Entered = {
  opacity: number;
  transform: string;
  progress: number;
};

/**
 * Entrada padrão: mola em translate/scale + fade curto.
 * Devolve `style`-ready values para aplicar em qualquer camada.
 */
export const enter = (frame: number, o: EnterOpts = {}): Entered => {
  const delay = o.delay ?? 0;
  const prog = s(frame, { delay, config: o.config ?? SPRING.pop });
  const opacity = iv(frame, [delay, delay + (o.fade ?? 8)], [0, 1], EASE.out);
  const ty = (o.y ?? 0) * (1 - prog);
  const tx = (o.x ?? 0) * (1 - prog);
  const sc = o.scale === undefined ? 1 : o.scale + (1 - o.scale) * prog;
  const rot = (o.rotate ?? 0) * (1 - prog);
  return {
    opacity,
    progress: prog,
    transform: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${sc.toFixed(4)}) rotate(${rot.toFixed(2)}deg)`,
  };
};

/** Saída: encolhe e sobe levemente nos últimos frames da cena. */
export const exitOut = (frame: number, dur: number, len = 14) => {
  const t = p(frame, dur - len, dur, EASE.in);
  return {
    opacity: 1 - t,
    transform: `translate3d(0, ${(-30 * t).toFixed(2)}px, 0) scale(${(1 - 0.05 * t).toFixed(4)})`,
  };
};

/** Oscilação suave e contínua (respiração/float). */
export const float = (frame: number, amp = 6, periodFrames = 90, phase = 0) =>
  Math.sin(((frame + phase) / periodFrames) * Math.PI * 2) * amp;

/** Pulso que decai — para "batidas" em ícones e números. */
export const pulse = (frame: number, at: number, amp = 0.12, len = 18) => {
  if (frame < at) return 0;
  const t = Math.min(1, (frame - at) / len);
  return Math.sin(t * Math.PI) * (1 - t) * amp * 2;
};

/** Efeito máquina de escrever. */
export const typewriter = (
  text: string,
  frame: number,
  start: number,
  charsPerFrame = 0.9,
) => {
  const n = Math.floor(Math.max(0, frame - start) * charsPerFrame);
  return text.slice(0, Math.min(text.length, n));
};

/** Quantidade de caracteres já digitados (para cursores e SFX). */
export const typedChars = (frame: number, start: number, cpf = 0.9) =>
  Math.max(0, Math.floor((frame - start) * cpf));

/** Contador numérico com easing. */
export const countTo = (
  frame: number,
  value: number,
  start: number,
  len = 34,
) => Math.round(iv(frame, [start, start + len], [0, value], EASE.out));

/** Divide um texto em palavras preservando espaços para animação individual. */
export const words = (t: string) => t.split(' ').filter(Boolean);
