import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, EASE, FONTS, SHADOW, SPRINGS } from '../config/theme';
import { counter, fmtBRL, mixHex, prog, springAt, tween } from './anim';

/** Card branco arredondado — base das telas de UI. */
export const Card: React.FC<{
  children?: React.ReactNode;
  delay?: number;
  w?: number | string;
  h?: number | string;
  radius?: number;
  from?: 'up' | 'down' | 'left' | 'right' | 'scale';
  distance?: number;
  style?: React.CSSProperties;
  shadow?: string;
  bg?: string;
  spring?: keyof typeof SPRINGS;
  animate?: boolean;
}> = ({
  children,
  delay = 0,
  w,
  h,
  radius = 34,
  from = 'up',
  distance = 90,
  style,
  shadow = SHADOW.card,
  bg = COLORS.white,
  spring: springKey = 'soft',
  animate = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = animate ? springAt(frame, fps, delay, SPRINGS[springKey]) : 1;
  const p = animate ? prog(frame, delay, 14) : 1;
  const off = (1 - s) * distance;
  const t =
    from === 'up'
      ? `translateY(${off}px)`
      : from === 'down'
        ? `translateY(${-off}px)`
        : from === 'left'
          ? `translateX(${off}px)`
          : from === 'right'
            ? `translateX(${-off}px)`
            : `scale(${0.82 + s * 0.18})`;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: bg,
        boxShadow: shadow,
        opacity: p,
        transform: `${t} ${from === 'scale' ? '' : `scale(${0.97 + s * 0.03})`}`,
        filter: `blur(${(1 - p) * 8}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Pill de aba (Dia / Semana / Mes / 90 dias / Ano). */
export const Tab: React.FC<{
  label: string;
  active?: boolean;
  delay?: number;
  size?: number;
  activeProgress?: number;
}> = ({ label, active = false, delay = 0, size = 34, activeProgress = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springAt(frame, fps, delay, SPRINGS.pop);
  const a = active ? activeProgress : 0;
  return (
    <div
      style={{
        padding: `${size * 0.52}px ${size * 0.92}px`,
        borderRadius: 999,
        background: mixHex(COLORS.white, COLORS.greenDeep, a),
        color: mixHex(COLORS.inkSoft, COLORS.white, a),
        fontFamily: FONTS.ui,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '-0.01em',
        boxShadow: active
          ? `0 14px 30px rgba(3,80,54,${0.28 * a}), ${SHADOW.chip}`
          : SHADOW.chip,
        transform: `scale(${(0.7 + s * 0.3) * (1 + a * 0.06)})`,
        opacity: prog(frame, delay, 10),
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
};

/** Chip branco com anel verde — "Acompanhe por periodo" / "Numeros claros". */
export const RingChip: React.FC<{
  label: string;
  delay?: number;
  size?: number;
  style?: React.CSSProperties;
  from?: 'left' | 'right';
}> = ({ label, delay = 0, size = 34, style, from = 'left' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springAt(frame, fps, delay, SPRINGS.snappy);
  const ring = prog(frame, delay + 6, 20);
  const r = size * 0.44;
  const c = 2 * Math.PI * r;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.5,
        padding: `${size * 0.55}px ${size * 0.95}px`,
        borderRadius: 999,
        background: COLORS.white,
        boxShadow: SHADOW.chip,
        opacity: prog(frame, delay, 12),
        transform: `translateX(${(1 - s) * (from === 'left' ? -70 : 70)}px) scale(${0.9 + s * 0.1})`,
        ...style,
      }}
    >
      <svg width={size * 1.05} height={size * 1.05} viewBox={`0 0 ${size * 1.05} ${size * 1.05}`}>
        <circle
          cx={size * 0.525}
          cy={size * 0.525}
          r={r}
          fill="none"
          stroke={COLORS.greenBright}
          strokeWidth={size * 0.11}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ring)}
          transform={`rotate(-90 ${size * 0.525} ${size * 0.525})`}
        />
      </svg>
      <span
        style={{
          fontFamily: FONTS.ui,
          fontWeight: 500,
          fontSize: size,
          color: COLORS.inkSoft,
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
};

/** Icone dentro de um quadrado/circulo colorido. */
export const IconBadge: React.FC<{
  children: React.ReactNode;
  bg: string;
  size?: number;
  radius?: number;
  delay?: number;
  round?: boolean;
}> = ({ children, bg, size = 96, radius = 26, delay = 0, round = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springAt(frame, fps, delay, SPRINGS.pop);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: round ? '50%' : radius,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${0.4 + s * 0.6}) rotate(${(1 - s) * -18}deg)`,
        opacity: prog(frame, delay, 10),
      }}
    >
      {children}
    </div>
  );
};

/** Numero que conta progressivamente. */
export const Counter: React.FC<{
  to: number;
  delay?: number;
  dur?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  size: number;
  color: string;
  weight?: number;
  family?: string;
  style?: React.CSSProperties;
  tracking?: string;
}> = ({
  to,
  delay = 0,
  dur = 42,
  prefix = '',
  suffix = '',
  decimals = 0,
  size,
  color,
  weight = 700,
  family = FONTS.ui,
  style,
  tracking = '-0.02em',
}) => {
  const frame = useCurrentFrame();
  const v = counter(frame, delay, dur, to);
  const pop = tween(frame, [delay + dur - 4, delay + dur + 8], [1.06, 1], EASE.out);
  return (
    <div
      style={{
        fontFamily: family,
        fontWeight: weight,
        fontSize: size,
        color,
        letterSpacing: tracking,
        opacity: prog(frame, delay, 10),
        transform: `scale(${frame > delay + dur - 6 ? pop : 1})`,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {prefix}
      {fmtBRL(v, decimals)}
      {suffix}
    </div>
  );
};

/** Barra de progresso / linha divisoria que se desenha. */
export const Rule: React.FC<{
  delay?: number;
  dur?: number;
  color?: string;
  height?: number;
  style?: React.CSSProperties;
}> = ({ delay = 0, dur = 22, color = 'rgba(12,25,25,0.10)', height = 2, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.out);
  return (
    <div
      style={{
        height,
        background: color,
        borderRadius: height,
        transform: `scaleX(${p})`,
        transformOrigin: 'left center',
        ...style,
      }}
    />
  );
};

/** Bloco "esqueleto" cinza das telas de app. */
export const Skeleton: React.FC<{
  w: number | string;
  h: number;
  delay?: number;
  radius?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ w, h, delay = 0, radius = 999, color = '#EDEFEF', style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 16);
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: color,
        opacity: p,
        transform: `scaleX(${0.6 + p * 0.4})`,
        transformOrigin: 'left center',
        ...style,
      }}
    />
  );
};
