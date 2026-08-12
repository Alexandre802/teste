import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Backdrop, CardClip } from '../components/Backdrop';
import { Logo } from '../components/Logo';
import { Headline } from '../components/Text';
import { Card, SkeletonLine } from '../components/Ui';
import { AlarmIcon, BellIcon, CheckIcon, PersonIcon } from '../components/Icons';
import { Sfx } from '../components/Sfx';
import { COLORS, FONT, SHADOW } from '../theme';
import { enter, float, iv, pulse, s, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';

const T = TEXTS.s08;
const INSET: [number, number] = [50, 58];

const ICONS = { bell: BellIcon, alarm: AlarmIcon, person: PersonIcon, check: CheckIcon };

type CardCfg = {
  left: number;
  top: number;
  width: number;
  delay: number;
};

const LAYOUT: CardCfg[] = [
  { left: 98, top: 644, width: 830, delay: 46 },
  { left: 143, top: 908, width: 830, delay: 74 },
  { left: 103, top: 1180, width: 856, delay: 102 },
  { left: 206, top: 1428, width: 748, delay: 130 },
];

export const Scene08: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Backdrop
      inset={INSET}
      blobs={[
        { x: 1040, y: 70, r: 210, color: COLORS.primarySoft, delay: 0, drift: 8 },
        { x: 30, y: 1560, r: 250, color: COLORS.primarySoft, delay: 4, drift: 12 },
        { x: 1050, y: 1840, r: 155, color: COLORS.primary, delay: 8, drift: 8 },
      ]}
      fans={[{ x: 930, y: 350, size: 148, color: COLORS.peach, rotate: 170, delay: 14 }]}
      strokes={[{ x: 44, y: 1470, size: 90, color: COLORS.peachSoft, rotate: 200, delay: 18 }]}
    >
      <CardClip inset={INSET}>
        <div style={{ position: 'absolute', left: 108, top: 108 }}>
          <Logo size={84} delay={2} fontSize={70} gap={20} />
        </div>

        <div style={{ position: 'absolute', left: 100, top: 316, width: 940 }}>
          <Headline
            lines={[T.lines[0]]}
            fontSize={76}
            delay={10}
            stagger={3.4}
          />
        </div>
        <div style={{ position: 'absolute', left: 100, top: 456, width: 940 }}>
          <Headline
            lines={[T.lines[1]]}
            fontSize={76}
            delay={24}
            stagger={3.4}
          />
        </div>

        {T.cards.map((c, i) => {
          const cfg = LAYOUT[i];
          const Icon = ICONS[c.icon];
          const iconIn = s(frame, { delay: cfg.delay + 5, config: SPRING.bouncy });
          const ring = pulse(frame, cfg.delay + 8, 0.16, 26);
          const isCheck = c.icon === 'check';
          const wiggle =
            c.icon === 'bell' || c.icon === 'alarm'
              ? Math.sin((frame - cfg.delay) / 3.2) *
                Math.max(0, 1 - Math.max(0, frame - cfg.delay - 8) / 26) *
                10
              : 0;
          return (
            <div key={i} style={{ position: 'absolute', left: cfg.left, top: cfg.top }}>
              <Card
                delay={cfg.delay}
                x={i % 2 === 0 ? -60 : 60}
                y={26}
                scale={0.92}
                radius={34}
                drift={5}
                driftPhase={i * 30}
                style={{ width: cfg.width, padding: '30px 34px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
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
                      transform: `scale(${(iconIn * (1 + ring)).toFixed(4)}) rotate(${wiggle.toFixed(2)}deg)`,
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
                        opacity: iv(frame, [cfg.delay + 6, cfg.delay + 16], [0, 1]),
                      }}
                    >
                      {c.text}
                      {c.highlight ? (
                        <span
                          style={{
                            color: COLORS.primaryText,
                            fontWeight: FONT.bold,
                            opacity: iv(frame, [cfg.delay + 16, cfg.delay + 26], [0, 1]),
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
                          opacity: iv(frame, [cfg.delay + 18, cfg.delay + 28], [0, 1]),
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
                        transform: `scale(${s(frame, { delay: cfg.delay + 14, config: SPRING.bouncy })})`,
                      }}
                    >
                      {c.button}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <SkeletonLine width={150} height={18} delay={cfg.delay + 12} />
                      <SkeletonLine width={130} height={18} delay={cfg.delay + 17} />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </CardClip>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="pop_ui" at={4} />
      <Sfx name="whoosh_short" at={10} />
      <Sfx name="whoosh_short" at={24} gain={0.9} />
      <Sfx name="impact" at={26} gain={0.4} />

      <Sfx name="swipe_fast" at={44} />
      <Sfx name="notification_pop" at={46} />
      <Sfx name="tick" at={58} gain={0.6} />

      <Sfx name="swipe_fast" at={72} gain={0.9} />
      <Sfx name="notification_pop" at={74} gain={0.9} />
      <Sfx name="tick" at={86} gain={0.6} />

      <Sfx name="swipe_fast" at={100} gain={0.9} />
      <Sfx name="pop_ui" at={102} />
      <Sfx name="tap" at={116} gain={0.8} />

      <Sfx name="swipe_fast" at={128} gain={0.85} />
      <Sfx name="pop_ui" at={130} gain={0.9} />
      <Sfx name="success_chime" at={146} gain={0.9} />
      <Sfx name="sparkle" at={150} gain={0.5} />
      <Sfx name="sub_boom" at={200} gain={0.35} />
      <Sfx name="tick" at={300} gain={0.4} />
    </Backdrop>
  );
};
