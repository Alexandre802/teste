import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { BoxField } from '../components/SceneFx';
import { Bg } from '../components/Bg';
import { Counter, KineticText } from '../components/Type';
import { beat, fade, fadeOut, overshoot } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 8–12s — ESCALA. Da copy: "Milhares de pequenas caixas atravessam a tela e
 * formam o número: +100.000 / VOLUMES TODOS OS MESES. Sem mais texto.
 * É um número para parar o olho."
 *
 * O número é contado em código, subindo até 100.000 e travando no tempo
 * forte, enquanto o enxame de caixas converge para o centro.
 */
export const S3Escala: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  const form = overshoot(frame, beat(1), 2.5);
  const bloom = interpolate(frame, [beat(4.6), beat(5)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      {/* a arte desta cena é o próprio número; como ele é contado em código,
          o fundo aqui é o ambiente, senão apareceriam dois números */}
      <Bg duration={duration} drift={20} trails={44} glowAt={[50, 50]} />

      <BoxField start={0} duration={duration} count={170} converge />

      <AbsoluteFill
        style={{
          alignItems: 'center', justifyContent: 'center', zIndex: 10,
          transform: `scale(${interpolate(form, [0, 1], [1.22, 1])})`,
          opacity: fade(frame, beat(1), 0.8),
        }}
      >
        <div style={{ filter: `drop-shadow(0 0 ${50 + bloom * 110}px ${theme.cyan})` }}>
          <Counter to={100000} start={beat(1)} durationInBeats={3.6} prefix="+" size={330} />
        </div>
        <div style={{ marginTop: 26 }}>
          <KineticText lines={['Volumes todos os meses']} start={beat(5)} size={92} align="center" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
