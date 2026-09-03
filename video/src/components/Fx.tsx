import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from 'remotion';
import { BEAT, FPS } from '../config/beat';

/** Filtros de isolamento de canal, usados pela separação RGB da virada. */
export const FxDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
    <defs>
      <filter id="keepR" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <filter id="keepG" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <filter id="keepB" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
      </filter>
    </defs>
  </svg>
);

/**
 * Separação RGB com desfoque direcional. Só duplica as camadas quando
 * `amount` é maior que zero, para não pesar fora da virada.
 */
export const RgbSplit: React.FC<{ amount: number; children: React.ReactNode }> = ({
  amount,
  children,
}) => {
  if (amount <= 0.01) return <>{children}</>;
  const d = amount * 40;
  const blur = amount * 11;
  const layer = (filter: string, dx: number): React.CSSProperties => ({
    filter: `url(#${filter}) blur(${blur}px)`,
    transform: `translateX(${dx}px)`,
    mixBlendMode: 'screen',
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={layer('keepR', -d)}>{children}</AbsoluteFill>
      <AbsoluteFill style={layer('keepG', 0)}>{children}</AbsoluteFill>
      <AbsoluteFill style={layer('keepB', d)}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Estouro branco na virada. Medido na referência: sobe em 2 quadros,
 * satura por ~2 e cai em 3.
 */
export const Flash: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(
    frame,
    [at - 2, at, at + 1, at + 4],
    [0, 1, 0.85, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  if (o <= 0) return null;
  return <AbsoluteFill style={{ backgroundColor: '#ffffff', opacity: o }} />;
};

/** Quanto de separação RGB aplicar num quadro, dadas as viradas. */
export const splitAmount = (frame: number, boundaries: number[]) => {
  let amt = 0;
  for (const b of boundaries) {
    const a = interpolate(
      frame,
      [b - BEAT * 0.5, b, b + BEAT * 0.7],
      [0, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
    amt = Math.max(amt, a);
  }
  return amt;
};

/** Granulado leve por cima de tudo, como nas duas referências. */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: 0.05,
        mixBlendMode: 'overlay',
        backgroundImage:
          `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${frame % 12}'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>")`,
        backgroundSize: '120px 120px',
      }}
    />
  );
};

/**
 * Empurrão de cena. A que sai recua e desliza; a que entra chega de fora com
 * escala e assenta. É o que dá corpo à virada — só o flash com separação RGB
 * deixava o corte mole, sem sensação de movimento.
 */
export const ScenePush: React.FC<{
  duration: number;
  /** Direção da entrada: 1 vem da direita, −1 da esquerda. */
  dir?: 1 | -1;
  children: React.ReactNode;
}> = ({ duration, dir = 1, children }) => {
  const frame = useCurrentFrame();

  const inP = spring({
    frame,
    fps: FPS,
    durationInFrames: BEAT,
    config: { damping: 16, mass: 0.7, stiffness: 140 },
  });
  const outP = interpolate(frame, [duration - BEAT * 0.7, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const x = interpolate(inP, [0, 1], [dir * 150, 0]) - outP * dir * 90;
  const scale = interpolate(inP, [0, 1], [1.07, 1]) * (1 - outP * 0.035);
  const blur = (1 - inP) * 9 + outP * 7;

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${x}px) scale(${scale})`,
        filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
