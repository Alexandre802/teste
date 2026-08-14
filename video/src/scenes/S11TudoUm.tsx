import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgLight } from '../components/Bg';
import { IsoArrow, IsoBars } from '../components/Charts';
import { LightSweep, Sparks } from '../components/Fx';
import { ArrowDown, ArrowUp, Equals } from '../components/Icons';
import { Logo } from '../components/Logo';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { UiText } from '../components/Type';
import { Counter, IconBadge } from '../components/Ui';
import { breathe, prog, springAt } from '../components/anim';
import { COLORS, FONTS, SHADOW, SPRINGS } from '../config/theme';
import { COPY } from '../config/timeline';

/** Geometria dos três cards, medida sobre a arte de referência. */
const CARDS = [
  { x: 94, y: 706, w: 296, h: 452, delay: 10, glow: false },
  { x: 367, y: 1251, w: 305, h: 490, delay: 20, glow: false },
  { x: 626, y: 476, w: 367, h: 556, delay: 30, glow: true },
];

/** Nós do conector que liga os cards. */
const LINK = [
  [270, 1168],
  [516, 1246],
  [772, 1010],
] as [number, number][];

/**
 * Cena 11 — "Tudo em um só lugar": entrou, saiu, sobrou.
 * Referência: E58E53D7-0A8F-4D72-A326-B81F80680365.png
 */
export const S11TudoUm: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const link = prog(frame, 40, 22);

  return (
    <AbsoluteFill>
      <BgLight tone="cool" charts={false} grain={0.16} />

      <Scene total={total} zoom={0.05} driftY={-12}>
        <Logo
          size={74}
          color={COLORS.ink}
          delay={0}
          style={{ position: 'absolute', left: 100, top: 124 }}
        />

        <div
          style={{
            position: 'absolute',
            top: 300,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONTS.ui,
            fontWeight: 400,
            fontSize: 56,
            letterSpacing: '-0.02em',
            color: COLORS.inkSoft,
            opacity: prog(frame, 2, 14),
            transform: `translateY(${(1 - prog(frame, 2, 18)) * 22}px)`,
          }}
        >
          {COPY.s11.title}
        </div>

        {/* barras 3D e seta ao fundo */}
        <IsoBars
          values={[0.42, 0.3, 0.58, 0.74, 0.5, 0.9, 0.66]}
          width={980}
          height={520}
          delay={44}
          step={4}
          gap={22}
          depth={22}
          opacity={0.85}
          style={{ left: 40, top: 1330 }}
        />
        <IsoArrow width={900} height={520} delay={54} dur={40} style={{ left: 120, top: 1290 }} />

        {/* conector entre os cards */}
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path
            d={`M ${LINK[0][0]} ${LINK[0][1]} L ${LINK[1][0]} ${LINK[1][1]} L ${LINK[2][0]} ${LINK[2][1]}`}
            fill="none"
            stroke={COLORS.greenBright}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={900}
            strokeDashoffset={900 * (1 - link)}
          />
        </svg>

        {/* cards */}
        {COPY.s11.cards.map((c, i) => {
          const g = CARDS[i];
          const s = springAt(frame, fps, g.delay, SPRINGS.snappy);
          const isRed = c.tone === 'red';
          const Icon = c.icon === 'up' ? ArrowUp : c.icon === 'down' ? ArrowDown : Equals;
          const glowP = prog(frame, g.delay + 22, 26);
          return (
            <div
              key={c.label}
              style={{
                position: 'absolute',
                left: g.x,
                top: g.y,
                width: g.w,
                height: g.h,
                borderRadius: 34,
                background: COLORS.white,
                boxShadow: g.glow
                  ? `${SHADOW.cardHi}, 0 0 ${70 * glowP}px rgba(5,213,142,${0.55 * glowP})`
                  : SHADOW.cardHi,
                opacity: prog(frame, g.delay, 12),
                transform: `translateY(${(1 - s) * 90}px) scale(${0.9 + s * 0.1}) translateY(${breathe(frame, 0.024, 6, i * 1.7)}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: g.h * 0.11,
                gap: g.h * 0.055,
              }}
            >
              <IconBadge
                bg={isRed ? COLORS.redPale : COLORS.greenPaler}
                size={g.w * 0.36}
                round
                delay={g.delay + 8}
              >
                <Icon
                  size={g.w * 0.19}
                  color={isRed ? COLORS.red : COLORS.green}
                  strokeWidth={2.6}
                />
              </IconBadge>
              <UiText size={g.w * 0.13} weight={500} color={COLORS.ink} delay={g.delay + 12}>
                {c.label}
              </UiText>
              <div
                style={{
                  width: g.w * 0.72,
                  height: 2,
                  background: '#E9EDEC',
                  transform: `scaleX(${prog(frame, g.delay + 14, 16)})`,
                }}
              />
              <Counter
                to={c.value}
                delay={g.delay + 16}
                dur={30}
                prefix="R$ "
                size={g.w * 0.155}
                weight={600}
                color={isRed ? COLORS.red : COLORS.green}
              />
            </div>
          );
        })}

        {/* nós do conector — desenhados acima dos cards, como na arte */}
        <svg
          width={1080}
          height={1920}
          style={{ position: 'absolute', left: 0, top: 0, zIndex: 5 }}
        >
          {LINK.map((p, i) => {
            const s = prog(frame, 44 + i * 8, 14);
            return (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r={24 * s} fill={COLORS.white} />
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={24 * s}
                  fill="none"
                  stroke={COLORS.greenBright}
                  strokeWidth={7}
                />
              </g>
            );
          })}
        </svg>
      </Scene>

      <Sparks
        count={20}
        delay={44}
        origin={[810, 740]}
        spread={300}
        rise={220}
        color={COLORS.greenNeon}
        seed="tudo"
      />
      <LightSweep delay={58} dur={38} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.75 },
          { name: 'popSoft', at: 2 },
          { name: 'whooshShort', at: 10 },
          { name: 'popUi', at: 17 },
          { name: 'whooshShort', at: 20, rate: 1.08 },
          { name: 'popUi', at: 27, rate: 1.06 },
          { name: 'whooshShort', at: 30, rate: 0.92 },
          { name: 'popUi', at: 37, rate: 0.94 },
          { name: 'tickMicro', at: 40 },
          { name: 'successChime', at: 46, volume: 0.8 },
          { name: 'bassHit', at: 46, volume: 0.6 },
          { name: 'tickMicro', at: 50, rate: 1.1 },
          { name: 'whooshShort', at: 54, rate: 0.86 },
          { name: 'sparkleShine', at: 58, volume: 0.7 },
        ]}
      />
    </AbsoluteFill>
  );
};
