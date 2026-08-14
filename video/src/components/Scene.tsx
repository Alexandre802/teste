import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE } from '../config/theme';
import { tween } from './anim';

/**
 * Invólucro de cena.
 *
 * Aplica: avanço de câmera (push-in contínuo), uma micro-oscilação de mão
 * livre para nada ficar estático, e a saída em "punch" — a cena encolhe e
 * borra rápido enquanto a próxima entra por cima, ampliada.
 */
export const Scene: React.FC<{
  children: React.ReactNode;
  total: number;
  zoom?: number;
  driftX?: number;
  driftY?: number;
  exitDur?: number;
  exitScale?: number;
  exitBlur?: number;
  /** amplitude da oscilação contínua (px) */
  handheld?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  total,
  zoom = 0.08,
  driftX = 0,
  driftY = -22,
  exitDur = 11,
  exitScale = 0.26,
  exitBlur = 34,
  handheld = 3,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = frame / Math.max(1, total);
  const e = tween(frame, [total - exitDur, total], [0, 1], EASE.in);

  const hx = Math.sin(frame * 0.021) * handheld;
  const hy = Math.cos(frame * 0.017) * handheld * 0.7;

  const scale = 1 + p * zoom - e * exitScale;
  const blurring = e > 0.001;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translate3d(${p * driftX + hx}px, ${p * driftY + hy}px, 0)`,
        opacity: 1 - e * 0.85,
        filter: blurring ? `blur(${e * exitBlur}px)` : undefined,
        transformOrigin: 'center center',
        willChange: 'transform, filter',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Coluna de conteúdo com as margens das artes de referência. */
export const Stack: React.FC<{
  children: React.ReactNode;
  top?: number;
  left?: number;
  right?: number;
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end';
  justify?: React.CSSProperties['justifyContent'];
  style?: React.CSSProperties;
}> = ({
  children,
  top = 0,
  left = 118,
  right = 90,
  gap = 0,
  align = 'flex-start',
  justify,
  style,
}) => (
  <AbsoluteFill
    style={{
      paddingLeft: left,
      paddingRight: right,
      paddingTop: top,
      display: 'flex',
      flexDirection: 'column',
      alignItems: align,
      justifyContent: justify,
      gap,
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);
