import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { RouteMap } from '../components/SceneFx';
import { Stage } from '../components/Stage';
import { KineticText, Sub } from '../components/Type';
import { BrazilMap } from '../components/World';
import { beat, fade, fadeOut } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 16–20s — A GRANDE PROMESSA. Da copy: "Mapa minimalista. GOIÂNIA → SÃO PAULO.
 * Uma caixa atravessa o mapa rapidamente. FULL DE VERDADE. Envie hoje. Receba
 * amanhã em São Paulo. E abaixo, pequeno: Até 24h de CD a CD."
 */
export const S5Promessa: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);
  const mapSize = 900;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Stage scene="s5" duration={duration} push="in" />

      <div
        style={{
          position: 'absolute', top: 330, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', zIndex: 10,
          opacity: fade(frame, beat(0.5), 1),
        }}
      >
        <div style={{ position: 'relative', width: mapSize, height: mapSize }}>
          <BrazilMap size={mapSize} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 4 }}>
            <RouteMap start={beat(1.5)} size={mapSize} />
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 128,
          display: 'flex', justifyContent: 'center', zIndex: 25,
        }}
      >
        <KineticText lines={['Full de', 'verdade.']} start={beat(0.5)} size={132} align="center" />
      </div>

      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 132,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 25,
        }}
      >
        <Sub start={beat(2)} size={44} color={theme.white} weight={700} align="center">Envie hoje.</Sub>
        <Sub start={beat(2.5)} size={44} color={theme.white} weight={700} align="center">Receba amanhã em São Paulo.</Sub>
        <div style={{ marginTop: 16 }}>
          <Sub start={beat(4)} size={30} color={theme.cyan} weight={600} align="center">Até 24h de CD a CD.</Sub>
        </div>
      </div>
    </AbsoluteFill>
  );
};
