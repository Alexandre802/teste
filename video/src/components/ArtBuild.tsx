import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { FPS, beat, pulse } from '../config/beat';
import { theme } from '../config/theme';

export type Band = {
  /** Recorte horizontal da faixa, em fração da largura. */
  from: number;
  to: number;
  /** Quadro em que a faixa entra. */
  at: number;
  /** De onde ela desliza: −1 esquerda, 1 direita, 0 só escala. */
  dir?: -1 | 0 | 1;
};

/**
 * Monta a arte por partes, em vez de mostrá-la pronta.
 *
 * Cada faixa é a arte inteira recortada numa coluna, entrando no seu tempo.
 * Como o recorte é da própria arte, a composição se remonta exatamente como
 * o designer fez — sem redesenhar nada por cima e, portanto, sem risco de
 * elemento duplicado.
 */
export const ArtBuild: React.FC<{
  src: string;
  bands: Band[];
  duration: number;
  /** Empurrão de câmera ao longo da cena. */
  push?: [number, number];
  children?: React.ReactNode;
}> = ({ src, bands, duration, push = [1.0, 1.04], children }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], push);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: theme.navy }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        {bands.map((b, i) => {
          const p = spring({
            frame: frame - b.at,
            fps: FPS,
            durationInFrames: beat(1.4),
            config: { damping: 15, mass: 0.9, stiffness: 115 },
          });
          const dir = b.dir ?? 0;
          return (
            <AbsoluteFill
              key={i}
              style={{
                clipPath: `inset(0 ${(1 - b.to) * 100}% 0 ${b.from * 100}%)`,
                opacity: p,
                transform:
                  `translateX(${interpolate(p, [0, 1], [dir * 90, 0])}px) ` +
                  `scale(${interpolate(p, [0, 1], [1.05, 1])})`,
              }}
            >
              <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </AbsoluteFill>
          );
        })}
        {children}
      </AbsoluteFill>
      <Shine bands={bands} />
    </AbsoluteFill>
  );
};

/** Lampejo curto no instante em que cada faixa assenta. */
const Shine: React.FC<{ bands: Band[] }> = ({ bands }) => {
  const frame = useCurrentFrame();
  const glow = pulse(frame, 4);
  return (
    <>
      {bands.map((b, i) => {
        const o = interpolate(
          frame,
          [b.at, b.at + beat(0.3), b.at + beat(1)],
          [0, 0.5, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );
        if (o <= 0) return null;
        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(0 ${(1 - b.to) * 100}% 0 ${b.from * 100}%)`,
              background: `linear-gradient(100deg, transparent 20%, ${theme.cyanSoft}55 50%, transparent 80%)`,
              mixBlendMode: 'screen',
              opacity: o * (0.7 + glow * 0.3),
            }}
          />
        );
      })}
    </>
  );
};

/** Atalho para as artes que moram em `public/plates`. */
export const plateSrc = (name: string) => staticFile(`plates/${name}`);
