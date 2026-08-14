import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Flash, Shards, SpeedLines } from '../components/Fx';
import { Logo } from '../components/Logo';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { COLORS } from '../config/theme';

/**
 * Cena 1 (5,0s–14,0s) — receitas x despesas x resultado.
 * Arte: 5F0A4926-BA0B-49C5-8626-D2B40D37A110.png
 *
 * Fundo animado: as cedulas caem devagar (deriva com tombo), as colunas
 * translucidas sobem e as linhas de tendencia se desenham. Os numeros dos
 * cards rolam para o lugar.
 */
export const S03Caos: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill>
    <Scene total={total} zoom={0.022} driftY={-7} handheld={2.4}>
      <PlateScene
        scene="caos"
        layers={[
          // --- fundo ---
          // colunas sobem antes de tudo
          { id: 'bars', delay: 4, from: 'none', wipe: 'up', wipeDur: 64, blur: 0 },
          // linhas de tendencia se desenham da esquerda para a direita
          { id: 'trend', delay: 16, from: 'none', wipe: 'right', wipeDur: 96, blur: 0 },
          // cedulas caindo devagar, cada uma com deriva e tombo proprios
          { id: 'note1', delay: 0, from: 'none', blur: 0, orbit: { rx: 16, ry: 46, spin: 7, speed: 0.0072 }, phase: 0 },
          { id: 'note2', delay: 0, from: 'none', blur: 0, orbit: { rx: 12, ry: 52, spin: 9, speed: 0.0061 }, phase: 1.2 },
          { id: 'note3', delay: 0, from: 'none', blur: 0, orbit: { rx: 10, ry: 40, spin: 6, speed: 0.0083 }, phase: 2.4 },
          { id: 'note4', delay: 0, from: 'none', blur: 0, orbit: { rx: 18, ry: 58, spin: 8, speed: 0.0055 }, phase: 3.6 },
          { id: 'note5', delay: 0, from: 'none', blur: 0, orbit: { rx: 14, ry: 44, spin: 10, speed: 0.0069 }, phase: 4.8 },
          { id: 'note6', delay: 0, from: 'none', blur: 0, orbit: { rx: 11, ry: 36, spin: 7, speed: 0.0077 }, phase: 6.0 },

          // --- cards ---
          { id: 'cardIn', delay: 20, from: 'left', distance: 300, spring: 'snappy', rotate: -5, float: 4, sweepAt: 120 },
          { id: 'cardOut', delay: 34, from: 'right', distance: 300, spring: 'snappy', rotate: 5, float: 4, phase: 2, sweepAt: 132 },
          { id: 'numIn', delay: 46, from: 'none', roll: true, rollDur: 26, blur: 0, float: 4 },
          { id: 'numOut', delay: 58, from: 'none', roll: true, rollDur: 26, blur: 0, float: 4, phase: 2 },
          { id: 'cardResult', delay: 96, from: 'scale', spring: 'pop', glow: 'rgba(3,179,119,0.5)', float: 5, phase: 4, sweepAt: 210 },
          { id: 'numResult', delay: 118, from: 'none', roll: true, rollDur: 30, blur: 0, float: 5, phase: 4 },
        ]}
      >
        <Logo
          size={92}
          color={COLORS.ink}
          delay={0}
          style={{ position: 'absolute', left: 76, top: 118 }}
        />
      </PlateScene>

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
        { name: 'tickMicro', at: 46 },
        { name: 'tickMicro', at: 58, rate: 1.15 },
        { name: 'glitchDigital', at: 66 },
        { name: 'notificationPop', at: 96 },
        { name: 'bassHit', at: 96, volume: 0.7 },
        { name: 'tickMicro', at: 118, rate: 0.95 },
        { name: 'sparkleShine', at: 130, volume: 0.55 },
        { name: 'successChime', at: 210, volume: 0.5 },
        { name: 'popSoft', at: 380, volume: 0.5 },
      ]}
    />
  </AbsoluteFill>
);
