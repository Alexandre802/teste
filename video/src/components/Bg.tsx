import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, EASE } from '../config/theme';
import { breathe, prog, rndRange, tween } from './anim';

/** Barras verticais translucidas do fundo das artes de referencia. */
const BARS = [
  { x: 8, w: 11, h: 26, d: 0.30 },
  { x: 26, w: 12, h: 34, d: 0.55 },
  { x: 45, w: 12, h: 52, d: 0.40 },
  { x: 63, w: 12, h: 72, d: 0.75 },
  { x: 82, w: 14, h: 88, d: 0.50 },
  { x: -3, w: 9, h: 44, d: 0.65 },
];

export const BgBars: React.FC<{ opacity?: number; speed?: number; delay?: number }> = ({
  opacity = 1,
  speed = 1,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity }}>
      {BARS.map((b, i) => {
        // cada coluna sobe a partir da base ao entrar na cena
        const grow = prog(frame, delay + i * 4, 40, EASE.out);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              width: `${b.w}%`,
              bottom: `-6%`,
              height: `${b.h}%`,
              borderRadius: 36,
              // as barras das artes originais são quase imperceptíveis:
              // apenas alguns níveis acima do fundo
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.16) 100%)',
              transformOrigin: 'center bottom',
              transform: `translateY(${breathe(frame, 0.006 * speed, 10, i) - frame * 0.05 * b.d * speed}px) scaleY(${grow})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Polilinha fina com nos — o "mini grafico" decorativo das artes. */
export const MiniChart: React.FC<{
  points: [number, number][];
  width: number;
  height: number;
  style?: React.CSSProperties;
  color?: string;
  strokeWidth?: number;
  nodes?: boolean;
  filled?: boolean;
  progress?: number;
}> = ({
  points,
  width,
  height,
  style,
  color = COLORS.greenPale,
  strokeWidth = 3,
  nodes = true,
  filled = false,
  progress = 1,
}) => {
  const frame = useCurrentFrame();
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`)
    .join(' ');
  const len = 2400;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', overflow: 'visible', ...style }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - progress)}
      />
      {/* brilho que corre pelo traçado enquanto ele se desenha */}
      {progress > 0.02 && progress < 0.995 && (
        <path
          d={d}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={strokeWidth * 2.4}
          strokeLinecap="round"
          strokeDasharray={`${len * 0.05} ${len}`}
          strokeDashoffset={len * (1 - progress) - len * 0.02}
          opacity={0.85}
          style={{ filter: 'blur(4px)' }}
        />
      )}
      {nodes &&
        points.map((p, i) => {
          const step = 1 / points.length;
          const local = Math.min(1, Math.max(0, (progress - i * step) / step));
          // pequeno overshoot ao pousar, para o nó "estalar", e depois
          // uma pulsação lenta para não ficar congelado
          const pop = local < 1 ? local * (1.65 - 0.65 * local) : 1;
          const alive = local >= 1 ? 1 + 0.11 * Math.sin(frame * 0.06 + i * 1.3) : 1;
          return (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r={6 * pop * alive}
              fill={filled ? color : '#FFFFFF'}
              stroke={color}
              strokeWidth={2.5}
            />
          );
        })}
    </svg>
  );
};

export const Grain: React.FC<{ opacity?: number; scale?: number }> = ({
  opacity = 0.24,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2) % 6;
  const offs = [
    [0, 0],
    [37, 19],
    [-23, 41],
    [61, -17],
    [-45, -33],
    [15, 55],
  ][step];
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('grain.png')})`,
        backgroundRepeat: 'repeat',
        backgroundSize: `${256 * scale}px ${256 * scale}px`,
        backgroundPosition: `${offs[0]}px ${offs[1]}px`,
        opacity,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number; color?: string }> = ({
  strength = 0.16,
  color = '9, 32, 27',
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(115% 78% at 50% 42%, rgba(${color},0) 46%, rgba(${color},${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Fundo claro das cenas tipograficas e de UI. */
export const BgLight: React.FC<{
  tone?: 'warm' | 'cool';
  bars?: boolean;
  charts?: boolean;
  grain?: number;
}> = ({ tone = 'warm', bars = true, charts = true, grain = 0.22 }) => {
  const frame = useCurrentFrame();
  const top = tone === 'warm' ? COLORS.bgWarmTop : COLORS.bgCoolTop;
  const bottom = tone === 'warm' ? COLORS.bgWarm : COLORS.bgCool;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(178deg, ${top} 0%, ${bottom} 62%, ${bottom} 100%)` }}>
      {bars && <BgBars opacity={0.5} />}
      {charts && (
        <>
          <MiniChart
            points={[
              [0, 120],
              [90, 60],
              [170, 92],
              [250, 20],
            ]}
            width={260}
            height={140}
            style={{ left: 60, top: 560 + breathe(frame, 0.012, 7) }}
            color={COLORS.greenPale}
            progress={tween(frame, [0, 60], [0, 1])}
          />
          <MiniChart
            points={[
              [0, 96],
              [80, 40],
              [150, 74],
              [230, 8],
            ]}
            width={250}
            height={110}
            style={{ right: 70, top: 1180 + breathe(frame, 0.01, 9, 2) }}
            color={COLORS.greenPale}
            progress={tween(frame, [10, 74], [0, 1])}
          />
        </>
      )}
      <Vignette strength={0.12} />
      <Grain opacity={grain} />
    </AbsoluteFill>
  );
};

/** Fundo escuro da cena de surebets. */
export const BgDark: React.FC<{ mesh?: boolean }> = ({ mesh = true }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COLORS.bgDarkDeep }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 70% at 50% 34%, ${COLORS.bgDark} 0%, ${COLORS.bgDarkDeep} 72%)`,
        }}
      />
      {/* raios verdes suaves */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${12 + i * 30}%`,
            top: '-20%',
            width: 340,
            height: '150%',
            background:
              'linear-gradient(180deg, rgba(5,213,142,0) 0%, rgba(5,213,142,0.09) 45%, rgba(5,213,142,0) 100%)',
            filter: 'blur(40px)',
            transform: `rotate(${-14 + i * 5}deg) translateY(${breathe(frame, 0.01, 26, i * 2)}px)`,
          }}
        />
      ))}
      {mesh && (
        <Img
          src={staticFile('cutouts/dark-mesh.png')}
          style={{
            position: 'absolute',
            bottom: -30,
            left: '50%',
            width: 1240,
            transform: `translateX(-50%) scale(${1 + Math.sin(frame * 0.012) * 0.02})`,
            opacity: 0.95,
          }}
        />
      )}
      {/* particulas */}
      {Array.from({ length: 26 }).map((_, i) => {
        const x = rndRange(`px${i}`, 0, 1080);
        const y = rndRange(`py${i}`, 200, 1780);
        const s = rndRange(`ps${i}`, 2, 5);
        const sp = rndRange(`pv${i}`, 0.2, 0.7);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: (y - frame * sp) % 1920,
              width: s,
              height: s,
              borderRadius: '50%',
              background: COLORS.greenGlow,
              opacity: 0.14 + 0.4 * Math.abs(Math.sin(frame * 0.03 + i)),
              boxShadow: `0 0 ${s * 3}px ${COLORS.greenNeon}`,
            }}
          />
        );
      })}
      <Vignette strength={0.6} color="0, 0, 0" />
      <Grain opacity={0.16} />
    </AbsoluteFill>
  );
};
