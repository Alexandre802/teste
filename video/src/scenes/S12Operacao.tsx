import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Flash, GlitchSlices, LightSweep, Sparks } from '../components/Fx';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { COLORS } from '../config/theme';

/**
 * Cena (interface, escura) — calculadora de surebets.
 * Arte: E0DC9E01-269F-49F1-9848-AD7A3166FE2F.png
 * Narracao: "Registra suas surebets em uma calculadora inteligente,
 * acompanha lucro, percentual sobre o investimento..."
 */
export const S12Operacao: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill style={{ background: COLORS.bgDarkDeep }}>
    <Scene total={total} zoom={0.022} driftY={-7} handheld={2.4}>
      <PlateScene
        scene="operacao"
        layers={[
          { id: 'logo', delay: 0, from: 'left', distance: 70, blur: 12 },
          { id: 'title', delay: 10, from: 'up', distance: 46, blur: 16 },
          { id: 'card1', delay: 26, from: 'up', distance: 220, spring: 'snappy', glow: 'rgba(5,213,142,0.45)', float: 5, sweepAt: 130 },
          { id: 'card2', delay: 42, from: 'up', distance: 220, spring: 'snappy', glow: 'rgba(5,213,142,0.45)', float: 5, phase: 2, sweepAt: 146 },
          { id: 'statL', delay: 108, from: 'up', distance: 90, spring: 'pop', float: 4, phase: 1 },
          { id: 'statR', delay: 122, from: 'up', distance: 90, spring: 'pop', float: 4, phase: 3 },
        ]}
      />
      <Sparks count={24} delay={26} origin={[540, 900]} spread={430} rise={300} color={COLORS.greenNeon} seed="op" />
    </Scene>

    <GlitchSlices at={0} dur={10} slices={12} amount={56} />
    <Flash at={0} dur={7} color="#0AFFB0" max={0.3} />
    <LightSweep delay={70} dur={48} color="rgba(160,255,222,0.5)" />

    <SfxTrack
      cues={[
        { name: 'glitchDigital', at: 0, volume: 1.1 },
        { name: 'subBoom', at: 0, volume: 0.9 },
        { name: 'whooshTransition', at: 1, volume: 0.85, rate: 0.86 },
        { name: 'popSoft', at: 10 },
        { name: 'reverseWhoosh', at: 18, volume: 0.6 },
        { name: 'whooshShort', at: 26, rate: 0.9 },
        { name: 'whooshShort', at: 42, rate: 0.96 },
        { name: 'sparkleShine', at: 52 },
        { name: 'clickDigital', at: 60 },
        { name: 'tickMicro', at: 96 },
        { name: 'tickMicro', at: 102, rate: 1.1 },
        { name: 'successChime', at: 108, volume: 0.85 },
        { name: 'bassHit', at: 108, volume: 0.6 },
        { name: 'popUi', at: 122 },
        { name: 'tickMicro', at: 146 },
        { name: 'popSoft', at: 300, volume: 0.5 },
      ]}
    />
  </AbsoluteFill>
);
