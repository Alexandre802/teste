import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Plate } from '../components/Plate';
import { RouteMap } from '../components/SceneFx';
import { KineticText, Sub } from '../components/Type';
import { beat, fadeOut } from '../config/beat';
import { plates } from '../config/plates';
import { theme } from '../config/theme';

/**
 * 16–20s — A GRANDE PROMESSA. A caixa atravessa o mapa de Goiânia a São Paulo
 * e "FULL DE VERDADE." bate junto com a chegada.
 */
export const S5Promessa: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Plate plate={plates.s5} duration={duration} push="in" drift={[-8, 0]} />

      <div style={{ position: 'absolute', right: '2%', top: '8%', width: '52%', height: '84%' }}>
        <RouteMap start={beat(1)} width={1130} height={608} />
      </div>

      <AbsoluteFill
        style={{
          alignItems: 'flex-start', justifyContent: 'center',
          paddingLeft: 86, paddingRight: '55%',
        }}
      >
        <KineticText lines={['Full de verdade.']} start={beat(0.5)} size={140} align="left" />
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sub start={beat(2)} size={40} color={theme.white} weight={600}>Envie hoje.</Sub>
          <Sub start={beat(2.5)} size={40} color={theme.white} weight={600}>Receba amanhã em São Paulo.</Sub>
          <div style={{ marginTop: 12 }}>
            <Sub start={beat(4)} size={30} color={theme.cyan} weight={600}>Até 24h de CD a CD.</Sub>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
