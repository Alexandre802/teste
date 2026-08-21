import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Stage } from '../components/Stage';
import { TextBand } from '../components/TextBand';
import { KineticText } from '../components/Type';
import { beat, fadeOut } from '../config/beat';

/**
 * 20–27s — CONFIANÇA.
 *
 * Da copy, nesta ordem: a caixa protegida pela estrutura digital azul, as
 * quatro palavras ao redor, o fluxo "Pedido enviado → Em transporte →
 * ENTREGUE" com as estrelas, e só no fim "ENTREGAR BEM TAMBÉM É VENDER."
 */
export const S6Confianca: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Stage scene="s6" duration={duration} push="in" />

      {/* a arte entrega caixa, selos, fluxo e estrelas; só a frase é animada */}
      <TextBand from={0.0} to={0.32} top={0.0} bottom={0.36} feather={5} />

      <AbsoluteFill
        style={{
          // ancorada no topo: mais abaixo, a segunda linha esbarra no selo
          // "Rastreamento em tempo real" que a arte traz à esquerda
          alignItems: 'flex-start', justifyContent: 'flex-start',
          paddingLeft: 150, paddingRight: '70%', paddingTop: 96, zIndex: 25,
        }}
      >
        <KineticText
          lines={['Entregar bem', 'também é vender.']}
          start={beat(9.5)}
          size={150}
          align="left"
          accent={[1]}
        />
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
