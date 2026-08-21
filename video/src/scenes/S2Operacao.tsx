import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Plate } from '../components/Plate';
import { KineticText, Sub } from '../components/Type';
import { Toast } from '../components/Ui';
import { beat, fade, fadeOut } from '../config/beat';
import { plates } from '../config/plates';

/**
 * 4–8s — Os pedidos se afastam e revelam a operação: CD e frota.
 * O recuo de câmera é o gesto principal; os toasts saem voando para trás.
 */
export const S2Operacao: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  // os cartões se afastam: encolhem e sobem, liberando o fundo
  const away = interpolate(frame, [beat(1), beat(4)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Plate plate={plates.s2} duration={duration} push="out" drift={[10, 0]} />

      <AbsoluteFill
        style={{
          transform: `scale(${interpolate(away, [0, 1], [1, 0.55])}) translateY(${interpolate(away, [0, 1], [0, -70])}px)`,
          opacity: interpolate(away, [0, 0.75, 1], [1, 0.5, 0]),
        }}
      >
        {[
          { t: 'Pedido #9283', s: 'São Paulo - SP', at: 0.0, top: '14%', left: '3%' },
          { t: 'Pedido #4118', s: 'Belo Horizonte - MG', at: 0.5, top: '40%', left: '8%' },
          { t: 'Pedido #7252', s: 'Curitiba - PR', at: 1.0, top: '66%', left: '2%' },
        ].map((p, i) => (
          <div key={i} style={{ position: 'absolute', top: p.top, left: p.left }}>
            <Toast start={beat(p.at)} title={p.t} subtitle={p.s} variant="light" accent="#ff5722" width={286} />
          </div>
        ))}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: 'flex-end', justifyContent: 'center',
          paddingRight: 96, paddingLeft: '52%',
          opacity: fade(frame, beat(2), 0.8),
        }}
      >
        <KineticText lines={['Você vende.', 'A gente faz chegar.']} start={beat(2)} size={126} align="right" />
        <div style={{ marginTop: 22 }}>
          <Sub start={beat(4)} align="right" size={34}>
            Frota própria. Centro de distribuição. Operação diária.
          </Sub>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
