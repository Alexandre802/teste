import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Plate } from '../components/Plate';
import { KineticText } from '../components/Type';
import { Toast } from '../components/Ui';
import { beat, fadeOut } from '../config/beat';
import { plates } from '../config/plates';

/**
 * 0–4s — VOCÊ VENDE. A GENTE FAZ CHEGAR.
 * Os pedidos pipocam nos três marketplaces enquanto o tipo assenta à direita.
 */
export const S1VoceVende: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  const pedidos = [
    { t: 'Novo pedido #98254', s: 'Shopee · São Paulo - SP', a: '#ff5722', at: 1.0, top: '12%', left: '2%' },
    { t: 'Novo pedido #98731', s: 'Mercado Livre · Curitiba - PR', a: '#ffe600', at: 1.5, top: '30%', left: '6%' },
    { t: 'Novo pedido #98199', s: 'Shein · Salvador - BA', a: '#111827', at: 2.0, top: '58%', left: '1%' },
    { t: 'Novo pedido #71206', s: 'Shopee · Belo Horizonte - MG', a: '#ff5722', at: 2.5, top: '76%', left: '7%' },
  ];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Plate plate={plates.s1} duration={duration} push="in" drift={[-14, 0]} />

      {pedidos.map((p, i) => (
        <div key={i} style={{ position: 'absolute', top: p.top, left: p.left }}>
          <Toast start={beat(p.at)} title={p.t} subtitle={p.s} accent={p.a} from="left" width={318} />
        </div>
      ))}

      <AbsoluteFill
        style={{
          alignItems: 'flex-end', justifyContent: 'center',
          paddingRight: 96, paddingLeft: '54%',
        }}
      >
        <KineticText
          lines={['Você vende.', 'A gente faz chegar.']}
          start={beat(0.5)}
          size={126}
          align="right"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
