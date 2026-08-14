import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Flash, Shards, SpeedLines } from '../components/Fx';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';

/**
 * Cena (interface) — receitas x despesas x resultado.
 * Arte: 5F0A4926-BA0B-49C5-8626-D2B40D37A110.png
 * Os cards sao os recortes da propria arte, animados sobre o plate.
 * Narracao: "...ganhos e gastos espalhados em anotacoes, planilhas e contas."
 */
export const S03Caos: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill>
    <Scene total={total} zoom={0.022} driftY={-7} handheld={2.4}>
      <PlateScene
        scene="caos"
        layers={[
          { id: 'logo', delay: 0, from: 'left', distance: 70, blur: 12 },
          { id: 'cardIn', delay: 20, from: 'left', distance: 300, spring: 'snappy', rotate: -5, float: 4, sweepAt: 96 },
          { id: 'cardOut', delay: 34, from: 'right', distance: 300, spring: 'snappy', rotate: 5, float: 4, phase: 2, sweepAt: 108 },
          { id: 'cardResult', delay: 96, from: 'scale', spring: 'pop', glow: 'rgba(3,179,119,0.5)', float: 5, phase: 4, sweepAt: 190 },
        ]}
      />
      <SpeedLines delay={2} dur={30} count={40} color="rgba(220,58,63,0.10)" />
      <Shards count={30} delay={44} />
    </Scene>

    <Flash at={0} dur={7} color="#FFD9D3" max={0.4} />
    <Flash at={44} dur={9} color="#FFD9D3" max={0.42} />

    <SfxTrack
      cues={[
        { name: 'whooshTransition', at: 0, volume: 0.8 },
        { name: 'riserShort', at: 4, volume: 0.5 },
        { name: 'whooshShort', at: 20 },
        { name: 'popSoft', at: 30 },
        { name: 'whooshShort', at: 34, rate: 1.1 },
        { name: 'popSoft', at: 44, rate: 1.1 },
        { name: 'impactHit', at: 44, volume: 0.95 },
        { name: 'subBoom', at: 44, volume: 0.7 },
        { name: 'glitchDigital', at: 50 },
        { name: 'tickMicro', at: 76 },
        { name: 'tickMicro', at: 86, rate: 1.15 },
        { name: 'notificationPop', at: 96 },
        { name: 'bassHit', at: 96, volume: 0.7 },
        { name: 'sparkleShine', at: 112, volume: 0.55 },
        { name: 'successChime', at: 190, volume: 0.5 },
        { name: 'tickMicro', at: 300, rate: 0.9 },
        { name: 'popSoft', at: 380, volume: 0.5 },
      ]}
    />
  </AbsoluteFill>
);
