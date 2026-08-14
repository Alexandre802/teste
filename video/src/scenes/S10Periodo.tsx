import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { LightSweep, Sparks } from '../components/Fx';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { prog } from '../components/anim';
import { COLORS, EASE } from '../config/theme';

/** Brilho que percorre a seta da arte, dando movimento ao grafico. */
const ArrowTravel: React.FC<{ delay: number; dur: number }> = ({ delay, dur }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.inOut);
  const L = 2000;
  const d =
    'M -90 1560 C 120 1500, 300 1420, 420 1330 C 600 1200, 760 1120, 1000 860';
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
      <defs>
        <filter id="atg" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="rgba(230,255,245,0.9)"
        strokeWidth={26}
        strokeLinecap="round"
        filter="url(#atg)"
        strokeDasharray={`170 ${L}`}
        strokeDashoffset={L * 0.1 - p * (L + 340)}
        opacity={p > 0 && p < 1 ? 0.85 : 0}
      />
    </svg>
  );
};

/**
 * Cena (interface) — "Acompanhe por periodo".
 * Arte: 5E1A6311-5E30-42B3-8096-D854D854D4DD.png
 * As abas sao recortes da propria arte; a selecao do "Mes" ganha um pop.
 * Narracao: "Voce acompanha tudo que entrou e saiu por dia, semana, mes,
 * 90 dias ou ano."
 */
export const S10Periodo: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill>
    <Scene total={total} zoom={0.022} driftY={-7} handheld={2.2}>
      <PlateScene
        scene="periodo"
        layers={[
          { id: 'logo', delay: 0, from: 'left', distance: 70, blur: 12 },
          { id: 'chipTop', delay: 12, from: 'right', distance: 130, spring: 'pop', float: 4 },
          { id: 'tab0', delay: 30, from: 'scale', spring: 'pop', blur: 10 },
          { id: 'tab1', delay: 37, from: 'scale', spring: 'pop', blur: 10 },
          { id: 'tab2', delay: 44, from: 'scale', spring: 'pop', blur: 10, glow: 'rgba(3,80,54,0.45)' },
          { id: 'tab3', delay: 51, from: 'scale', spring: 'pop', blur: 10 },
          { id: 'tab4', delay: 58, from: 'scale', spring: 'pop', blur: 10 },
          { id: 'chipBottom', delay: 200, from: 'left', distance: 130, spring: 'pop', float: 4, phase: 2 },
        ]}
      />
      <ArrowTravel delay={86} dur={80} />
      <Sparks count={18} delay={160} origin={[960, 940]} spread={260} rise={210} color={COLORS.greenNeon} seed="per" />
    </Scene>

    <LightSweep delay={26} dur={38} />

    <SfxTrack
      cues={[
        { name: 'whooshTransition', at: 0, volume: 0.78 },
        { name: 'popSoft', at: 12 },
        { name: 'popUi', at: 30 },
        { name: 'popUi', at: 37, rate: 1.05 },
        { name: 'tapButton', at: 44, volume: 1.15 },
        { name: 'clickDigital', at: 46 },
        { name: 'popUi', at: 51, rate: 1.15 },
        { name: 'popUi', at: 58, rate: 1.2 },
        { name: 'riserShort', at: 78, volume: 0.5 },
        { name: 'whooshTransition', at: 86, volume: 0.72, rate: 0.9 },
        { name: 'tickMicro', at: 100 },
        { name: 'tickMicro', at: 112, rate: 1.08 },
        { name: 'tickMicro', at: 124, rate: 1.16 },
        { name: 'tickMicro', at: 136, rate: 1.24 },
        { name: 'impactHit', at: 160, volume: 0.72 },
        { name: 'sparkleShine', at: 162 },
        { name: 'popSoft', at: 200, rate: 0.95 },
      ]}
    />
  </AbsoluteFill>
);
