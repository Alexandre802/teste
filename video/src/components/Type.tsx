import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, EASE, FONTS } from '../config/theme';
import { prog, tween } from './anim';

export type Tone = 'ink' | 'green' | 'teal' | 'white' | 'neon' | 'deep' | 'gray';

export const toneColor = (t: Tone): string =>
  ({
    ink: COLORS.ink,
    green: COLORS.green,
    teal: COLORS.greenTeal,
    white: COLORS.white,
    neon: COLORS.greenNeon,
    deep: COLORS.greenDeep,
    gray: COLORS.gray,
  })[t];

/**
 * Revelacao com mascara: o texto sobe de dentro de uma faixa recortada.
 * E o gesto tipografico base do reel (equivalente a um track matte no AE).
 */
export const MaskReveal: React.FC<{
  delay?: number;
  dur?: number;
  distance?: number;
  rotate?: number;
  skew?: number;
  blur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  innerStyle?: React.CSSProperties;
}> = ({
  delay = 0,
  dur = 30,
  distance = 108,
  rotate = 0,
  skew = 0,
  blur = 10,
  children,
  style,
  innerStyle,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.out);
  const pf = prog(frame, delay, dur * 0.45, EASE.out);
  return (
    <div
      style={{
        overflow: 'hidden',
        paddingBottom: '0.18em',
        marginBottom: '-0.18em',
        paddingLeft: '0.06em',
        marginLeft: '-0.06em',
        ...style,
      }}
    >
      <div
        style={{
          transform: `translate3d(0, ${(1 - p) * distance}%, 0) rotate(${(1 - p) * rotate}deg) skewY(${(1 - p) * skew}deg)`,
          filter: blur ? `blur(${(1 - pf) * blur}px)` : undefined,
          opacity: 0.15 + pf * 0.85,
          ...innerStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Uma linha de manchete. */
export const Line: React.FC<{
  children: React.ReactNode;
  size: number;
  tone?: Tone;
  family?: string;
  weight?: number;
  delay?: number;
  dur?: number;
  tracking?: string;
  lineHeight?: number;
  distance?: number;
  rotate?: number;
  style?: React.CSSProperties;
  shadow?: boolean;
}> = ({
  children,
  size,
  tone = 'ink',
  family = FONTS.sans,
  weight = 800,
  delay = 0,
  dur = 30,
  tracking = '-0.035em',
  lineHeight = 0.94,
  distance = 108,
  rotate = 0,
  style,
  shadow = true,
}) => (
  <MaskReveal delay={delay} dur={dur} distance={distance} rotate={rotate}>
    <div
      style={{
        fontFamily: family,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: tracking,
        color: toneColor(tone),
        textShadow: shadow ? '0 2px 0 rgba(255,255,255,0.35)' : undefined,
        whiteSpace: 'pre',
        ...style,
      }}
    >
      {children}
    </div>
  </MaskReveal>
);

/**
 * Sequencia de palavras com stagger — cada palavra e uma camada.
 */
export const Words: React.FC<{
  text: string;
  size: number;
  tone?: Tone;
  family?: string;
  weight?: number;
  delay?: number;
  step?: number;
  tracking?: string;
  lineHeight?: number;
  style?: React.CSSProperties;
  wordStyle?: (i: number) => React.CSSProperties;
}> = ({
  text,
  size,
  tone = 'ink',
  family = FONTS.sans,
  weight = 800,
  delay = 0,
  step = 5,
  tracking = '-0.035em',
  lineHeight = 0.94,
  style,
  wordStyle,
}) => {
  const words = text.split(' ');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.22}px`, ...style }}>
      {words.map((w, i) => (
        <MaskReveal key={i} delay={delay + i * step} dur={28} distance={110}>
          <div
            style={{
              fontFamily: family,
              fontWeight: weight,
              fontSize: size,
              lineHeight,
              letterSpacing: tracking,
              color: toneColor(tone),
              ...(wordStyle ? wordStyle(i) : {}),
            }}
          >
            {w}
          </div>
        </MaskReveal>
      ))}
    </div>
  );
};

/**
 * Brilho que atravessa o texto (light sweep) — reforca o acabamento premium.
 */
export const Sweep: React.FC<{
  children: React.ReactNode;
  delay?: number;
  dur?: number;
  color?: string;
  angle?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  dur = 40,
  color = 'rgba(255,255,255,0.85)',
  angle = 105,
  style,
}) => {
  const frame = useCurrentFrame();
  const x = tween(frame, [delay, delay + dur], [-140, 240], EASE.inOut);
  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      {children}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(${angle}deg, transparent ${x - 22}%, ${color} ${x}%, transparent ${x + 22}%)`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

/** Texto pequeno de apoio nas telas de UI. */
export const UiText: React.FC<{
  children: React.ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  delay?: number;
  tracking?: string;
  style?: React.CSSProperties;
  family?: string;
}> = ({
  children,
  size = 30,
  weight = 500,
  color = COLORS.gray,
  delay,
  tracking = '-0.01em',
  style,
  family = FONTS.ui,
}) => {
  const frame = useCurrentFrame();
  const p = delay === undefined ? 1 : prog(frame, delay, 18);
  return (
    <div
      style={{
        fontFamily: family,
        fontWeight: weight,
        fontSize: size,
        color,
        letterSpacing: tracking,
        opacity: p,
        transform: delay === undefined ? undefined : `translateY(${(1 - p) * 14}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
