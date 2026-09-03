import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, EASE } from '../config/theme';
import { prog, rndRange, tween } from './anim';

/** Estouro de luz curto — acentua impactos. */
export const Flash: React.FC<{
  at: number;
  dur?: number;
  color?: string;
  max?: number;
}> = ({ at, dur = 10, color = '#FFFFFF', max = 0.85 }) => {
  const frame = useCurrentFrame();
  const o = tween(frame, [at, at + dur], [max, 0], EASE.out);
  if (frame < at || frame > at + dur) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: 'none' }} />;
};

/** Fatias horizontais deslocadas — glitch digital. */
export const GlitchSlices: React.FC<{
  at: number;
  dur?: number;
  slices?: number;
  amount?: number;
}> = ({ at, dur = 10, slices = 9, amount = 46 }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + dur) return null;
  const t = (frame - at) / dur;
  const energy = 1 - t;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
      {Array.from({ length: slices }).map((_, i) => {
        const y = (i / slices) * 100;
        const h = 100 / slices;
        const dx = (rndRange(`gs${i}${Math.floor(frame / 2)}`, -1, 1) * amount * energy);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: dx,
              top: `${y}%`,
              width: '100%',
              height: `${h}%`,
              background:
                i % 2 === 0
                  ? `rgba(5,213,142,${0.16 * energy})`
                  : `rgba(242,80,58,${0.10 * energy})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Linhas de velocidade radiais. */
export const SpeedLines: React.FC<{
  delay?: number;
  dur?: number;
  count?: number;
  color?: string;
  opacity?: number;
}> = ({ delay = 0, dur = 26, count = 34, color = 'rgba(12,25,25,0.10)', opacity = 1 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.out);
  const fade = tween(frame, [delay + dur, delay + dur + 22], [1, 0], EASE.out);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: opacity * fade }}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + 0.3;
        const len = rndRange(`sl${i}`, 240, 760) * p;
        const r0 = rndRange(`sr${i}`, 260, 620);
        const x = 540 + Math.cos(a) * r0;
        const y = 960 + Math.sin(a) * r0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: len,
              height: rndRange(`sw${i}`, 2, 5),
              background: color,
              borderRadius: 4,
              transformOrigin: 'left center',
              transform: `rotate(${(a * 180) / Math.PI}deg)`,
              opacity: 0.4 + 0.6 * (1 - p),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Faixa de luz diagonal atravessando a tela. */
export const LightSweep: React.FC<{
  delay?: number;
  dur?: number;
  angle?: number;
  width?: number;
  color?: string;
}> = ({ delay = 0, dur = 34, angle = -22, width = 420, color = 'rgba(255,255,255,0.75)' }) => {
  const frame = useCurrentFrame();
  const x = tween(frame, [delay, delay + dur], [-900, 1900], EASE.inOut);
  const o =
    frame < delay + dur * 0.25
      ? tween(frame, [delay, delay + dur * 0.25], [0, 1], EASE.inOut)
      : tween(frame, [delay + dur * 0.25, delay + dur], [1, 0], EASE.inOut);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none', mixBlendMode: 'overlay' }}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: -400,
          width,
          height: 2800,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          filter: 'blur(28px)',
          transform: `rotate(${angle}deg)`,
          opacity: o,
        }}
      />
    </AbsoluteFill>
  );
};

/** Particulas de brilho que sobem — usadas em destaques. */
export const Sparks: React.FC<{
  count?: number;
  delay?: number;
  color?: string;
  origin?: [number, number];
  spread?: number;
  size?: [number, number];
  rise?: number;
  seed?: string;
}> = ({
  count = 22,
  delay = 0,
  color = COLORS.greenNeon,
  origin = [540, 960],
  spread = 420,
  size = [4, 11],
  rise = 320,
  seed = 'sp',
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => {
        const d = delay + rndRange(`${seed}d${i}`, 0, 22);
        const p = prog(frame, d, rndRange(`${seed}u${i}`, 40, 80), EASE.out);
        if (p <= 0) return null;
        const ang = rndRange(`${seed}a${i}`, 0, Math.PI * 2);
        const r = rndRange(`${seed}r${i}`, 30, spread);
        const s = rndRange(`${seed}s${i}`, size[0], size[1]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: origin[0] + Math.cos(ang) * r * p,
              top: origin[1] + Math.sin(ang) * r * p - rise * p,
              width: s,
              height: s,
              borderRadius: '50%',
              background: color,
              opacity: (1 - p) * 0.9,
              boxShadow: `0 0 ${s * 3}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Estilhaços/fragmentos que voam — cena de caos. */
export const Shards: React.FC<{
  count?: number;
  delay?: number;
  colors?: string[];
  seed?: string;
}> = ({
  count = 26,
  delay = 0,
  colors = [COLORS.redDeep, COLORS.red, COLORS.greenPale, '#C9D6D0'],
  seed = 'sh',
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => {
        const d = delay + rndRange(`${seed}d${i}`, 0, 16);
        const p = prog(frame, d, rndRange(`${seed}u${i}`, 50, 95), EASE.out);
        if (p <= 0) return null;
        const ang = rndRange(`${seed}a${i}`, 0, Math.PI * 2);
        const r = rndRange(`${seed}r${i}`, 320, 980) * p;
        const w = rndRange(`${seed}w${i}`, 10, 34);
        const h = rndRange(`${seed}h${i}`, 6, 20);
        const rot = rndRange(`${seed}o${i}`, -180, 180) * p * 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 540 + Math.cos(ang) * r,
              top: 960 + Math.sin(ang) * r * 1.25,
              width: w,
              height: h,
              background: colors[i % colors.length],
              opacity: (1 - p) * 0.75,
              transform: `rotate(${rot}deg) skewX(-12deg)`,
              borderRadius: 2,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Corte em X vermelho (cena de caos) que se desenha e treme. */
export const RedSlash: React.FC<{
  delay?: number;
  dur?: number;
  opacity?: number;
}> = ({ delay = 0, dur = 18, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const p1 = prog(frame, delay, dur, EASE.outHard);
  const p2 = prog(frame, delay + 5, dur, EASE.outHard);
  const shake = Math.sin(frame * 1.7) * Math.max(0, 1 - (frame - delay) / 40) * 4;
  const L = 2600;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="rs" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(220,58,63,0)" />
            <stop offset="18%" stopColor="#DC3A3F" />
            <stop offset="55%" stopColor="#F2503A" />
            <stop offset="100%" stopColor="rgba(242,80,58,0)" />
          </linearGradient>
          <filter id="rsb" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g transform={`translate(${shake} 0)`}>
          <path
            d="M -80 320 L 1160 1560"
            stroke="url(#rs)"
            strokeWidth={78}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={L}
            strokeDashoffset={L * (1 - p1)}
            filter="url(#rsb)"
            opacity={0.85}
          />
          <path
            d="M 1160 320 L -80 1560"
            stroke="url(#rs)"
            strokeWidth={78}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={L}
            strokeDashoffset={L * (1 - p2)}
            filter="url(#rsb)"
            opacity={0.85}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Formas decorativas de 4 pontas que giram e pulsam ao fundo — mantêm a
 * tela viva mesmo enquanto o texto segura.
 */
const SPARK_D =
  'M 50 0 C 56 30, 70 44, 100 50 C 70 56, 56 70, 50 100 C 44 70, 30 56, 0 50 C 30 44, 44 30, 50 0 Z';

export const Bursts: React.FC<{
  count?: number;
  color?: string;
  opacity?: number;
  seed?: string;
  min?: number;
  max?: number;
  blur?: number;
  delay?: number;
}> = ({
  count = 5,
  color = COLORS.greenPale,
  opacity = 1,
  seed = 'b',
  min = 190,
  max = 460,
  blur = 0,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = rndRange(`${seed}x${i}`, -160, 1080);
        const y = rndRange(`${seed}y${i}`, -140, 1920);
        const s = rndRange(`${seed}s${i}`, min, max);
        const rot = rndRange(`${seed}r${i}`, 0, 360);
        const spin = rndRange(`${seed}v${i}`, -0.16, 0.16);
        const d = delay + i * 5;
        const p = prog(frame, d, 34, EASE.out);
        const pulse = 1 + Math.sin(frame * 0.026 + i * 1.7) * 0.16;
        const dx = Math.sin(frame * 0.011 + i) * 34;
        const dy = Math.cos(frame * 0.009 + i * 2) * 28;
        return (
          <svg
            key={i}
            width={s}
            height={s}
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              left: x + dx,
              top: y + dy,
              transform: `rotate(${rot + frame * spin}deg) scale(${p * pulse})`,
              filter: blur ? `blur(${blur}px)` : undefined,
            }}
          >
            <path d={SPARK_D} fill={color} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Anel que pulsa sobre um ponto da arte — usado nos nós que ligam os cards
 * e no dia destacado do calendário, que na arte são pixels estáticos.
 */
export const PulseRing: React.FC<{
  x: number;
  y: number;
  delay?: number;
  r?: number;
  color?: string;
  period?: number;
}> = ({ x, y, delay = 0, r = 26, color = COLORS.greenBright, period = 72 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 14, EASE.out);
  if (p <= 0) return null;
  const t = ((frame - delay) % period) / period;
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      {[0, 0.5].map((off) => {
        const q = (t + off) % 1;
        return (
          <div
            key={off}
            style={{
              position: 'absolute',
              left: -r,
              top: -r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: `3px solid ${color}`,
              opacity: (1 - q) * 0.5 * p,
              transform: `scale(${0.7 + q * 1.5})`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Cortina que varre a tela — transicao entre blocos. */
export const Wipe: React.FC<{
  at: number;
  dur?: number;
  color?: string;
  dir?: 'up' | 'down';
}> = ({ at, dur = 22, color = COLORS.bgDark, dir = 'up' }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + dur) return null;
  const p = tween(frame, [at, at + dur], [0, 1], EASE.inOut);
  const y = dir === 'up' ? (1 - p) * 100 : -(1 - p) * 100;
  return (
    <AbsoluteFill
      style={{
        background: color,
        transform: `translateY(${y}%)`,
        pointerEvents: 'none',
      }}
    />
  );
};
