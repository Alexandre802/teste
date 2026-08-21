import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { pulse } from '../config/beat';
import { theme } from '../config/theme';

/**
 * O mundo da peça, construído em código: gradiente profundo, trilhas de luz
 * atravessando o quadro, malha de pontos e piso refletindo. Nada fica parado —
 * é o que sustenta a sensação de movimento contínuo da referência.
 */
export const Bg: React.FC<{
  /** Deslocamento horizontal do paralaxe, em px ao longo da cena. */
  drift?: number;
  duration: number;
  trails?: number;
  glowAt?: [number, number];
}> = ({ drift = 0, duration, trails = 26, glowAt = [50, 55] }) => {
  const frame = useCurrentFrame();
  const p = duration > 0 ? frame / duration : 0;
  const dx = interpolate(p, [0, 1], [0, drift]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: theme.navy }}>
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(ellipse 70% 120% at ${glowAt[0]}% ${glowAt[1]}%, ${theme.blueMid} 0%, ${theme.blue} 38%, ${theme.navyDeep} 66%, ${theme.navy} 100%)`,
        }}
      />
      <DotGrid dx={dx} />
      <LightTrails count={trails} dx={dx} />
      <Floor />
      <Bokeh count={22} dx={dx} />
      <Vignette />
    </AbsoluteFill>
  );
};

/** Malha de pontos com ligações, como o fundo "digital" das artes. */
const DotGrid: React.FC<{ dx: number }> = ({ dx }) => {
  const frame = useCurrentFrame();
  const cols = 26;
  const rows = 8;
  return (
    <AbsoluteFill style={{ opacity: 0.3, transform: `translateX(${dx * 0.3}px)` }}>
      <svg width="100%" height="100%" viewBox="0 0 2172 724" preserveAspectRatio="none">
        {new Array(rows).fill(0).map((_, r) =>
          new Array(cols).fill(0).map((_, c) => {
            const seed = `d${r}-${c}`;
            const x = (c / (cols - 1)) * 2172;
            const y = 40 + (r / (rows - 1)) * 640 + random(seed) * 26;
            const tw = 0.25 + 0.75 * pulse(frame + random(seed + 'p') * 90, 3);
            return <circle key={seed} cx={x} cy={y} r={2} fill={theme.cyan} opacity={tw * 0.5} />;
          }),
        )}
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Trilhas de luz horizontais. Cada faixa corre num ritmo próprio e reentra
 * pelo outro lado, então o fluxo nunca tem começo nem fim visível.
 */
const LightTrails: React.FC<{ count: number; dx: number }> = ({ count, dx }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ transform: `translateX(${dx}px)` }}>
      {new Array(count).fill(0).map((_, i) => {
        const seed = `t${i}`;
        const y = random(seed + 'y') * 100;
        const speed = 0.4 + random(seed + 's') * 2.2;
        const len = 12 + random(seed + 'l') * 46;
        const thick = 1 + random(seed + 'h') * 3.5;
        const hue = random(seed + 'c');
        const color = hue > 0.82 ? '#ff3d7f' : hue > 0.6 ? theme.cyanSoft : theme.cyan;
        // volta pelo outro lado: o fluxo é contínuo
        const x = (((frame * speed + random(seed + 'o') * 300) % 340) - 120);
        const op = 0.18 + random(seed + 'a') * 0.5;
        return (
          <div
            key={seed}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: `${len}%`,
              height: thick,
              borderRadius: thick,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              opacity: op,
              filter: `blur(${thick * 0.6}px)`,
              boxShadow: `0 0 ${thick * 6}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Piso em perspectiva, com o brilho refletido que aparece em todas as artes. */
const Floor: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = pulse(frame, 4);
  return (
    <>
      <AbsoluteFill
        style={{
          top: '62%',
          background: `linear-gradient(180deg, ${theme.cyan}00 0%, ${theme.blueMid}44 40%, ${theme.navy}dd 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          top: '61%', height: 3,
          background: `linear-gradient(90deg, transparent, ${theme.cyanSoft}${Math.round(120 + glow * 90).toString(16)}, transparent)`,
          filter: 'blur(2px)',
        }}
      />
    </>
  );
};

/** Partículas fora de foco, para dar profundidade ao fundo. */
const Bokeh: React.FC<{ count: number; dx: number }> = ({ count, dx }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ transform: `translateX(${dx * 0.6}px)` }}>
      {new Array(count).fill(0).map((_, i) => {
        const seed = `b${i}`;
        const size = 8 + random(seed + 's') * 46;
        const x = random(seed + 'x') * 100;
        const y = random(seed + 'y') * 100;
        const rise = ((frame * (0.06 + random(seed + 'v') * 0.12)) % 120) - 10;
        return (
          <div
            key={seed}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${(y - rise + 100) % 100}%`,
              width: size, height: size, borderRadius: '50%',
              background: theme.cyanSoft,
              opacity: 0.05 + random(seed + 'o') * 0.12,
              filter: `blur(${size * 0.35}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        `radial-gradient(ellipse 80% 130% at 50% 50%, transparent 40%, ${theme.navy}cc 100%)`,
    }}
  />
);
