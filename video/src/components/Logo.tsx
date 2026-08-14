import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, LOGO_BARS, SPRINGS } from '../config/theme';
import { prog, springAt } from './anim';

/**
 * Simbolo + wordmark Monttra reconstruidos em vetor a partir do logo original.
 * As 5 barras sao camadas independentes e podem ser animadas uma a uma.
 */
export const LogoMark: React.FC<{
  size: number;
  delay?: number;
  animate?: boolean;
  glow?: boolean;
}> = ({ size, delay = 0, animate = true, glow = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const unit = size / 82;

  return (
    <svg
      width={81 * unit}
      height={82 * unit}
      viewBox="0 0 81 82"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        {LOGO_BARS.map((b, i) => (
          <linearGradient key={i} id={`lg${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={b.top} />
            <stop offset="100%" stopColor={b.bottom} />
          </linearGradient>
        ))}
        <filter id="logoGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={glow ? 'url(#logoGlow)' : undefined}>
        {LOGO_BARS.map((b, i) => {
          const s = animate
            ? springAt(frame, fps, delay + i * 3, SPRINGS.snappy)
            : 1;
          const h = b.h * Math.min(1, Math.max(0.001, s));
          return (
            <rect
              key={i}
              x={b.x}
              y={b.y + (b.h - h)}
              width={b.w}
              height={h}
              rx={2.6}
              fill={`url(#lg${i})`}
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
        gap: size * 0.225,
        ...style,
      }}
    >
      <LogoMark size={size} delay={delay} animate={animate} glow={glow} />
      <div
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 600,
          fontSize: size * 0.9,
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

/** Logo fixo no topo, como nas artes de referencia. */
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
