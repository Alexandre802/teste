import React from 'react';

import { COLORS, FONT } from '../theme';
import { EASE, enter, iv, s, SPRING } from '../lib/anim';
import { useSceneFrame } from '../lib/timing';

export type Segment = { t: string; c?: string };
export type Line = readonly Segment[];

const colorOf = (c?: string) =>
  c === 'blue' ? COLORS.primaryText : c === 'muted' ? COLORS.muted : COLORS.dark;

type HeadlineProps = {
  lines: readonly Line[];
  fontSize: number;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right';
  weight?: number;
  delay?: number;
  /** Atraso entre palavras. */
  stagger?: number;
  /** Atraso extra entre linhas. */
  lineStagger?: number;
  letterSpacing?: string;
  /** 'mask' = palavras sobem por trás de uma máscara; 'pop' = escala com mola. */
  mode?: 'mask' | 'pop';
  style?: React.CSSProperties;
};

/**
 * Título com animação palavra a palavra. Cada palavra é uma camada própria,
 * o que permite escalonar entrada, cor e movimento individualmente.
 */
export const Headline: React.FC<HeadlineProps> = ({
  lines,
  fontSize,
  lineHeight = 1.06,
  align = 'left',
  weight = FONT.black,
  delay = 0,
  stagger = 3.2,
  lineStagger = 5,
  letterSpacing = '-0.035em',
  mode = 'mask',
  style,
}) => {
  const frame = useSceneFrame();
  let wordIndex = 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent:
              align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
            overflow: mode === 'mask' ? 'hidden' : 'visible',
            paddingBottom: fontSize * 0.06,
            marginTop: li === 0 ? 0 : fontSize * (lineHeight - 1),
          }}
        >
          {line.map((seg, si) =>
            seg.t.split(' ').map((w, wi) => {
              const d = delay + li * lineStagger + wordIndex * stagger;
              wordIndex += 1;
              const prog = s(frame, {
                delay: d,
                config: mode === 'pop' ? SPRING.pop : SPRING.soft,
              });
              const op = iv(frame, [d, d + 7], [0, 1], EASE.out);
              const ty = mode === 'mask' ? (1 - prog) * fontSize * 1.05 : (1 - prog) * 26;
              const sc = mode === 'pop' ? 0.78 + 0.22 * prog : 1;
              return (
                <span
                  key={`${si}-${wi}`}
                  style={{
                    fontFamily: FONT.family,
                    fontWeight: weight,
                    fontSize,
                    lineHeight,
                    letterSpacing,
                    color: colorOf(seg.c),
                    display: 'inline-block',
                    whiteSpace: 'pre',
                    transform: `translate3d(0, ${ty.toFixed(2)}px, 0) scale(${sc.toFixed(4)})`,
                    opacity: op,
                  }}
                >
                  {w}
                  {' '}
                </span>
              );
            }),
          )}
        </div>
      ))}
    </div>
  );
};

/** Subtítulo simples com fade + subida. */
export const Subtitle: React.FC<{
  children: React.ReactNode;
  fontSize: number;
  delay?: number;
  color?: string;
  weight?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}> = ({ children, fontSize, delay = 0, color = COLORS.muted, weight = FONT.medium, align = 'left', style }) => {
  const frame = useSceneFrame();
  const e = enter(frame, { delay, y: 18, config: SPRING.soft, fade: 10 });
  return (
    <div
      style={{
        fontFamily: FONT.family,
        fontWeight: weight,
        fontSize,
        color,
        letterSpacing: '-0.02em',
        textAlign: align,
        opacity: e.opacity,
        transform: e.transform,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Texto inline com trechos coloridos (sem animação por palavra). */
export const RichLine: React.FC<{
  segments: readonly Segment[];
  fontSize: number;
  weight?: number;
  delay?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}> = ({ segments, fontSize, weight = FONT.bold, delay = 0, align = 'center', style }) => {
  const frame = useSceneFrame();
  const e = enter(frame, { delay, y: 20, config: SPRING.soft, fade: 10 });
  return (
    <div
      style={{
        fontFamily: FONT.family,
        fontWeight: weight,
        fontSize,
        letterSpacing: '-0.025em',
        textAlign: align,
        opacity: e.opacity,
        transform: e.transform,
        ...style,
      }}
    >
      {segments.map((s2, i) => (
        <span key={i} style={{ color: colorOf(s2.c) }}>
          {s2.t}
        </span>
      ))}
    </div>
  );
};
