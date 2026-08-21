import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Plate } from '../components/Plate';
import { KineticText } from '../components/Type';
import { Dome, Stamp, Stars, StatusFlow } from '../components/Ui';
import { beat, fade, fadeOut } from '../config/beat';
import { plates } from '../config/plates';

/**
 * 20–26s — CONFIANÇA. A caixa aparece protegida, os quatro diferenciais
 * entram em sequência e o fluxo de status termina em ENTREGUE + cinco estrelas.
 */
export const S6Confianca: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Plate plate={plates.s6} duration={duration} push="in" />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Dome start={beat(1)} size={470} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: 'flex-start', justifyContent: 'flex-start',
          paddingLeft: 78, paddingRight: '64%', paddingTop: 54,
        }}
      >
        <KineticText lines={['Entregar bem', 'também é vender.']} start={beat(0.5)} size={104} align="left" accent={[1]} />
      </AbsoluteFill>

      <div style={{ position: 'absolute', left: '17%', top: '40%' }}>
        <Stamp start={beat(3)} icon="eye" lines={['Rastreamento', 'em tempo real']} from="left" />
      </div>
      <div style={{ position: 'absolute', left: '15%', top: '68%' }}>
        <Stamp start={beat(4)} icon="shield" lines={['Carga', 'segurada']} from="left" />
      </div>
      <div style={{ position: 'absolute', left: '55%', top: '40%' }}>
        <Stamp start={beat(3.5)} icon="eye" lines={['Monitoramento', '24h']} from="right" />
      </div>
      <div style={{ position: 'absolute', left: '55%', top: '68%' }}>
        <Stamp start={beat(4.5)} icon="shield" lines={['Gestão', 'de risco']} from="right" />
      </div>

      <div style={{ position: 'absolute', right: '4%', top: '20%' }}>
        <StatusFlow start={beat(6)} />
        <div style={{ marginTop: 18, opacity: fade(frame, beat(9), 0.4) }}>
          <Stars start={beat(9)} size={38} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
