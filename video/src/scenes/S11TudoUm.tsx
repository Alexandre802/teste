import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LightSweep, Sparks } from '../components/Fx';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { COLORS } from '../config/theme';

/**
 * Cena (interface) — "Tudo em um so lugar": entrou, saiu, sobrou.
 * Arte: E58E53D7-0A8F-4D72-A326-B81F80680365.png
 * Narracao: "...e quanto realmente sobrou pra voce esse mes?"
 */
export const S11TudoUm: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill>
    <Scene total={total} zoom={0.022} driftY={-7} handheld={2.2}>
      <PlateScene
        scene="tudoum"
        layers={[
          { id: 'logo', delay: 0, from: 'left', distance: 70, blur: 12 },
          { id: 'title', delay: 6, from: 'up', distance: 40, blur: 14 },
          { id: 'cardIn', delay: 16, from: 'left', distance: 240, spring: 'snappy', rotate: -4, float: 5 },
          { id: 'cardOut', delay: 34, from: 'down', distance: 230, spring: 'snappy', rotate: 3, float: 5, phase: 2 },
          { id: 'cardRest', delay: 52, from: 'scale', spring: 'pop', glow: 'rgba(5,213,142,0.55)', float: 6, phase: 4, sweepAt: 120 },
        ]}
      />
      <Sparks count={22} delay={54} origin={[820, 720]} spread={320} rise={230} color={COLORS.greenNeon} seed="tudo" />
    </Scene>

    <LightSweep delay={78} dur={44} />

    <SfxTrack
      cues={[
        { name: 'whooshTransition', at: 0, volume: 0.75 },
        { name: 'popSoft', at: 6 },
        { name: 'whooshShort', at: 16 },
        { name: 'popUi', at: 26 },
        { name: 'whooshShort', at: 34, rate: 1.08 },
        { name: 'popUi', at: 44, rate: 1.06 },
        { name: 'reverseWhoosh', at: 42, volume: 0.6 },
        { name: 'successChime', at: 52, volume: 0.85 },
        { name: 'bassHit', at: 52, volume: 0.62 },
        { name: 'sparkleShine', at: 60 },
        { name: 'tickMicro', at: 120 },
        { name: 'popSoft', at: 190, volume: 0.5 },
      ]}
    />
  </AbsoluteFill>
);
