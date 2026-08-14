import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Flash, GlitchSlices, LightSweep, Sparks } from '../components/Fx';
import { Logo } from '../components/Logo';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { COLORS } from '../config/theme';

/**
 * Cena 5 (46,4s–53,7s) — calculadora de surebets.
 * Arte: E0DC9E01-269F-49F1-9848-AD7A3166FE2F.png
 *
 * Fundo: as colunas de vidro sobem e a estrela do canto gira devagar
 * durante toda a cena. Os numeros dos cards rolam para o lugar e a luz
 * corre pelos fios que ligam os cards aos resultados.
 */
export const S12Operacao: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill style={{ background: COLORS.bgDarkDeep }}>
    <Scene total={total} zoom={0.022} driftY={-7} handheld={2.4}>
      <PlateScene
        scene="operacao"
        layers={[
          // --- fundo ---
          { id: 'cols', delay: 6, from: 'none', wipe: 'up', wipeDur: 74, blur: 0 },
          { id: 'star', delay: 10, from: 'scale', spring: 'soft', blur: 10, spin: 0.16 },

          { id: 'title', delay: 14, from: 'up', distance: 46, blur: 16 },

          // --- cards de sugestao ---
          { id: 'card1', delay: 30, from: 'up', distance: 220, spring: 'snappy', glow: 'rgba(5,213,142,0.45)', float: 5, sweepAt: 160 },
          { id: 'num1', delay: 54, from: 'none', roll: true, rollDur: 26, blur: 0, float: 5 },
          { id: 'card2', delay: 44, from: 'up', distance: 220, spring: 'snappy', glow: 'rgba(5,213,142,0.45)', float: 5, phase: 2, sweepAt: 176 },
          { id: 'num2', delay: 68, from: 'none', roll: true, rollDur: 26, blur: 0, float: 5, phase: 2 },

          // --- fiacao com luz correndo ---
          { id: 'wires', delay: 92, from: 'none', wipe: 'down', wipeDur: 34, blur: 0, sweepAt: 100, sweepLoop: 74 },

          // --- resultados ---
          { id: 'statL', delay: 126, from: 'up', distance: 90, spring: 'pop', float: 4, phase: 1 },
          { id: 'numL', delay: 148, from: 'none', roll: true, rollDur: 24, blur: 0, float: 4, phase: 1 },
          { id: 'statR', delay: 138, from: 'up', distance: 90, spring: 'pop', float: 4, phase: 3 },
          { id: 'numR', delay: 160, from: 'none', roll: true, rollDur: 24, blur: 0, float: 4, phase: 3 },
        ]}
      >
        <Logo
          size={100}
          color="#FFFFFF"
          delay={2}
          glow
          style={{ position: 'absolute', left: 44, top: 100 }}
        />
      </PlateScene>

      <Sparks count={24} delay={30} origin={[540, 900]} spread={430} rise={300} color={COLORS.greenNeon} seed="op" />
    </Scene>

    <GlitchSlices at={0} dur={10} slices={12} amount={56} />
    <Flash at={0} dur={7} color="#0AFFB0" max={0.3} />
    <LightSweep delay={80} dur={48} color="rgba(160,255,222,0.5)" />

    <SfxTrack
      cues={[
        { name: 'glitchDigital', at: 0, volume: 1.1 },
        { name: 'subBoom', at: 0, volume: 0.9 },
        { name: 'whooshTransition', at: 1, volume: 0.85, rate: 0.86 },
        { name: 'riserShort', at: 6, volume: 0.45 },
        { name: 'popSoft', at: 14 },
        { name: 'reverseWhoosh', at: 22, volume: 0.6 },
        { name: 'whooshShort', at: 30, rate: 0.9 },
        { name: 'tickMicro', at: 54 },
        { name: 'whooshShort', at: 44, rate: 0.96 },
        { name: 'tickMicro', at: 68, rate: 1.08 },
        { name: 'sparkleShine', at: 76 },
        { name: 'clickDigital', at: 92 },
        { name: 'tickMicro', at: 100, rate: 1.2 },
        { name: 'tickMicro', at: 118, rate: 1.24 },
        { name: 'successChime', at: 126, volume: 0.85 },
        { name: 'bassHit', at: 126, volume: 0.6 },
        { name: 'popUi', at: 138 },
        { name: 'tickMicro', at: 148, rate: 0.95 },
        { name: 'tickMicro', at: 160, rate: 1.02 },
        { name: 'popSoft', at: 300, volume: 0.5 },
      ]}
    />
  </AbsoluteFill>
);
