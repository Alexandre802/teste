import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import { BoxField } from '../components/SceneFx';
import { Counter, KineticText } from '../components/Type';
import { beat, fade, fadeOut, overshoot } from '../config/beat';
import { plates } from '../config/plates';
import { theme } from '../config/theme';

/**
 * 8–12s — ESCALA. Milhares de caixas atravessam o quadro e formam o número.
 * Cena de um número só: é para parar o olho.
 *
 * Enquanto a arte vier achatada, quem entrega o número é a própria imagem,
 * revelada por máscara conforme as caixas convergem. Com o plate limpo, o
 * número passa a ser desenhado em código e contado até 100.000.
 */
export const S3Escala: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);
  const baked = plates.s3.baked;

  // a arte "se forma": entra escalada e assenta no tempo forte
  const form = overshoot(frame, beat(1), 2.5);
  const scale = interpolate(form, [0, 1], [1.18, 1.02]);
  const reveal = interpolate(frame, [beat(1), beat(3.5)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: out, backgroundColor: theme.navy, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={plates.s3.src}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: baked ? reveal : 0.55,
            maskImage: baked
              ? `radial-gradient(ellipse ${30 + reveal * 90}% ${40 + reveal * 90}% at 50% 45%, #000 40%, transparent 78%)`
              : undefined,
            WebkitMaskImage: baked
              ? `radial-gradient(ellipse ${30 + reveal * 90}% ${40 + reveal * 90}% at 50% 45%, #000 40%, transparent 78%)`
              : undefined,
          }}
        />
      </AbsoluteFill>

      <BoxField start={0} duration={duration} count={110} converge />

      {baked ? null : (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 60 }}>
          <Counter to={100000} start={beat(1)} durationInBeats={4} prefix="+" size={252} />
        </AbsoluteFill>
      )}

      <AbsoluteFill
        style={{
          alignItems: 'center', justifyContent: 'flex-end',
          paddingBottom: 58, opacity: fade(frame, beat(4), 0.6),
        }}
      >
        <KineticText lines={['Volumes todos os meses'] } start={beat(4)} size={46} align="center" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
