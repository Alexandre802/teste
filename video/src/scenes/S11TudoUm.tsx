import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LightSweep, Sparks } from '../components/Fx';
import { Logo } from '../components/Logo';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { COLORS } from '../config/theme';

/**
 * Cena 2 (21,6s–26,1s) — "Tudo em um so lugar".
 * Arte: E58E53D7-0A8F-4D72-A326-B81F80680365.png
 *
 * O grafico do fundo (barras 3D + seta) sobe da esquerda para a direita
 * depois que os cards pousam, respeitando o layout. Os numeros rolam.
 */
export const S11TudoUm: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill>
    <Scene total={total} zoom={0.022} driftY={-7} handheld={2.2}>
      <PlateScene
        scene="tudoum"
        layers={[
          // o grafico do fundo se forma; entra abaixo dos cards
          { id: 'iso', delay: 40, from: 'none', wipe: 'right', wipeDur: 88, blur: 0 },

          { id: 'title', delay: 6, from: 'up', distance: 40, blur: 14 },
          { id: 'cardIn', delay: 14, from: 'left', distance: 240, spring: 'snappy', rotate: -4, float: 5 },
          { id: 'numIn', delay: 32, from: 'none', roll: true, rollDur: 24, blur: 0, float: 5 },
          { id: 'cardOut', delay: 26, from: 'down', distance: 230, spring: 'snappy', rotate: 3, float: 5, phase: 2 },
          { id: 'numOut', delay: 44, from: 'none', roll: true, rollDur: 24, blur: 0, float: 5, phase: 2 },
          { id: 'cardRest', delay: 40, from: 'scale', spring: 'pop', glow: 'rgba(5,213,142,0.55)', float: 6, phase: 4, sweepAt: 120 },
          { id: 'numRest', delay: 60, from: 'none', roll: true, rollDur: 26, blur: 0, float: 6, phase: 4 },
        ]}
      >
        <Logo
          size={92}
          color={COLORS.ink}
          delay={0}
          style={{ position: 'absolute', left: 74, top: 100 }}
        />
      </PlateScene>

      <Sparks count={22} delay={42} origin={[820, 720]} spread={320} rise={230} color={COLORS.greenNeon} seed="tudo" />
    </Scene>

    <LightSweep delay={78} dur={44} />

    <SfxTrack
      cues={[
        { name: 'whooshTransition', at: 0, volume: 0.75 },
        { name: 'popSoft', at: 6 },
        { name: 'whooshShort', at: 14 },
        { name: 'tickMicro', at: 32 },
        { name: 'whooshShort', at: 26, rate: 1.08 },
        { name: 'tickMicro', at: 44, rate: 1.1 },
        { name: 'reverseWhoosh', at: 32, volume: 0.6 },
        { name: 'successChime', at: 40, volume: 0.85 },
        { name: 'bassHit', at: 40, volume: 0.62 },
        { name: 'riserShort', at: 44, volume: 0.42 },
        { name: 'tickMicro', at: 60, rate: 0.95 },
        { name: 'sparkleShine', at: 66 },
        { name: 'popSoft', at: 190, volume: 0.5 },
      ]}
    />
  </AbsoluteFill>
);
