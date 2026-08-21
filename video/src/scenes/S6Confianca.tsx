import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Stage } from '../components/Stage';
import { KineticText } from '../components/Type';
import { Dome, Stamp, Stars, StatusFlow } from '../components/Ui';
import { beat, fade, fadeOut } from '../config/beat';

/**
 * 20–27s — CONFIANÇA.
 *
 * Da copy, nesta ordem: a caixa protegida pela estrutura digital azul, as
 * quatro palavras ao redor dela, o fluxo "Pedido enviado → Em transporte →
 * ENTREGUE" com as estrelas logo em seguida e, só no fim, o texto
 * "ENTREGAR BEM TAMBÉM É VENDER."
 *
 * A caixa é a própria arte, flutuando no ambiente; domo, selos, fluxo e
 * estrelas são a camada animada.
 */
export const S6Confianca: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Stage scene="s6" duration={duration} push="in" />

      {/* a estrutura digital ao redor da caixa */}
      <div
        style={{
          position: 'absolute', top: 590, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', zIndex: 8,
        }}
      >
        <Dome start={beat(0.5)} size={640} />
      </div>

      {/* as quatro palavras */}
      <div style={{ position: 'absolute', top: 520, left: '3%', zIndex: 20 }}>
        <Stamp start={beat(2)} icon="eye" lines={['Rastreamento', 'em tempo real']} from="left" />
      </div>
      <div style={{ position: 'absolute', top: 520, right: '3%', zIndex: 20 }}>
        <Stamp start={beat(2.5)} icon="eye" lines={['Monitoramento', '24h']} from="right" />
      </div>
      <div style={{ position: 'absolute', top: 1060, left: '3%', zIndex: 20 }}>
        <Stamp start={beat(3)} icon="shield" lines={['Carga', 'segurada']} from="left" />
      </div>
      <div style={{ position: 'absolute', top: 1060, right: '3%', zIndex: 20 }}>
        <Stamp start={beat(3.5)} icon="shield" lines={['Gestão', 'de risco']} from="right" />
      </div>

      {/* o fluxo do pedido e a reputação, logo abaixo da caixa */}
      <div
        style={{
          position: 'absolute', top: 1290, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20,
        }}
      >
        <StatusFlow start={beat(6)} />
        <div style={{ marginTop: 20, opacity: fade(frame, beat(8.5), 0.4) }}>
          <Stars start={beat(8.5)} size={46} />
        </div>
      </div>

      {/* e só então a frase */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 118,
          display: 'flex', justifyContent: 'center', zIndex: 25,
        }}
      >
        <KineticText
          lines={['Entregar bem', 'também é vender.']}
          start={beat(9.5)}
          size={92}
          align="center"
          accent={[1]}
        />
      </div>
    </AbsoluteFill>
  );
};
