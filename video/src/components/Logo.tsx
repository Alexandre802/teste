import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, SPRINGS } from '../config/theme';
import { prog, springAt } from './anim';

/**
 * Símbolo Monttra — quatro barras, as das pontas com o topo inclinado.
 * Geometria e cores medidas sobre o arquivo de logo enviado pelo cliente
 * (caixa original 1178x1005), reconstruídas em vetor para que cada barra
 * possa crescer de forma independente.
 */
type Bar = {
  x: number;
  w: number;
  /** topo na borda esquerda e na direita — iguais nas barras retas */
  tl: number;
  tr: number;
  bottom: number;
  color: string;
};

const BARS: Bar[] = [
  { x: 2, w: 269, tl: 410, tr: 301, bottom: 992, color: '#66DDBD' },
  { x: 295, w: 284, tl: 14, tr: 14, bottom: 1004, color: '#0CBE8A' },
  { x: 603, w: 284, tl: 13, tr: 13, bottom: 998, color: '#038654' },
  { x: 912, w: 264, tl: 299, tr: 379, bottom: 998, color: '#005327' },
];

const BOX = { w: 1178, h: 1005 };
const RADIUS = 44;

type P = [number, number];

/** Polígono com cantos arredondados — serve tanto para as barras retas
 *  quanto para as que têm o topo em diagonal. */
const roundedPoly = (pts: P[], r: number): string => {
  const n = pts.length;
  const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
  const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
  const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
  const len = (a: P) => Math.hypot(a[0], a[1]) || 1;

  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const e1 = sub(p0, p1);
    const e2 = sub(p2, p1);
    const rr = Math.min(r, len(e1) / 2, len(e2) / 2);
    const a = add(p1, mul(e1, rr / len(e1)));
    const b = add(p1, mul(e2, rr / len(e2)));
    d += i === 0 ? `M ${a[0]} ${a[1]}` : ` L ${a[0]} ${a[1]}`;
    d += ` Q ${p1[0]} ${p1[1]} ${b[0]} ${b[1]}`;
  }
  return `${d} Z`;
};

const barPath = (b: Bar): string =>
  roundedPoly(
    [
      [b.x, b.tl],
      [b.x + b.w, b.tr],
      [b.x + b.w, b.bottom],
      [b.x, b.bottom],
    ],
    RADIUS,
  );

export const LogoMark: React.FC<{
  size: number;
  delay?: number;
  animate?: boolean;
  glow?: boolean;
}> = ({ size, delay = 0, animate = true, glow = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const unit = size / BOX.h;

  return (
    <svg
      width={BOX.w * unit}
      height={size}
      viewBox={`0 0 ${BOX.w} ${BOX.h}`}
      style={{ overflow: 'visible', display: 'block' }}
    >
      {glow && (
        <defs>
          <filter id="logoGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="18" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g filter={glow ? 'url(#logoGlow)' : undefined}>
        {BARS.map((b, i) => {
          // cada barra cresce a partir da base
          const s = animate
            ? Math.min(1, Math.max(0.001, springAt(frame, fps, delay + i * 3, SPRINGS.snappy)))
            : 1;
          return (
            <path
              key={i}
              d={barPath(b)}
              fill={b.color}
              style={{
                transformOrigin: `${b.x + b.w / 2}px ${b.bottom}px`,
                transform: `scaleY(${s})`,
              }}
            />
          );
        })}
      </g>
    </svg>
  );
};

export const Logo: React.FC<{
  size?: number;
  color?: string;
  delay?: number;
  animate?: boolean;
  glow?: boolean;
  style?: React.CSSProperties;
}> = ({
  size = 74,
  color = COLORS.ink,
  delay = 0,
  animate = true,
  glow = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = animate ? prog(frame, delay + 6, 22) : 1;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.3,
        ...style,
      }}
    >
      <LogoMark size={size} delay={delay} animate={animate} glow={glow} />
      <div
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 600,
          fontSize: size * 0.96,
          letterSpacing: '-0.028em',
          color,
          lineHeight: 1,
          opacity: p,
          transform: `translateX(${(1 - p) * -14}px)`,
          clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
          paddingBottom: size * 0.04,
        }}
      >
        Monttra
      </div>
    </div>
  );
};

/** Logo fixo no topo, como nas artes de referência. */
export const LogoHeader: React.FC<{
  delay?: number;
  color?: string;
  size?: number;
  glow?: boolean;
}> = ({ delay = 0, color = COLORS.ink, size = 66, glow = false }) => (
  <Logo
    size={size}
    color={color}
    delay={delay}
    glow={glow}
    style={{ position: 'absolute', left: 72, top: 78 }}
  />
);
