import React from 'react';

import { Backdrop, CardClip } from '../components/Backdrop';
import { Camera, CameraMove } from '../components/Camera';
import { Logo } from '../components/Logo';
import { Headline } from '../components/Text';
import { Card, SkeletonLine } from '../components/Ui';
import { AlarmIcon, BellIcon, CheckIcon, PersonIcon } from '../components/Icons';
import { Sfx } from '../components/Sfx';
import { COLORS, FONT } from '../theme';
import { iv, pulse, s, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';
import { useSceneFrame, useVariant } from '../lib/timing';

const T = TEXTS.s08;
const INSET: [number, number] = [50, 58];

const ICONS = { bell: BellIcon, alarm: AlarmIcon, person: PersonIcon, check: CheckIcon };

type CardCfg = { left: number; top: number; width: number; delay: number };

/** Bloco completo: os quatro lembretes, com a câmera passando por cada um. */
const LAYOUT_FULL: CardCfg[] = [
  { left: 98, top: 644, width: 830, delay: 10 },
  { left: 143, top: 908, width: 830, delay: 20 },
  { left: 103, top: 1180, width: 856, delay: 30 },
  { left: 206, top: 1428, width: 748, delay: 40 },
];

/** Bloco curto (3,5 s): só o título e os dois primeiros cartões. */
const LAYOUT_COMPACT: CardCfg[] = [
  { left: 98, top: 644, width: 830, delay: 34 },
  { left: 143, top: 908, width: 830, delay: 56 },
];

/** Centro de cada cartão, para a câmera mirar. */
const centerOf = (c: CardCfg) => ({ x: c.left + c.width / 2, y: c.top + 92 });

export const Scene08: React.FC = () => {
  const frame = useSceneFrame();
  const variant = useVariant();
  const compact = variant === 1;

  const layout = compact ? LAYOUT_COMPACT : LAYOUT_FULL;
  const cards = compact ? T.cards.slice(0, 2) : T.cards;

  // Passagem de câmera: aproxima de um cartão por vez e depois abre o plano.
  const moves: CameraMove[] = compact
    ? [
        { at: 0, scale: 1.02, y: 960 },
        { at: 104, scale: 1.12, y: 1000 },
      ]
    : [
        { at: 0, scale: 1.0, y: 960 },
        { at: 56, scale: 1.26, x: centerOf(LAYOUT_FULL[0]).x, y: 790 },
        { at: 116, scale: 1.26, x: centerOf(LAYOUT_FULL[1]).x, y: 1010 },
        { at: 176, scale: 1.34, x: centerOf(LAYOUT_FULL[2]).x, y: 1200 },
        { at: 240, scale: 1.44, x: centerOf(LAYOUT_FULL[3]).x, y: 1250 },
        { at: 300, scale: 1.0, y: 960 },
      ];

  /** Qual cartão a câmera está observando (para destacá-lo). */
  const focused = compact
    ? -1
    : frame < 46
      ? -1
      : frame < 106
        ? 0
        : frame < 166
          ? 1
          : frame < 230
            ? 2
            : frame < 292
              ? 3
              : -1;

  return (
    <Camera moves={moves} drift={compact ? 3 : 5}>
      <Backdrop
        inset={INSET}
        blobs={[
          { x: 1040, y: 70, r: 210, color: COLORS.primarySoft, delay: 0, drift: 8 },
          { x: 30, y: 1560, r: 250, color: COLORS.primarySoft, delay: 2, drift: 12 },
          { x: 1050, y: 1840, r: 155, color: COLORS.primary, delay: 4, drift: 8 },
        ]}
        fans={[{ x: 930, y: 350, size: 148, color: COLORS.peach, rotate: 170, delay: 8 }]}
        strokes={[{ x: 44, y: 1470, size: 90, color: COLORS.peachSoft, rotate: 200, delay: 10 }]}
      >
        <CardClip inset={INSET}>
          <div style={{ position: 'absolute', left: 108, top: 108 }}>
            <Logo size={84} delay={0} fontSize={70} gap={20} />
          </div>

          <div style={{ position: 'absolute', left: 100, top: 316, width: 940 }}>
            <Headline lines={[T.lines[0]]} fontSize={76} delay={compact ? 4 : 0} stagger={3} />
          </div>
          <div style={{ position: 'absolute', left: 100, top: 456, width: 940 }}>
            <Headline lines={[T.lines[1]]} fontSize={76} delay={compact ? 16 : 6} stagger={3} />
          </div>

          {cards.map((c, i) => {
            const cfg = layout[i];
            const Icon = ICONS[c.icon];
            const iconIn = s(frame, { delay: cfg.delay + 4, config: SPRING.bouncy });
            const ring = pulse(frame, cfg.delay + 6, 0.16, 22);
            const isCheck = c.icon === 'check';
            const isFocus = focused === i;
            const wiggle =
              c.icon === 'bell' || c.icon === 'alarm'
                ? Math.sin((frame - cfg.delay) / 3) *
                    Math.max(0, 1 - Math.max(0, frame - cfg.delay - 6) / 22) *
                    11 +
                  (isFocus ? Math.sin(frame / 3.4) * 4 : 0)
                : 0;
            return (
              <div key={i} style={{ position: 'absolute', left: cfg.left, top: cfg.top }}>
                <Card
                  delay={cfg.delay}
                  x={i % 2 === 0 ? -70 : 70}
                  y={22}
                  scale={0.9}
                  radius={34}
                  drift={5}
                  driftPhase={i * 30}
                  config={SPRING.pop}
                  style={{ width: cfg.width, padding: '30px 34px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 30,
                      transform: `scale(${isFocus ? 1.02 : 1})`,
                      opacity: focused === -1 || isFocus ? 1 : 0.6,
                    }}
                  >
                    <div
                      style={{
                        width: 118,
                        height: 118,
                        borderRadius: isCheck ? '50%' : 28,
                        background: isCheck ? COLORS.primary : COLORS.lavender,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transform: `scale(${(iconIn * (1 + ring + (isFocus ? 0.05 : 0))).toFixed(4)}) rotate(${wiggle.toFixed(2)}deg)`,
                      }}
                    >
                      <Icon
                        size={isCheck ? 62 : 66}
                        color={isCheck ? COLORS.white : COLORS.primary}
                        strokeWidth={8}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: FONT.family,
                          fontWeight: c.sub ? FONT.bold : FONT.semi,
                          fontSize: 35,
                          lineHeight: 1.32,
                          color: COLORS.dark,
                          letterSpacing: '-0.02em',
                          opacity: iv(frame, [cfg.delay + 5, cfg.delay + 13], [0, 1]),
                        }}
                      >
                        {c.text}
                        {c.highlight ? (
                          <span
                            style={{
                              color: COLORS.primaryText,
                              fontWeight: FONT.bold,
                              opacity: iv(frame, [cfg.delay + 12, cfg.delay + 20], [0, 1]),
                            }}
                          >
                            {c.highlight}
                          </span>
                        ) : null}
                      </div>
                      {c.sub ? (
                        <div
                          style={{
                            fontFamily: FONT.family,
                            fontWeight: FONT.medium,
                            fontSize: 34,
                            color: COLORS.muted,
                            marginTop: 6,
                            opacity: iv(frame, [cfg.delay + 14, cfg.delay + 22], [0, 1]),
                          }}
                        >
                          {c.sub}
                        </div>
                      ) : null}
                    </div>

                    {c.button ? (
                      <div
                        style={{
                          background: COLORS.lavender,
                          borderRadius: 22,
                          padding: '22px 30px',
                          fontFamily: FONT.family,
                          fontWeight: FONT.semi,
                          fontSize: 32,
                          color: COLORS.primaryText,
                          whiteSpace: 'nowrap',
                          letterSpacing: '-0.02em',
                          transform: `scale(${(
                            s(frame, { delay: cfg.delay + 12, config: SPRING.bouncy }) *
                            (1 + (isFocus ? pulse(frame, 186, 0.08, 24) : 0))
                          ).toFixed(4)})`,
                        }}
                      >
                        {c.button}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <SkeletonLine width={150} height={18} delay={cfg.delay + 10} />
                        <SkeletonLine width={130} height={18} delay={cfg.delay + 14} />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </CardClip>

        {/* ------------------------------------------------------- efeitos */}
        {compact ? (
          <>
            <Sfx name="pop_ui" at={2} />
            <Sfx name="whoosh_short" at={4} />
            <Sfx name="whoosh_short" at={16} gain={0.9} />
            <Sfx name="swipe_fast" at={32} />
            <Sfx name="notification_pop" at={34} />
            <Sfx name="swipe_fast" at={54} gain={0.9} />
            <Sfx name="notification_pop" at={56} gain={0.9} />
            <Sfx name="tick" at={70} gain={0.6} />
          </>
        ) : (
          <>
            <Sfx name="whoosh_short" at={0} gain={0.8} />
            <Sfx name="swipe_fast" at={8} gain={0.8} />
            <Sfx name="notification_pop" at={10} gain={0.85} />
            <Sfx name="swipe_fast" at={18} gain={0.8} />
            <Sfx name="notification_pop" at={20} gain={0.8} />
            <Sfx name="swipe_fast" at={28} gain={0.8} />
            <Sfx name="pop_ui" at={30} gain={0.8} />
            <Sfx name="swipe_fast" at={38} gain={0.8} />
            <Sfx name="pop_ui" at={40} gain={0.8} />
            {/* um respiro sonoro a cada parada da câmera */}
            <Sfx name="whoosh_short" at={52} gain={0.5} />
            <Sfx name="tick" at={58} gain={0.5} />
            <Sfx name="whoosh_short" at={112} gain={0.5} />
            <Sfx name="tick" at={118} gain={0.5} />
            <Sfx name="whoosh_short" at={172} gain={0.5} />
            <Sfx name="tap" at={186} gain={0.7} />
            <Sfx name="whoosh_short" at={236} gain={0.5} />
            <Sfx name="success_chime" at={248} gain={0.8} />
            <Sfx name="sparkle" at={252} gain={0.5} />
            <Sfx name="whoosh_transition" at={296} gain={0.5} />
            <Sfx name="sub_boom" at={300} gain={0.4} />
          </>
        )}
      </Backdrop>
    </Camera>
  );
};
