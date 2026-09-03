import React from 'react';

import { Camera } from '../components/Camera';
import { Backdrop, CardClip } from '../components/Backdrop';
import { Logo } from '../components/Logo';
import { Card, SkeletonLine, TypingDots } from '../components/Ui';
import { CalendarIcon, CheckIcon, ClockIcon, PersonIcon } from '../components/Icons';
import { Sfx } from '../components/Sfx';
import { COLORS, FONT, SHADOW } from '../theme';
import { enter, float, iv, pulse, s, SPRING, typewriter } from '../lib/anim';
import { TEXTS } from '../timeline';
import { useSceneFrame } from '../lib/timing';

const T = TEXTS.s07;
const INSET: [number, number] = [50, 58];

/** Pílula branca com as duas capacidades principais. */
const FeatureChip: React.FC<{
  parts: readonly { t: string; c?: string }[];
  delay: number;
  width: number;
  top: number;
}> = ({ parts, delay, width, top }) => {
  const frame = useSceneFrame();
  const e = enter(frame, { delay, x: -60, scale: 0.9, config: SPRING.pop, fade: 8 });
  const dy = float(frame, 4, 130, delay * 3);
  return (
    <div
      style={{
        position: 'absolute',
        left: 108,
        top,
        width,
        background: COLORS.white,
        borderRadius: 34,
        boxShadow: SHADOW.card,
        padding: '30px 44px',
        opacity: e.opacity,
        transform: `${e.transform} translateY(${dy.toFixed(2)}px)`,
        whiteSpace: 'nowrap',
      }}
    >
      {parts.map((s2, i) => (
        <span
          key={i}
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.black,
            fontSize: 78,
            letterSpacing: '-0.035em',
            color: s2.c === 'blue' ? COLORS.primaryText : COLORS.dark,
          }}
        >
          {i > 0 ? ' ' : ''}
          {s2.t}
        </span>
      ))}
    </div>
  );
};

/** Mensagem de cliente com nome em destaque. */
const ClientMessage: React.FC<{
  name: string;
  text: string;
  time: string;
  delay: number;
  left: number;
  top: number;
  width: number;
  typing?: boolean;
}> = ({ name, text, time, delay, left, top, width, typing = true }) => {
  const frame = useSceneFrame();
  const shown = typing ? typewriter(text, frame, delay + 6, 1.4) : text;
  return (
    <div style={{ position: 'absolute', left, top }}>
      <Card delay={delay} radius={30} y={22} scale={0.94} style={{ width, padding: '28px 32px' }}>
        <div style={{ display: 'flex', gap: 22 }}>
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: '50%',
              background: COLORS.lavenderDeep,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transform: `scale(${s(frame, { delay: delay + 4, config: SPRING.bouncy })})`,
            }}
          >
            <PersonIcon size={44} color={COLORS.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: FONT.family,
                fontWeight: FONT.bold,
                fontSize: 34,
                color: COLORS.primaryText,
                letterSpacing: '-0.02em',
                marginBottom: 8,
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontFamily: FONT.family,
                fontWeight: FONT.regular,
                fontSize: 34,
                lineHeight: 1.32,
                color: COLORS.body,
                minHeight: 88,
              }}
            >
              {shown}
            </div>
            <div
              style={{
                fontFamily: FONT.family,
                fontWeight: FONT.medium,
                fontSize: 26,
                color: COLORS.muted,
                textAlign: 'right',
              }}
            >
              {time}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/** Desce das pílulas para o agendamento e fecha na confirmação. */
const CAM = [
  { at: 0, scale: 1.04, y: 900 },
  { at: 70, scale: 1.12, y: 1010 },
  { at: 140, scale: 1.3, y: 1150 },
  { at: 200, scale: 1.4, y: 1220 },
  { at: 230, scale: 1.14, y: 1060 },
];

export const Scene07: React.FC = () => {
  const frame = useSceneFrame();
  const slotIn = s(frame, { delay: 150, config: SPRING.bouncy });
  const slotBeat = pulse(frame, 152, 0.1, 22);
  const checkIn = s(frame, { delay: 164, config: SPRING.bouncy });
  const checkPress = 1 - Math.max(0, pulse(frame, 172, 0.12, 14));
  const confirmIn = s(frame, { delay: 186, config: SPRING.pop });

  return (
    <Camera moves={CAM} drift={4}>
    <Backdrop
      inset={INSET}
      blobs={[
        { x: 1035, y: 80, r: 205, color: COLORS.primarySoft, delay: 0, drift: 8 },
        { x: 20, y: 1500, r: 245, color: COLORS.primary, delay: 4, drift: 12 },
        { x: 1050, y: 1830, r: 155, color: COLORS.primary, delay: 7, drift: 8 },
      ]}
      fans={[{ x: 930, y: 500, size: 145, color: COLORS.peach, rotate: 170, delay: 16 }]}
      strokes={[{ x: 48, y: 1540, size: 86, color: COLORS.peachSoft, rotate: 200, delay: 20 }]}
    >
      <CardClip inset={INSET}>
        <div style={{ position: 'absolute', left: 112, top: 104 }}>
          <Logo size={84} delay={2} fontSize={70} gap={20} />
        </div>

        <FeatureChip parts={T.chips[0]} delay={12} width={846} top={300} />
        <FeatureChip parts={T.chips[1]} delay={24} width={766} top={478} />

        <ClientMessage
          name={T.messages[0].name}
          text={T.messages[0].text}
          time={T.messages[0].time}
          delay={44}
          left={132}
          top={684}
          width={580}
        />
        <ClientMessage
          name={T.messages[1].name}
          text={T.messages[1].text}
          time={T.messages[1].time}
          delay={78}
          left={352}
          top={938}
          width={580}
        />

        {/* A IA "pensando" */}
        <div style={{ position: 'absolute', left: 128, top: 1156 }}>
          <TypingDots delay={112} size={22} />
        </div>

        {/* Cartão de agendamento */}
        <div style={{ position: 'absolute', left: 326, top: 1232 }}>
          <Card delay={126} radius={34} y={40} scale={0.9} style={{ width: 610, padding: 34 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginBottom: 34 }}>
              <div
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: '50%',
                  background: COLORS.lavender,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${s(frame, { delay: 132, config: SPRING.bouncy })})`,
                }}
              >
                <CalendarIcon size={58} color={COLORS.primary} strokeWidth={7} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SkeletonLine width={220} height={22} delay={136} />
                <SkeletonLine width={330} height={22} delay={142} color={COLORS.lavenderLine} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  background: COLORS.lavender,
                  borderRadius: 999,
                  padding: '22px 34px',
                  transform: `scale(${(slotIn * (1 + slotBeat)).toFixed(4)})`,
                  transformOrigin: 'left center',
                }}
              >
                <ClockIcon size={58} color={COLORS.primaryText} strokeWidth={7} />
                <span
                  style={{
                    fontFamily: FONT.family,
                    fontWeight: FONT.black,
                    fontSize: 62,
                    color: COLORS.primaryText,
                    letterSpacing: '-0.035em',
                  }}
                >
                  {T.slot}
                </span>
              </div>
              <div
                style={{
                  width: 118,
                  height: 118,
                  borderRadius: 30,
                  background: COLORS.lavender,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${(checkIn * checkPress).toFixed(4)})`,
                }}
              >
                <CheckIcon size={64} color={COLORS.primaryText} strokeWidth={8} />
              </div>
            </div>
          </Card>
        </div>

        {/* Confirmação */}
        <div
          style={{
            position: 'absolute',
            left: 246,
            top: 1628,
            opacity: iv(frame, [186, 196], [0, 1]),
            transform: `translateY(${((1 - confirmIn) * 40).toFixed(2)}px) scale(${(0.9 + 0.1 * confirmIn).toFixed(4)})`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              background: COLORS.white,
              borderRadius: 34,
              boxShadow: SHADOW.card,
              padding: '28px 40px 28px 30px',
              width: 616,
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: COLORS.primarySoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckIcon size={46} color={COLORS.white} strokeWidth={8} />
            </div>
            <div
              style={{
                flex: 1,
                fontFamily: FONT.family,
                fontWeight: FONT.regular,
                fontSize: 36,
                lineHeight: 1.28,
                color: COLORS.body,
              }}
            >
              {T.confirmation.text}
            </div>
            <span
              style={{
                fontFamily: FONT.family,
                fontWeight: FONT.medium,
                fontSize: 28,
                color: COLORS.muted,
                alignSelf: 'flex-end',
              }}
            >
              {T.confirmation.time}
            </span>
          </div>
        </div>
      </CardClip>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="pop_ui" at={4} />
      <Sfx name="whoosh_short" at={12} />
      <Sfx name="impact" at={14} gain={0.45} />
      <Sfx name="whoosh_short" at={24} gain={0.9} />
      <Sfx name="impact" at={26} gain={0.4} />
      <Sfx name="notification_pop" at={44} gain={0.85} />
      <Sfx name="digital_click" at={50} gain={0.7} />
      <Sfx name="notification_pop" at={78} gain={0.85} />
      <Sfx name="digital_click" at={84} gain={0.7} />
      <Sfx name="soft_pop" at={112} />
      <Sfx name="tick" at={118} gain={0.6} />
      <Sfx name="tick" at={124} gain={0.6} />
      <Sfx name="pop_ui" at={126} />
      <Sfx name="soft_pop" at={132} />
      <Sfx name="tick" at={136} gain={0.7} />
      <Sfx name="tick" at={142} gain={0.7} />
      <Sfx name="bubble_pop" at={150} />
      <Sfx name="tap" at={164} />
      <Sfx name="digital_click" at={172} />
      <Sfx name="success_chime" at={186} />
      <Sfx name="sparkle" at={190} gain={0.6} />
    </Backdrop>
    </Camera>
  );
};
