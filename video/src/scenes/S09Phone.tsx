import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { LightSweep, Sparks } from '../components/Fx';
import { Logo } from '../components/Logo';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { prog } from '../components/anim';
import { COLORS } from '../config/theme';

/** Halo de luz que orbita o aparelho durante toda a cena. */
const OrbitLight: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 40);
  const a = frame * 0.9; // graus por frame
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: p }}>
      {[0, 1, 2].map((i) => {
        const ang = ((a + i * 120) * Math.PI) / 180;
        const rx = 330 + i * 34;
        const ry = 560 + i * 40;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 540 + Math.cos(ang) * rx - 120,
              top: 990 + Math.sin(ang) * ry - 120,
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(123,255,214,${0.30 - i * 0.07}) 0%, rgba(5,213,142,0) 70%)`,
              filter: 'blur(26px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Cena 3 (33,2s–40,6s) — mockup do app, "Veja o lucro real".
 * Arte: 133BCCC2-5D93-4FE2-8763-C59A943458A1.png
 *
 * A luz do fundo gira em volta do aparelho durante toda a cena. Dentro da
 * tela, saudacao, valor, cards e lista entram em cascata, e a linha do
 * grafico sobe — tanto na tela quanto no card lateral.
 */
export const S09Phone: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill>
    <Scene total={total} zoom={0.055} driftX={12} driftY={-14} handheld={2.8} punches={[18, 54, 132]}>
      <PlateScene
        scene="phone"
        layers={[
          { id: 'title', delay: 8, from: 'none', wipe: 'right', wipeDur: 38, blur: 0 },
          { id: 'phone', delay: 18, from: 'up', distance: 190, spring: 'heavy', rotate: 2, blur: 20, float: 5 },

          // --- conteudo da tela, em cascata ---
          { id: 'scrGreet', delay: 44, from: 'left', distance: 40, blur: 8, float: 5 },
          { id: 'scrTotal', delay: 54, from: 'up', distance: 34, spring: 'pop', blur: 8, float: 5, sweepAt: 150 },
          { id: 'scrSkel', delay: 64, from: 'up', distance: 26, blur: 6, float: 5 },
          // a linha do grafico sobe desenhando
          { id: 'scrChart', delay: 74, from: 'none', wipe: 'right', wipeDur: 78, blur: 0, float: 5 },
          { id: 'scrRows', delay: 104, from: 'left', distance: 46, blur: 8, float: 5 },
          { id: 'scrNav', delay: 120, from: 'up', distance: 20, blur: 6, float: 5 },

          { id: 'chipLeft', delay: 84, from: 'left', distance: 170, spring: 'pop', rotate: -6, float: 6, phase: 1 },
          // o mesmo desenho de linha no card lateral
          { id: 'chipChart', delay: 104, from: 'none', wipe: 'right', wipeDur: 70, blur: 0, float: 6, phase: 1 },
          { id: 'badgeRight', delay: 132, from: 'right', distance: 180, spring: 'pop', rotate: 6, float: 6, phase: 3, sweepAt: 176, sweepLoop: 120 },
        ]}
      >
        <Logo
          size={86}
          color={COLORS.ink}
          delay={0}
          style={{ position: 'absolute', left: 52, top: 50 }}
        />
      </PlateScene>

      <OrbitLight delay={10} />
      <Sparks count={20} delay={140} origin={[900, 1120]} spread={280} rise={200} color={COLORS.greenNeon} seed="ph" />
    </Scene>

    <LightSweep delay={30} dur={44} />
    <LightSweep delay={260} dur={48} />

    <SfxTrack
      cues={[
        { name: 'whooshTransition', at: 0, volume: 0.8 },
        { name: 'popSoft', at: 8 },
        { name: 'whooshShort', at: 18 },
        { name: 'bassHit', at: 22, volume: 0.72 },
        { name: 'clickDigital', at: 44 },
        { name: 'popSoft', at: 54 },
        { name: 'tickMicro', at: 64 },
        { name: 'riserShort', at: 72, volume: 0.4 },
        { name: 'whooshShort', at: 84, rate: 1.18 },
        { name: 'popUi', at: 104 },
        { name: 'popSoft', at: 110, rate: 1.06 },
        { name: 'popSoft', at: 116, rate: 1.12 },
        { name: 'clickDigital', at: 120, rate: 1.1 },
        { name: 'whooshShort', at: 132, rate: 1.1 },
        { name: 'notificationPop', at: 140 },
        { name: 'sparkleShine', at: 146, volume: 0.7 },
        { name: 'tickMicro', at: 200 },
        { name: 'popSoft', at: 300, volume: 0.5 },
        { name: 'tickMicro', at: 380, rate: 0.92 },
      ]}
    />
  </AbsoluteFill>
);
