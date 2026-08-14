import type { CSSProperties } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING } from "../config/theme";

export type SpringConfig = { damping: number; stiffness: number; mass: number };

/** Mola normalizada 0..1 com atraso em frames. */
export const useSpringIn = (delay = 0, config: SpringConfig = SPRING.smooth) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame, fps, delay, config });
};

export type EnterOpts = {
  delay?: number;
  /** deslocamento inicial em px */
  y?: number;
  x?: number;
  /** escala inicial (1 = sem escala) */
  scale?: number;
  /** rotacao inicial em graus */
  rotate?: number;
  /** desfoque inicial em px */
  blur?: number;
  fade?: boolean;
  config?: SpringConfig;
};

/**
 * Entrada premium padrao: mola combinando fade + slide + scale + rotate + blur.
 * Cada camada da cena usa a sua propria instancia, e por isso os elementos
 * internos animam de forma independente.
 */
export const useEnter = (o: EnterOpts = {}): CSSProperties => {
  const {
    delay = 0,
    y = 0,
    x = 0,
    scale = 1,
    rotate = 0,
    blur = 0,
    fade = true,
    config = SPRING.smooth,
  } = o;

  const p = useSpringIn(delay, config);
  const frame = useCurrentFrame();

  const opacity = fade
    ? interpolate(frame - delay, [0, 9], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const tx = x === 0 ? 0 : interpolate(p, [0, 1], [x, 0]);
  const ty = y === 0 ? 0 : interpolate(p, [0, 1], [y, 0]);
  const sc = scale === 1 ? 1 : interpolate(p, [0, 1], [scale, 1]);
  const rot = rotate === 0 ? 0 : interpolate(p, [0, 1], [rotate, 0]);
  const bl = blur === 0 ? 0 : interpolate(p, [0, 1], [blur, 0], { extrapolateRight: "clamp" });

  const transform = [
    tx || ty ? `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)` : "",
    rot ? `rotate(${rot.toFixed(2)}deg)` : "",
    sc !== 1 ? `scale(${sc.toFixed(4)})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    opacity,
    ...(transform ? { transform } : {}),
    ...(bl > 0.05 ? { filter: `blur(${bl.toFixed(2)}px)` } : {}),
  };
};

/** Progresso 0..1 com easing, para desenhar tracados e barras. */
export const useProgress = (delay: number, duration: number, easing = Easing.out(Easing.cubic)) => {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
};

/** Contador progressivo. */
export const useCountUp = (target: number, delay = 0, duration = 34) => {
  const p = useProgress(delay, duration, Easing.out(Easing.cubic));
  return target * p;
};

/** Flutuacao continua sutil (icones e cards decorativos). */
export const useFloat = (amp = 6, period = 90, phase = 0) => {
  const frame = useCurrentFrame();
  return Math.sin(((frame + phase) / period) * Math.PI * 2) * amp;
};

/** Pulso de escala continuo. */
export const usePulse = (amp = 0.03, period = 60, phase = 0) => {
  const frame = useCurrentFrame();
  return 1 + Math.sin(((frame + phase) / period) * Math.PI * 2) * amp;
};

/** Parallax vertical lento ligado ao avanco da cena. */
export const useParallax = (distance: number, duration: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, duration], [0, -distance], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/**
 * Saida da cena: encolhe e some nos ultimos frames, dando sensacao de
 * continuidade mesmo com transicao curta.
 */
export const useExit = (sceneDuration: number, frames = 16): CSSProperties => {
  const frame = useCurrentFrame();
  const start = sceneDuration - frames;
  const p = interpolate(frame, [start, sceneDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  if (p === 0) return {};
  return { transform: `scale(${1 - p * 0.05})`, opacity: 1 - p * 0.25 };
};

/** Atraso escalonado para listas. */
export const stagger = (index: number, base: number, step: number) => base + index * step;
