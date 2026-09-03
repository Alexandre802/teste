import React from 'react';
import { Img, staticFile } from 'remotion';
import { Camera } from '../components/Camera';
import { Backdrop, CardClip } from '../components/Backdrop';
import { Logo } from '../components/Logo';
import { Headline } from '../components/Text';
import { Card, SkeletonLine } from '../components/Ui';
import { BarberIcon, CrossIcon, ScissorsIcon } from '../components/Icons';
import { Sfx } from '../components/Sfx';
import { COLORS, FONT, SHADOW } from '../theme';
import { enter, float, iv, p, pulse, s, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';
import { useSceneFrame } from '../lib/timing';

const T = TEXTS.s05;
const INSET: [number, number] = [50, 58];

const ICON = { scissors: ScissorsIcon, cross: CrossIcon, barber: BarberIcon };

/** Cartão com a "sombra" sólida lavanda deslocada, como nas artes. */
const StackedCard: React.FC<{
  width: number;
  height: number;
  delay: number;
  children: React.ReactNode;
  radius?: number;
  rotate?: number;
  driftPhase?: number;
}> = ({ width, height, delay, children, radius = 26, rotate = 0, driftPhase = 0 }) => {
  const frame = useSceneFrame();
  const e = enter(frame, { delay, y: 40, scale: 0.82, rotate, config: SPRING.pop, fade: 8 });
  const dy = float(frame, 5, 130, driftPhase);
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        opacity: e.opacity,
        transform: `${e.transform} translateY(${dy.toFixed(2)}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -11,
          top: 12,
          width,
          height,
          borderRadius: radius,
          background: COLORS.lavenderDeep,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: COLORS.white,
          boxShadow: SHADOW.cardSoft,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Da cliente para as opções de concorrentes, acompanhando a seta. */
const CAM = [
  { at: 0, scale: 1.0, y: 960 },
  { at: 70, scale: 1.22, x: 450, y: 1080 },
  { at: 130, scale: 1.18, x: 560, y: 1060 },
  { at: 190, scale: 1.24, x: 645, y: 1100 },
  { at: 262, scale: 1.02, y: 980 },
];

export const Scene05: React.FC = () => {
  const frame = useSceneFrame();
  const arrow = p(frame, 96, 132);
  const headScale = s(frame, { delay: 128, config: SPRING.bouncy });

  return (
    <Camera moves={CAM} drift={5}>
    <Backdrop
      inset={INSET}
      blobs={[
        { x: 1035, y: 70, r: 205, color: COLORS.primarySoft, delay: 0, drift: 8 },
        { x: 30, y: 1660, r: 250, color: COLORS.primary, delay: 4, drift: 12 },
        { x: 1055, y: 1800, r: 150, color: COLORS.primary, delay: 7, drift: 8 },
      ]}
      fans={[{ x: 935, y: 340, size: 148, color: COLORS.peach, rotate: 170, delay: 16 }]}
      strokes={[{ x: 52, y: 1500, size: 86, color: COLORS.peachSoft, rotate: 200, delay: 20 }]}
    >
      <CardClip inset={INSET}>
        <div style={{ position: 'absolute', left: 112, top: 108 }}>
          <Logo size={84} delay={2} fontSize={70} gap={20} />
        </div>

        <div style={{ position: 'absolute', left: 108, top: 330, width: 900 }}>
          <Headline
            lines={T.lines}
            fontSize={82}
            lineHeight={1.13}
            delay={10}
            stagger={3.2}
            lineStagger={6}
          />
        </div>

        {/* Seta tracejada: a cliente indo embora */}
        <svg
          style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920 }}
          viewBox="0 0 1080 1920"
        >
          <path
            d="M 420 1180 C 520 1200 600 1150 664 1094"
            fill="none"
            stroke={COLORS.lavenderDeep}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray="26 22"
            style={{ clipPath: `inset(0 ${((1 - arrow) * 100).toFixed(1)}% 0 0)` }}
          />
          <g transform={`translate(676 1086) rotate(-40) scale(${headScale.toFixed(3)})`}>
            <path d="M -14 -34 L 40 0 L -14 34 Z" fill={COLORS.primaryDeep} />
          </g>
        </svg>

        {/* Cartão da cliente */}
        <div style={{ position: 'absolute', left: 98, top: 966 }}>
          <StackedCard width={322} height={462} delay={54} radius={30} rotate={-3}>
            <div style={{ paddingTop: 4 }}>
              <div
                style={{
                  width: 178,
                  height: 178,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto',
                  border: `6px solid ${COLORS.white}`,
                  boxShadow: SHADOW.cardSoft,
                  transform: `scale(${s(frame, { delay: 60, config: SPRING.bouncy })})`,
                }}
              >
                <Img
                  src={staticFile(`photos/${T.person.photo}`)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div
                style={{
                  fontFamily: FONT.family,
                  fontWeight: FONT.bold,
                  fontSize: 42,
                  color: COLORS.dark,
                  textAlign: 'center',
                  marginTop: 26,
                  letterSpacing: '-0.025em',
                  opacity: iv(frame, [64, 74], [0, 1]),
                }}
              >
                {T.person.name}
              </div>
              <div
                style={{
                  fontFamily: FONT.family,
                  fontWeight: FONT.medium,
                  fontSize: 30,
                  color: COLORS.muted,
                  textAlign: 'center',
                  marginTop: 6,
                  opacity: iv(frame, [68, 78], [0, 1]),
                }}
              >
                {T.person.age}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  alignItems: 'center',
                  marginTop: 26,
                }}
              >
                <SkeletonLine width={210} height={20} delay={74} />
                <SkeletonLine width={210} height={20} delay={80} />
              </div>
            </div>
          </StackedCard>
        </div>

        {/* Opções para onde a cliente vai */}
        {[
          { i: 0, left: 700, top: 728, w: 241, h: 228, size: 96, delay: 108, rot: 2 },
          { i: 1, left: 740, top: 1022, w: 241, h: 284, size: 104, delay: 124, rot: -2 },
          { i: 2, left: 602, top: 1428, w: 241, h: 208, size: 96, delay: 140, rot: 3 },
        ].map((cfg) => {
          const opt = T.options[cfg.i];
          const Icon = ICON[opt.icon];
          const beat = pulse(frame, cfg.delay + 6, 0.12, 20);
          return (
            <div key={opt.label} style={{ position: 'absolute', left: cfg.left, top: cfg.top }}>
              <StackedCard
                width={cfg.w}
                height={cfg.h}
                delay={cfg.delay}
                rotate={cfg.rot}
                driftPhase={cfg.i * 30}
              >
                <div
                  style={{
                    transform: `scale(${1 + beat})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: cfg.size,
                    height: cfg.size,
                    borderRadius: opt.icon === 'cross' ? '50%' : 0,
                    background: opt.icon === 'cross' ? COLORS.lavenderDeep : 'transparent',
                  }}
                >
                  <Icon
                    size={opt.icon === 'cross' ? cfg.size * 0.6 : cfg.size}
                    color={opt.icon === 'cross' ? COLORS.white : COLORS.lavenderDeep}
                    strokeWidth={7}
                  />
                </div>
                <div
                  style={{
                    fontFamily: FONT.family,
                    fontWeight: FONT.medium,
                    fontSize: 34,
                    color: COLORS.body,
                    marginTop: 20,
                    letterSpacing: '-0.02em',
                    opacity: iv(frame, [cfg.delay + 8, cfg.delay + 18], [0, 1]),
                  }}
                >
                  {opt.label}
                </div>
              </StackedCard>
            </div>
          );
        })}
      </CardClip>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="pop_ui" at={4} />
      <Sfx name="whoosh_short" at={10} />
      <Sfx name="whoosh_short" at={22} gain={0.85} />
      <Sfx name="whoosh_transition" at={52} gain={0.6} />
      <Sfx name="soft_pop" at={60} />
      <Sfx name="tick" at={74} gain={0.7} />
      <Sfx name="tick" at={80} gain={0.7} />
      <Sfx name="reverse_whoosh" at={92} gain={0.6} />
      <Sfx name="swipe_fast" at={106} />
      <Sfx name="pop_ui" at={108} />
      <Sfx name="digital_click" at={112} />
      <Sfx name="swipe_fast" at={122} gain={0.9} />
      <Sfx name="pop_ui" at={124} gain={0.95} />
      <Sfx name="swipe_fast" at={138} gain={0.85} />
      <Sfx name="pop_ui" at={140} gain={0.9} />
      <Sfx name="impact" at={128} gain={0.5} />
      <Sfx name="sub_boom" at={160} gain={0.4} />
    </Backdrop>
    </Camera>
  );
};
