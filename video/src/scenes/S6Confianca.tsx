import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { beat, fade, fadeOut, overshoot, pulse } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 20–27s — CONFIANÇA. Da copy: a caixa protegida pela estrutura digital azul,
 * as quatro palavras ao redor, o fluxo até ENTREGUE e as estrelas.
 *
 * A arte entrega a caixa, os selos e o fluxo. O que anima aqui é a estrutura
 * pulsando ao redor da caixa, um realce percorrendo os quatro selos e as
 * estrelas acendendo uma a uma.
 */

/** Centros dos quatro selos na arte, no espaço 3840×1280. */
const SELOS = [
  { x: 540, y: 560 },
  { x: 500, y: 830 },
  { x: 2320, y: 570 },
  { x: 2320, y: 840 },
];

export const S6Confianca: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);
  const scale = interpolate(frame, [0, duration], [1.0, 1.035]);
  const glow = pulse(frame, 2);

  return (
    <AbsoluteFill style={{ opacity: out, overflow: 'hidden', backgroundColor: theme.navy }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile('plates/s6_confianca.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* a estrutura digital respirando ao redor da caixa */}
        <div
          style={{
            position: 'absolute', left: 1440, top: 220, width: 900, height: 900,
            borderRadius: '50%',
            border: `3px solid ${theme.cyan}${Math.round(60 + glow * 80).toString(16)}`,
            boxShadow: `0 0 ${60 + glow * 70}px ${theme.cyan}55, inset 0 0 ${80 + glow * 60}px ${theme.cyan}33`,
            opacity: fade(frame, beat(0.5), 1) * 0.85,
          }}
        />

        {/* o realce percorre os quatro selos, um por tempo */}
        {SELOS.map((s, i) => {
          const at = beat(2 + i * 0.75);
          const p = overshoot(frame, at, 1);
          const hold = interpolate(frame, [at, at + beat(1.2)], [1, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: s.x, top: s.y,
                width: 340, height: 120,
                transform: `translate(-50%, -50%) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
                borderRadius: 18,
                boxShadow: `0 0 ${40 * hold}px ${theme.cyan}`,
                border: `2px solid ${theme.cyan}${Math.round(hold * 200).toString(16).padStart(2, '0')}`,
                opacity: hold,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* as estrelas da arte acendem uma a uma, por trás */}
      {[2981, 3115, 3249, 3383, 3517].map((x, i) => {
        const at = beat(8.5 + i * 0.25);
        const on = fade(frame, at, 0.25);
        return (
          <div
            key={x}
            style={{
              position: 'absolute', left: x, top: 1015,
              width: 92, height: 92, borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${theme.amber}cc 0%, transparent 68%)`,
              opacity: on * 0.85,
              mixBlendMode: 'screen',
              zIndex: 20,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
