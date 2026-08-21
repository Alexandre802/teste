import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Plate } from '../components/Plate';
import { KineticText, Sub } from '../components/Type';
import { Toast } from '../components/Ui';
import { beat } from '../config/beat';
import { plates } from '../config/plates';
import { theme } from '../config/theme';

/**
 * 26–30s — ASSINATURA SEM FINAL. Nada para: caixas e pedidos seguem entrando
 * e o último quadro emenda no primeiro. Sem cartela de encerramento.
 */
export const S7Assinatura: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();

  // sem fadeOut: a cena entrega o quadro cheio para o corte de volta ao início
  const pedidos = [
    { t: 'Pedido #9283', s: 'São Paulo - SP', at: 1.0, top: '10%', left: '4%', from: 'left' as const },
    { t: 'Pedido #6204', s: 'Salvador - BA', at: 1.5, top: '8%', left: '62%', from: 'right' as const },
    { t: 'Pedido #4118', s: 'Belo Horizonte - MG', at: 2.0, top: '30%', left: '2%', from: 'left' as const },
    { t: 'Pedido #9123', s: 'Porto Alegre - RS', at: 2.5, top: '28%', left: '68%', from: 'right' as const },
    { t: 'Pedido #7252', s: 'Curitiba - PR', at: 3.0, top: '72%', left: '5%', from: 'left' as const },
  ];

  return (
    <AbsoluteFill>
      <Plate plate={plates.s7} duration={duration} push="out" />

      {pedidos.map((p, i) => (
        <div key={i} style={{ position: 'absolute', top: p.top, left: p.left }}>
          <Toast start={beat(p.at)} title={p.t} subtitle={p.s} variant="light" accent="#ff5722" from={p.from} width={276} />
        </div>
      ))}

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <KineticText lines={['Três Estrelas']} start={beat(0.5)} size={158} align="center" />
        <div style={{ marginTop: 18 }}>
          <Sub start={beat(2)} size={40} color={theme.white} weight={600} align="center">
            Logística para quem vende grande.
          </Sub>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
