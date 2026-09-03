import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Stage } from '../components/Stage';
import { TextBand } from '../components/TextBand';
import { KineticText, Sub } from '../components/Type';
import { beat, fadeOut } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 16–20s — A GRANDE PROMESSA. Da copy: "Mapa minimalista. GOIÂNIA → SÃO
 * PAULO. Uma caixa atravessa o mapa rapidamente."
 */
export const S5Promessa: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Stage scene="s5" duration={duration} push="in" />

      <TextBand from={0.0} to={0.46} top={0.06} bottom={0.88} feather={5} />

      <AbsoluteFill
        style={{
          alignItems: 'flex-start', justifyContent: 'center',
          paddingLeft: 170, paddingRight: '58%', zIndex: 25,
        }}
      >
        <KineticText lines={['Full de verdade.']} start={beat(0.5)} size={200} align="left" />
        <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Sub start={beat(2)} size={62} color={theme.white} weight={700}>Envie hoje.</Sub>
          <Sub start={beat(2.5)} size={62} color={theme.white} weight={700}>Receba amanhã em São Paulo.</Sub>
          <div style={{ marginTop: 22 }}>
            <Sub start={beat(4)} size={44} color={theme.cyan} weight={600}>Até 24h de CD a CD.</Sub>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
