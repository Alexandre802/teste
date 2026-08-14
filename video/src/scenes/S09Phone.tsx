import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LightSweep, Sparks } from '../components/Fx';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { COLORS } from '../config/theme';

/**
 * Cena (interface) — mockup do app, "Veja o lucro real".
 * Arte: 133BCCC2-5D93-4FE2-8763-C59A943458A1.png
 * Narracao: "Uma plataforma criada para quem trabalha com metodos,
 * apostas esportivas e surebets..."
 */
export const S09Phone: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill>
    <Scene total={total} zoom={0.022} driftY={-7} handheld={2.6}>
      <PlateScene
        scene="phone"
        layers={[
          { id: 'logo', delay: 0, from: 'left', distance: 70, blur: 12 },
          { id: 'title', delay: 8, from: 'up', distance: 44, blur: 16 },
          { id: 'phone', delay: 18, from: 'up', distance: 190, spring: 'heavy', rotate: 2, blur: 20, float: 5, sweepAt: 150 },
          { id: 'chipLeft', delay: 74, from: 'left', distance: 170, spring: 'pop', rotate: -6, float: 6, phase: 1 },
          { id: 'badgeRight', delay: 98, from: 'right', distance: 180, spring: 'pop', rotate: 6, float: 6, phase: 3 },
        ]}
      />
      <Sparks count={20} delay={100} origin={[900, 1120]} spread={280} rise={200} color={COLORS.greenNeon} seed="ph" />
    </Scene>

    <LightSweep delay={30} dur={44} />
    <LightSweep delay={230} dur={48} />

    <SfxTrack
      cues={[
        { name: 'whooshTransition', at: 0, volume: 0.8 },
        { name: 'popSoft', at: 8 },
        { name: 'whooshShort', at: 18 },
        { name: 'bassHit', at: 22, volume: 0.72 },
        { name: 'clickDigital', at: 40 },
        { name: 'tickMicro', at: 52 },
        { name: 'tickMicro', at: 62, rate: 1.1 },
        { name: 'whooshShort', at: 74, rate: 1.18 },
        { name: 'popUi', at: 82 },
        { name: 'whooshShort', at: 98, rate: 1.1 },
        { name: 'notificationPop', at: 106 },
        { name: 'sparkleShine', at: 112, volume: 0.7 },
        { name: 'tickMicro', at: 150 },
        { name: 'popSoft', at: 230, volume: 0.5 },
        { name: 'tickMicro', at: 330, rate: 0.92 },
      ]}
    />
  </AbsoluteFill>
);
