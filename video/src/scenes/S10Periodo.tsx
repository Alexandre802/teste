import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgLight } from '../components/Bg';
import { GlowArrow } from '../components/Charts';
import { LightSweep, Sparks } from '../components/Fx';
import { Logo } from '../components/Logo';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { RingChip, Tab } from '../components/Ui';
import { prog, springAt, tween } from '../components/anim';
import { COLORS, EASE, FONTS, SPRINGS } from '../config/theme';
import { COPY } from '../config/timeline';

/** Posições dos nós ao longo da curva (proporcionais a 1080x1920). */
const NODES = [
  { x: 78, y: 1478 },
  { x: 250, y: 1388 },
  { x: 402, y: 1327 },
  { x: 586, y: 1246 },
  { x: 764, y: 1114 },
  { x: 918, y: 1010 },
];

/**
 * Cena 10 — "Acompanhe por período" (dia/semana/mês/90 dias/ano).
 * Referência: 5E1A6311-5E30-42B3-8096-D854D854D4DD.png
 * As abas são camadas independentes e a seleção do "Mês" é animada.
 */
export const S10Periodo: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // seleção da aba "Mês" acontece depois que as abas entram
  const select = tween(frame, [26, 42], [0, 1], EASE.back);

  return (
    <AbsoluteFill>
      <BgLight tone="cool" charts={false} grain={0.16} />

      <Scene total={total} zoom={0.05} driftY={-12}>
        <Logo
          size={80}
          color={COLORS.greenDeep}
          delay={0}
          style={{ position: 'absolute', left: 90, top: 214 }}
        />

        <RingChip
          label={COPY.s10.chipTop}
          delay={6}
          size={31}
          from="right"
          style={{ position: 'absolute', left: 520, top: 522 }}
        />

        {/* abas */}
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 692,
            width: 940,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {COPY.s10.tabs.map((t, i) => (
            <Tab
              key={t}
              label={t}
              active={i === COPY.s10.activeTab}
              activeProgress={select}
              delay={12 + i * 3}
              size={34}
            />
          ))}
        </div>

        {/* seta luminosa — a curva passa exatamente pelos nós */}
        <GlowArrow
          width={1080}
          height={1920}
          points={[{ x: -90, y: 1560 }, ...NODES].map((n) => [n.x, n.y] as [number, number])}
          tip={[978, 882]}
          tipAngle={-50}
          delay={40}
          dur={58}
          style={{ left: 0, top: 0 }}
        />

        {/* nós + hastes até os rótulos dos meses */}
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
          {NODES.map((n, i) => {
            const d = 50 + i * 6;
            const p = prog(frame, d, 18, EASE.back);
            const stem = prog(frame, d + 4, 16);
            const stemTo = 1530;
            return (
              <g key={i}>
                <line
                  x1={n.x}
                  y1={n.y + 26}
                  x2={n.x}
                  y2={n.y + 26 + (stemTo - n.y - 26) * stem}
                  stroke={COLORS.greenBright}
                  strokeWidth={2}
                  strokeDasharray="6 7"
                  opacity={0.5 * stem}
                />
                <circle cx={n.x} cy={n.y} r={27 * p} fill={COLORS.white} />
                <circle cx={n.x} cy={n.y} r={13 * p} fill={COLORS.greenDeep} />
              </g>
            );
          })}
        </svg>

        {COPY.s10.months.map((m, i) => {
          const d = 55 + i * 6;
          const p = prog(frame, d, 16);
          return (
            <div
              key={m}
              style={{
                position: 'absolute',
                left: NODES[i].x,
                top: 1546,
                transform: `translateX(-50%) translateY(${(1 - p) * 18}px)`,
                fontFamily: FONTS.ui,
                fontWeight: 400,
                fontSize: 34,
                color: COLORS.inkSoft,
                opacity: p,
              }}
            >
              {m}
            </div>
          );
        })}

        <RingChip
          label={COPY.s10.chipBottom}
          delay={96}
          size={34}
          from="left"
          style={{ position: 'absolute', left: 660, top: 1638 }}
        />
      </Scene>

      <Sparks
        count={18}
        delay={92}
        origin={[960, 1000]}
        spread={260}
        rise={200}
        color={COLORS.greenNeon}
        seed="per"
      />
      <LightSweep delay={24} dur={34} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.78 },
          { name: 'popSoft', at: 6 },
          { name: 'popUi', at: 12 },
          { name: 'popUi', at: 15, rate: 1.05 },
          { name: 'popUi', at: 18, rate: 1.1 },
          { name: 'popUi', at: 21, rate: 1.15 },
          { name: 'popUi', at: 24, rate: 1.2 },
          { name: 'riserShort', at: 22, volume: 0.5 },
          { name: 'tapButton', at: 26, volume: 1.15 },
          { name: 'clickDigital', at: 28 },
          { name: 'whooshTransition', at: 40, volume: 0.72, rate: 0.9 },
          { name: 'tickMicro', at: 50 },
          { name: 'tickMicro', at: 56, rate: 1.06 },
          { name: 'tickMicro', at: 62, rate: 1.12 },
          { name: 'tickMicro', at: 68, rate: 1.18 },
          { name: 'tickMicro', at: 74, rate: 1.24 },
          { name: 'tickMicro', at: 80, rate: 1.3 },
          { name: 'impactHit', at: 92, volume: 0.75 },
          { name: 'sparkleShine', at: 92 },
          { name: 'popSoft', at: 96, rate: 0.95 },
        ]}
      />
    </AbsoluteFill>
  );
};
