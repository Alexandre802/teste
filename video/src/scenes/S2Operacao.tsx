import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Stage } from '../components/Stage';
import { KineticText, Sub } from '../components/Type';
import { Toast } from '../components/Ui';
import { beat, fade, fadeOut } from '../config/beat';

/**
 * 5–8s — Da copy: "Os pedidos se afastam e revelam caminhões e CD da Três
 * Estrelas 3D". Os cartões recuam e somem; a arte do pátio fica limpa.
 */
export const S2Operacao: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  const away = interpolate(frame, [0, beat(2.5)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Stage scene="s2" duration={duration} push="out" />

      {/* os pedidos se afastam, liberando a operação ao fundo */}
      <AbsoluteFill
        style={{
          transform: `scale(${interpolate(away, [0, 1], [1, 0.42])}) translateY(${interpolate(away, [0, 1], [0, -180])}px)`,
          opacity: interpolate(away, [0, 0.7, 1], [1, 0.4, 0]),
          zIndex: 10,
        }}
      >
        {[
          { t: 'Pedido #9283', s: 'São Paulo - SP', top: '14%', left: '3%', from: 'left' as const },
          { t: 'Pedido #6204', s: 'Salvador - BA', top: '20%', left: '48%', from: 'right' as const },
          { t: 'Pedido #4118', s: 'Belo Horizonte - MG', top: '30%', left: '5%', from: 'left' as const },
          { t: 'Pedido #9123', s: 'Porto Alegre - RS', top: '36%', left: '46%', from: 'right' as const },
        ].map((p, i) => (
          <div key={i} style={{ position: 'absolute', top: p.top, left: p.left }}>
            <Toast start={0} title={p.t} subtitle={p.s} variant="light" accent="#ee4d2d" from={p.from} width={286} />
          </div>
        ))}
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 1300,
          display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 25,
          opacity: fade(frame, beat(1.5), 0.8),
        }}
      >
        <KineticText lines={['Você vende.', 'A gente', 'faz chegar.']} start={beat(1.5)} size={118} align="center" />
        <div style={{ marginTop: 28 }}>
          <Sub start={beat(4)} align="center" size={34}>Frota própria. Operação diária.</Sub>
        </div>
      </div>
    </AbsoluteFill>
  );
};
