/**
 * Presets de animacao.
 *
 * As curvas de entrada seguem as keyframes classicas do animate.css
 * (fadeInUp, zoomIn, backInDown, bounceIn) portadas para interpolacao por
 * quadro do Remotion, com molas para o "peso" fisico.
 */
import { interpolate, spring, Easing } from "remotion";
import { SPRING } from "../config";

export type Sp = keyof typeof SPRING;

/** Mola normalizada 0..1 com atraso em quadros. */
export const sp = (frame: number, fps: number, delay = 0, kind: Sp = "soft") =>
  spring({ frame: frame - delay, fps, config: SPRING[kind] });

/** Rampa linear 0..1 entre dois quadros, com easing. */
export const ramp = (
  frame: number,
  from: number,
  to: number,
  easing = Easing.bezier(0.22, 1, 0.36, 1)
) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Vai a 1 e volta a 0 (para brilhos, flashes e pulsos). */
export const pulse = (frame: number, at: number, up = 3, down = 12) =>
  frame < at
    ? 0
    : frame < at + up
      ? ramp(frame, at, at + up, Easing.out(Easing.quad))
      : 1 - ramp(frame, at + up, at + up + down, Easing.in(Easing.quad));

const px = (v: number) => `${v}px`;

export type Enter = { opacity: number; transform: string; filter?: string };

/** fadeInUp: sobe e aparece. `dist` negativo faz descer. */
export const fadeInUp = (p: number, dist = 60): Enter => ({
  opacity: Math.min(1, p * 1.4),
  transform: `translate3d(0,${px((1 - p) * dist)},0)`,
});

/** zoomIn com leve overshoot (a mola ja passa de 1 e volta). */
export const zoomIn = (p: number, from = 0.72): Enter => ({
  opacity: Math.min(1, p * 2),
  transform: `scale(${from + (1 - from) * p})`,
});

/** backInDown: cai de cima ainda pequeno e so entao cresce. */
export const backInDown = (p: number, dist = 420): Enter => {
  const drop = interpolate(p, [0, 0.8], [-dist, 0], { extrapolateRight: "clamp" });
  const sc = interpolate(p, [0.72, 1], [0.72, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    opacity: interpolate(p, [0, 0.12, 0.75, 1], [0, 0.75, 0.75, 1]),
    transform: `translate3d(0,${px(drop)},0) scale(${sc})`,
  };
};

/** Entrada lateral com rotacao em Y - da profundidade sem 3D real. */
export const slideIn3d = (p: number, dir: -1 | 1 = 1, dist = 260): Enter => ({
  opacity: Math.min(1, p * 1.6),
  transform: `perspective(1400px) translate3d(${px((1 - p) * dist * dir)},0,0) rotateY(${
    (1 - p) * -14 * dir
  }deg) scale(${0.9 + 0.1 * p})`,
});

/** "Pop" de UI: escala com overshoot, para icones, badges e cards. */
export const popIn = (p: number, from = 0.55): Enter => ({
  opacity: Math.min(1, p * 2.4),
  transform: `scale(${from + (1 - from) * p})`,
});

/**
 * Notificacao no estilo iOS: desce de cima, com um pouco de escala e
 * desfoque que some - e o gesto que o iPhone faz ao receber um alerta.
 */
export const iosNotif = (p: number, dist = 190): Enter => ({
  opacity: Math.min(1, p * 2.2),
  transform: `translate3d(0,${px((1 - p) * -dist)},0) scale(${0.86 + 0.14 * p})`,
  filter: `blur(${(1 - Math.min(1, p * 1.6)) * 7}px)`,
});

/** Batida seca: entra grande e desfocado e assenta - para frases de impacto. */
export const slam = (p: number, from = 1.55): Enter => ({
  opacity: Math.min(1, p * 3),
  transform: `scale(${from - (from - 1) * p})`,
  filter: `blur(${(1 - p) * 16}px)`,
});

/** Junta varios presets no mesmo elemento sem perder nenhum transform. */
export const merge = (...list: Enter[]): Enter => ({
  opacity: list.reduce((a, e) => a * e.opacity, 1),
  transform: list.map((e) => e.transform).join(" "),
  filter: list.map((e) => e.filter).filter(Boolean).join(" ") || undefined,
});

/** Flutuacao continua (respiro). Mantem a cena viva mesmo parada. */
export const float = (frame: number, ampX = 4, ampY = 6, speed = 1, phase = 0) => {
  const t = (frame / 30) * speed + phase;
  return `translate3d(${(Math.sin(t * 1.7) * ampX).toFixed(2)}px,${(
    Math.cos(t * 1.3) * ampY
  ).toFixed(2)}px,0)`;
};

/** Paralaxe leve conforme a cena avanca - camadas em profundidades diferentes. */
export const parallax = (progress: number, depth: number) =>
  `translate3d(0,${(progress * depth).toFixed(2)}px,0)`;

/** Indice -> atraso, para entradas em cascata (stagger). */
export const stagger = (i: number, step: number, base = 0) => base + i * step;

/**
 * Revela um traco (linha do rastreio) de cima para baixo.
 * Devolve o clip-path e a posicao da cabeca luminosa.
 */
export const drawLine = (p: number) => ({
  clipPath: `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0)`,
  head: p,
});
