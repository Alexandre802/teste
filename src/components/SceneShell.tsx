import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TRANSITION_FRAMES } from "../config/timeline";
import { EASE, ip } from "../lib/anim";

export type TransitionKind = "zoom" | "push" | "riseBlur" | "punch";

/**
 * Casca de cena: cuida da transição de entrada/saída e do movimento de câmera.
 * A cena renderiza `duration + TRANSITION_FRAMES` frames — os últimos
 * TRANSITION_FRAMES são a sobreposição com a cena seguinte (cross-dissolve).
 */
export const SceneShell: React.FC<{
  duration: number;
  children: React.ReactNode;
  background: React.ReactNode;
  /** entrada da cena (a primeira cena não anima entrada) */
  enter?: TransitionKind | "none";
  exit?: TransitionKind;
  /** movimento lento de câmera aplicado ao conteúdo inteiro */
  cameraZoom?: number;
  cameraX?: number;
  cameraY?: number;
  transitionFrames?: number;
  style?: React.CSSProperties;
}> = ({
  duration,
  children,
  background,
  enter = "zoom",
  exit = "zoom",
  cameraZoom = 0.05,
  cameraX = 0,
  cameraY = -14,
  transitionFrames = TRANSITION_FRAMES,
  style,
}) => {
  const frame = useCurrentFrame();
  const T = transitionFrames;

  // --- entrada -------------------------------------------------------------
  const eIn = enter === "none" ? 1 : ip(frame, [0, T], [0, 1], EASE.out);
  const inv = 1 - eIn;

  // Regra: as escalas de entrada/saída ficam sempre >= 1 para que as bordas do
  // quadro nunca revelem o fundo por baixo durante o cross-dissolve.
  let inScale = 1;
  let inX = 0;
  let inY = 0;
  let inBlur = 0;
  if (enter === "zoom") {
    inScale = 1 + inv * 0.1;
    inBlur = inv * 12;
  } else if (enter === "push") {
    inX = inv * 96;
    inScale = 1 + inv * 0.14;
    inBlur = inv * 9;
  } else if (enter === "riseBlur") {
    inY = inv * 110;
    inScale = 1 + inv * 0.16;
    inBlur = inv * 14;
  } else if (enter === "punch") {
    inScale = 1 + inv * 0.2;
    inBlur = inv * 11;
  }

  // --- saída ---------------------------------------------------------------
  const eOut = ip(frame, [duration, duration + T], [0, 1], EASE.inOut);
  let outScale = 1;
  let outX = 0;
  let outY = 0;
  let outBlur = 0;
  if (exit === "zoom") {
    outScale = 1 + eOut * 0.14;
    outBlur = eOut * 14;
  } else if (exit === "push") {
    outX = -eOut * 110;
    outScale = 1 + eOut * 0.12;
    outBlur = eOut * 11;
  } else if (exit === "riseBlur") {
    outY = -eOut * 130;
    outScale = 1 + eOut * 0.14;
    outBlur = eOut * 16;
  } else if (exit === "punch") {
    outScale = 1 + eOut * 0.22;
    outBlur = eOut * 15;
  }

  // --- câmera --------------------------------------------------------------
  const camT = ip(frame, [0, duration + T], [0, 1], (n) => n);
  const camScale = 1 + cameraZoom * camT;
  const camX = cameraX * camT;
  const camY = cameraY * camT;

  const opacity = Math.min(eIn, 1 - eOut);

  return (
    <AbsoluteFill style={{ opacity, ...style }}>
      <AbsoluteFill
        style={{
          transform: [
            `translate(${inX + outX}px, ${inY + outY}px)`,
            `scale(${inScale * outScale})`,
          ].join(" "),
          filter: inBlur + outBlur > 0.05 ? `blur(${inBlur + outBlur}px)` : undefined,
        }}
      >
        {/* fundo: recebe só a câmera (parallax mais lento) */}
        <AbsoluteFill
          style={{
            transform: `scale(${1 + (camScale - 1) * 0.45}) translate(${camX * 0.35}px, ${camY * 0.35}px)`,
          }}
        >
          {background}
        </AbsoluteFill>
        {/* conteúdo */}
        <AbsoluteFill
          style={{
            transform: `scale(${camScale}) translate(${camX}px, ${camY}px)`,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Palavra de headline com revelação por máscara + deslize.
 * Cada palavra é uma camada independente (pode receber delay próprio).
 */
export const RevealText: React.FC<{
  children: React.ReactNode;
  delay: number;
  frame: number;
  fps: number;
  duration?: number;
  /** distância do deslize vertical */
  rise?: number;
  style?: React.CSSProperties;
  from?: "bottom" | "left";
  blur?: number;
}> = ({ children, delay, frame, duration = 18, rise = 0.9, style, from = "bottom", blur = 8 }) => {
  const p = ip(frame, [delay, delay + duration], [0, 1], EASE.out);
  // Quando a revelação termina, o clip sai de cena: se ele continuasse ativo,
  // recortaria o brilho (text-shadow) num retângulo visível.
  const clip =
    p >= 1
      ? undefined
      : from === "bottom"
        ? `inset(${(1 - p) * 108}% 0% -30% 0%)`
        : `inset(-30% ${(1 - p) * 104}% -30% 0%)`;
  return (
    <div
      style={{
        clipPath: clip,
        WebkitClipPath: clip,
        transform:
          from === "bottom"
            ? `translateY(${(1 - p) * rise * 100}px)`
            : `translateX(${(1 - p) * -60}px)`,
        filter: p < 1 ? `blur(${(1 - p) * blur}px)` : undefined,
        willChange: "transform, clip-path",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
