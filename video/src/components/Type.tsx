import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BEAT, beat, fade, overshoot } from '../config/beat';
import { DISPLAY_SKEW, font, theme } from '../config/theme';

/**
 * Tipografia gigante. Cada linha sobe por trás de uma máscara e ultrapassa
 * o ponto final antes de assentar — é o gesto que se repete em toda a
 * referência. As linhas entram escalonadas em meio tempo.
 */
export const KineticText: React.FC<{
  lines: string[];
  start: number;
  size?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  /** Linhas que recebem o realce de cor, por índice. */
  accent?: number[];
  accentColor?: string;
  lineGap?: number;
}> = ({
  lines,
  start,
  size = 132,
  color = theme.white,
  align = 'left',
  accent = [],
  accentColor = theme.cyan,
  lineGap = 0.86,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: mapAlign(align) }}>
      {lines.map((line, i) => {
        const s = start + beat(i * 0.5);
        const p = overshoot(frame, s, 1.2);
        const y = interpolate(p, [0, 1], [116, 0]);
        return (
          <div
            key={i}
            style={{
              overflow: 'hidden',
              // folga no topo para os acentos; a máscara que importa é a de baixo,
              // por onde a linha entra
              paddingTop: size * 0.24,
              marginTop: -size * 0.2,
              paddingBottom: size * 0.06,
            }}
          >
            <div
              style={{
                fontFamily: font.display,
                fontSize: size,
                lineHeight: lineGap,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: accent.includes(i) ? accentColor : color,
                transform: `translateY(${y}%) skewX(${DISPLAY_SKEW}deg)`,
                textShadow: `0 ${size * 0.06}px ${size * 0.24}px rgba(0,0,0,0.45)`,
                whiteSpace: 'nowrap',
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Linha de apoio: entra depois do display, sem máscara, só subindo. */
export const Sub: React.FC<{
  children: React.ReactNode;
  start: number;
  size?: number;
  color?: string;
  weight?: number;
  align?: 'left' | 'center' | 'right';
}> = ({ children, start, size = 34, color = theme.cyanSoft, weight = 600, align = 'left' }) => {
  const frame = useCurrentFrame();
  const p = overshoot(frame, start, 1);
  return (
    <div
      style={{
        fontFamily: font.body,
        fontSize: size,
        fontWeight: weight,
        color,
        opacity: fade(frame, start, 0.6),
        transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px)`,
        textAlign: align,
        letterSpacing: '0.005em',
      }}
    >
      {children}
    </div>
  );
};

/**
 * Contador estilo odômetro: sobe até o alvo e passa um pouco antes de
 * travar, como os "238 K" e "120M+" das referências.
 */
export const Counter: React.FC<{
  to: number;
  start: number;
  durationInBeats?: number;
  prefix?: string;
  suffix?: string;
  size?: number;
  color?: string;
}> = ({ to, start, durationInBeats = 4, prefix = '', suffix = '', size = 132, color = theme.white }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, start + beat(durationInBeats)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // desaceleração forte no fim, para o número "assentar"
  const eased = 1 - Math.pow(1 - t, 3);
  const value = Math.round(to * eased);
  const settle = interpolate(frame, [start + beat(durationInBeats), start + beat(durationInBeats + 0.5)], [1.04, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        fontFamily: font.display,
        fontSize: size,
        color,
        letterSpacing: '-0.01em',
        transform: `skewX(${DISPLAY_SKEW}deg) scale(${settle})`,
        textShadow: `0 0 ${size * 0.5}px ${theme.cyan}55`,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      {prefix}
      {value.toLocaleString('pt-BR')}
      {suffix}
    </div>
  );
};

/** Cursor de digitação, para a frase que se escreve na cena de assinatura. */
export const Typed: React.FC<{
  text: string;
  start: number;
  cps?: number;
  size?: number;
  color?: string;
}> = ({ text, start, cps = 26, size = 34, color = theme.white }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor(((frame - start) / 30) * cps));
  const shown = text.slice(0, n);
  const caretOn = Math.floor(frame / (BEAT / 2)) % 2 === 0 && n < text.length;
  return (
    <div style={{ fontFamily: font.body, fontSize: size, fontWeight: 600, color }}>
      {shown}
      <span style={{ opacity: caretOn ? 1 : 0 }}>|</span>
    </div>
  );
};

const mapAlign = (a: 'left' | 'center' | 'right') =>
  a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : 'center';
