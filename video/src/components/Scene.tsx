import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE } from '../config/theme';
import { tween } from './anim';

/**
 * Invólucro de cena: aplica deriva de câmera (parallax macro) e a saída,
 * para que todas as cenas compartilhem o mesmo comportamento.
 */
export const Scene: React.FC<{
  children: React.ReactNode;
  total: number;
  zoom?: number;
  driftX?: number;
  driftY?: number;
  exitDur?: number;
  exitY?: number;
  exitScale?: number;
  exitBlur?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  total,
  zoom = 0.05,
  driftX = 0,
  driftY = -16,
  exitDur = 16,
  exitY = -90,
  exitScale = 0.05,
  exitBlur = 20,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = frame / Math.max(1, total);
  const e = tween(frame, [total - exitDur, total], [0, 1], EASE.in);
  const blurring = e > 0.001;
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 + p * zoom - e * exitScale}) translate3d(${p * driftX}px, ${p * driftY + e * exitY}px, 0)`,
        // não some por completo: a cena seguinte entra por cima em dissolução,
        // então zerar a opacidade aqui deixaria um quadro vazio no corte
        opacity: 1 - e * 0.7,
        filter: blurring ? `blur(${e * exitBlur}px)` : undefined,
        transformOrigin: 'center center',
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
