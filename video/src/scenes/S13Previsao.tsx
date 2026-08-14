import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Flash, LightSweep, Sparks } from '../components/Fx';
import { Logo } from '../components/Logo';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { COLORS } from '../config/theme';

/**
 * Cena (interface) — "Previsao da semana": IA, calendario e meta.
 * Arte: 934F3467-1214-4325-82FB-EA619BEFDCFB.png
 * Narracao: "E ainda define metas para saber exatamente onde quer chegar."
 */
export const S13Previsao: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill>
    <Scene total={total} zoom={0.022} driftY={-7} handheld={2.2}>
      <PlateScene
        scene="previsao"
        layers={[
          { id: 'title', delay: 8, from: 'left', distance: 90, blur: 16 },
          { id: 'sub', delay: 18, from: 'left', distance: 70, blur: 12 },
          { id: 'calendar', delay: 30, from: 'right', distance: 170, spring: 'snappy', float: 4 },
          { id: 'chart', delay: 54, from: 'up', distance: 150, spring: 'snappy', float: 4, phase: 2, sweepAt: 150 },
          // a linha do gráfico se desenha dentro do card
          { id: 'chartLine', delay: 78, from: 'none', wipe: 'right', wipeDur: 86, blur: 0, float: 4, phase: 2 },
          { id: 'assistant', delay: 110, from: 'left', distance: 150, spring: 'pop', float: 5, phase: 1 },
          { id: 'goal', delay: 126, from: 'right', distance: 160, spring: 'pop', glow: 'rgba(5,213,142,0.5)', float: 5, phase: 3 },
          { id: 'pillL', delay: 180, from: 'up', distance: 70, spring: 'pop' },
          { id: 'pillR', delay: 190, from: 'up', distance: 70, spring: 'pop' },
        ]}
      >
        <Logo
          size={86}
          color={COLORS.ink}
          delay={0}
          style={{ position: 'absolute', left: 40, top: 56 }}
        />
      </PlateScene>
      <Sparks count={22} delay={128} origin={[940, 1310]} spread={280} rise={200} color={COLORS.greenNeon} seed="prev" />
    </Scene>

    <Flash at={54} dur={7} max={0.26} />
    <LightSweep delay={80} dur={46} />

    <SfxTrack
      cues={[
        { name: 'whooshTransition', at: 0, volume: 0.78 },
        { name: 'popSoft', at: 8 },
        { name: 'whooshShort', at: 18, rate: 1.1 },
        { name: 'popUi', at: 30 },
        { name: 'tickMicro', at: 44 },
        { name: 'whooshShort', at: 54, rate: 0.9 },
        { name: 'bassHit', at: 56, volume: 0.6 },
        { name: 'riserShort', at: 96, volume: 0.42 },
        { name: 'notificationPop', at: 110 },
        { name: 'popSoft', at: 118 },
        { name: 'successChime', at: 126, volume: 0.8 },
        { name: 'sparkleShine', at: 130 },
        { name: 'tickMicro', at: 150 },
        { name: 'popUi', at: 180 },
        { name: 'popUi', at: 190, rate: 1.08 },
        { name: 'popSoft', at: 320, volume: 0.45 },
      ]}
    />
  </AbsoluteFill>
);
