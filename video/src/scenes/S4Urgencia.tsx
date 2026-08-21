import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { TrackList } from '../components/SceneFx';
import { Stage } from '../components/Stage';
import { KineticText, Sub } from '../components/Type';
import { Phone } from '../components/Ui';
import { beat, fadeOut } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 12–16s — Da copy: "Mockup de iphone com tela do mercado livre rastreamento.
 * Pedido vendido → separado → enviado. A interface começa a mostrar o prazo."
 * Depois: QUEM VENDE MAIS NÃO PODE ESPERAR MAIS, e "Carga urgente. Operação diária."
 */
export const S4Urgencia: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);
  const phoneW = 372;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Stage scene="s4" duration={duration} push="in" />

      <div style={{ position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <Phone start={beat(0.5)} width={phoneW}>
          <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
            <div style={{ height: phoneW * 0.2, background: '#ffe600' }} />
            <TrackList start={beat(1.5)} width={phoneW} />
          </div>
        </Phone>
      </div>

      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 1220,
          display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 25,
        }}
      >
        <KineticText
          lines={['Quem vende mais', 'não pode', 'esperar mais.']}
          start={beat(3)}
          size={104}
          align="center"
        />
        <div style={{ marginTop: 34 }}>
          <Sub start={beat(6)} align="center" size={38} color={theme.cyan}>
            Carga urgente. Operação diária.
          </Sub>
        </div>
      </div>
    </AbsoluteFill>
  );
};
