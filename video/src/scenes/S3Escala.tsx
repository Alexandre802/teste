import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { BoxField } from '../components/SceneFx';
import { beat, fadeOut, overshoot } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 8–12s — ESCALA. Da copy: "Milhares de pequenas caixas atravessam a tela e
 * formam o número: +100.000 / VOLUMES TODOS OS MESES."
 *
 * A arte já traz o número construído de caixas. O enxame atravessa o quadro e
 * o número se forma por trás dele, revelado por uma máscara que abre do
 * centro — é a formação que a copy pede, sem redesenhar o que a arte entrega.
 */
export const S3Escala: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  const form = overshoot(frame, beat(1), 2.5);
  const reveal = interpolate(frame, [beat(1), beat(4.5)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const bloom = interpolate(frame, [beat(4.4), beat(5)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: out, overflow: 'hidden', backgroundColor: theme.navy }}>
      <AbsoluteFill style={{ transform: `scale(${interpolate(form, [0, 1], [1.12, 1.0])})` }}>
        <Img
          src={staticFile('plates/s3_escala.png')}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            maskImage:
              `radial-gradient(ellipse ${24 + reveal * 100}% ${34 + reveal * 100}% at 50% 48%, #000 42%, transparent 76%)`,
            WebkitMaskImage:
              `radial-gradient(ellipse ${24 + reveal * 100}% ${34 + reveal * 100}% at 50% 48%, #000 42%, transparent 76%)`,
          }}
        />
      </AbsoluteFill>

      <BoxField start={0} duration={duration} count={150} converge />

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 40% 60% at 50% 46%, ${theme.cyan}${Math.round(bloom * 60).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};
