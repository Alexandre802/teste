import React from 'react';
import { EASE, iv } from '../../lib/anim';

export type CursorKey = { at: number; x: number; y: number };

/** Posição do cursor num frame, interpolando entre os pontos do percurso. */
export const cursorAt = (frame: number, keys: CursorKey[]) => {
  if (keys.length === 0) return { x: 540, y: 960 };
  let i = 0;
  while (i < keys.length - 1 && frame >= keys[i + 1].at) i += 1;
  const a = keys[i];
  const b = keys[Math.min(keys.length - 1, i + 1)];
  if (a === b) return { x: a.x, y: a.y };
  const t = iv(frame, [a.at, b.at], [0, 1], EASE.inOut);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

/**
 * Cursor do walkthrough: seta clara com contorno, encolhe no clique e solta
 * um anel que se expande. O `hover` é um leve pré-aviso antes do clique.
 */
export const Cursor: React.FC<{
  x: number;
  y: number;
  frame: number;
  /** Frames em que acontece um clique. */
  clicks: number[];
  appearAt?: number;
  scale?: number;
}> = ({ x, y, frame, clicks, appearAt = 0, scale = 1 }) => {
  const nearest = clicks.reduce<number | null>(
    (acc, c) => (frame >= c - 6 && frame < c + 16 ? c : acc),
    null,
  );

  const press =
    nearest !== null && frame >= nearest && frame < nearest + 5
      ? 0.82
      : nearest !== null && frame >= nearest - 6 && frame < nearest
        ? 0.94 // pequena antecipação (hover)
        : 1;

  const ripple = nearest !== null && frame >= nearest ? (frame - nearest) / 16 : -1;
  const appear = iv(frame, [appearAt, appearAt + 8], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${(appear * scale).toFixed(3)})`,
        transformOrigin: '0 0',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {ripple >= 0 && ripple <= 1 ? (
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: 6,
            width: 26,
            height: 26,
            marginLeft: -13,
            marginTop: -13,
            borderRadius: '50%',
            border: '3px solid rgba(75,69,241,0.85)',
            transform: `scale(${1 + ripple * 3.6})`,
            opacity: 1 - ripple,
          }}
        />
      ) : null}

      <svg
        width={54}
        height={54}
        viewBox="0 0 32 32"
        style={{
          transform: `scale(${press})`,
          transformOrigin: '4px 3px',
          filter: 'drop-shadow(0 6px 14px rgba(16,24,40,0.35))',
        }}
      >
        <path
          d="M 4 2 L 4 24 L 9.6 18.6 L 13.4 27 L 17.6 25.1 L 13.9 17 L 21.6 16.6 Z"
          fill="#FFFFFF"
          stroke="#101828"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
