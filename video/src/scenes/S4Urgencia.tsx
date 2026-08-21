import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Plate } from '../components/Plate';
import { TrackList } from '../components/SceneFx';
import { KineticText, Sub } from '../components/Type';
import { Phone } from '../components/Ui';
import { beat, fadeOut } from '../config/beat';
import { plates } from '../config/plates';

/**
 * 12–16s — URGÊNCIA. O rastreio avança sozinho na tela do celular
 * (vendido → separado → enviado) e o prazo aparece por último.
 */
export const S4Urgencia: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);
  const phoneW = 300;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Plate plate={plates.s4} duration={duration} push="in" drift={[8, 0]} />

      <div style={{ position: 'absolute', left: '9%', top: '50%', transform: 'translateY(-50%)' }}>
        <Phone start={beat(0.5)} width={phoneW}>
          <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
            <div style={{ height: phoneW * 0.2, background: '#ffe600' }} />
            <TrackList start={beat(1.5)} width={phoneW} />
          </div>
        </Phone>
      </div>

      <AbsoluteFill
        style={{
          alignItems: 'flex-end', justifyContent: 'center',
          paddingRight: 90, paddingLeft: '40%',
        }}
      >
        <KineticText
          lines={['Quem vende mais', 'não pode esperar mais.']}
          start={beat(1)}
          size={118}
          align="right"
        />
        <div style={{ marginTop: 24 }}>
          <Sub start={beat(5)} align="right" size={36}>Carga urgente. Operação diária.</Sub>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
