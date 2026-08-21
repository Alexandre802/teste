/**
 * Curvas de tempo. Nada aqui toca a arte - so produz numeros que viram
 * mascara, camera ou brilho.
 *
 * As curvas de entrada e saida seguem o feitio das keyframes classicas do
 * animate.css, portadas para interpolacao por quadro do Remotion.
 */
import { interpolate, Easing } from "remotion";
import { type SceneConfig } from "../config";

/** Rampa 0..1 entre dois quadros, com desaceleracao no fim. */
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

/**
 * Varredura em degraus: a borda salta de marca em marca e pausa. Da o ritmo
 * de "chegando um a um" sem precisar recortar nada da arte.
 * Devolve a posicao atual (na unidade das marcas, normalmente pixels em y).
 */
export const stepWipe = (
  frame: number,
  from: number,
  marks: { at: number; to: number }[],
  dur = 10
) => {
  let v = from;
  marks.forEach((m) => {
    v += (m.to - v) * ramp(frame, m.at, m.at + dur);
  });
  return v;
};

/** Vai a 1 e volta a 0 - brilhos, claroes e batidas. */
export const pulse = (frame: number, at: number, up = 3, down = 12) =>
  frame < at
    ? 0
    : frame < at + up
      ? ramp(frame, at, at + up, Easing.out(Easing.quad))
      : 1 - ramp(frame, at + up, at + up + down, Easing.in(Easing.quad));

/**
 * Batida de escala que NUNCA desce abaixo de 1. Assim o elemento sempre
 * cobre o proprio lugar - nao abre buraco nem deixa copia por baixo.
 */
export const punch = (frame: number, at: number, peak = 1.12, up = 3, down = 14) =>
  1 + (peak - 1) * pulse(frame, at, up, down);

/** Movimento de camera da cena: um empurrao lento, definido no config. */
export const camera = (frame: number, cfg: SceneConfig, extra = "") => {
  const z =
    cfg.bgZoom[0] + (cfg.bgZoom[1] - cfg.bgZoom[0]) * ramp(frame, 0, cfg.duration, Easing.linear);
  return `scale(${z.toFixed(4)}) ${extra}`.trim();
};

/** Aproximacao pontual num ponto do quadro (zoom dirigido). */
export const pushTo = (
  frame: number,
  keys: [number, number, number, number],
  zoom: number,
  focus: [number, number],
  hold = 1
) => {
  const z = interpolate(frame, keys, [1, zoom, zoom, hold], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const k = (z - 1) / (zoom - 1 || 1);
  const dx = (540 - focus[0]) * k * 0.38;
  const dy = (960 - focus[1]) * k * 0.38;
  return `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) scale(${z.toFixed(4)})`;
};
