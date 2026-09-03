import React from 'react';

import { Backdrop } from '../components/Backdrop';
import { Camera, CameraMove } from '../components/Camera';
import { Logo } from '../components/Logo';
import { Headline } from '../components/Text';
import { Card, Avatar } from '../components/Ui';
import { CheckIcon, DoubleCheck, PersonIcon, StoreIcon } from '../components/Icons';
import { Sfx } from '../components/Sfx';
import { COLORS, FONT, SHADOW } from '../theme';
import { enter, iv, pulse, s, SPRING, typewriter } from '../lib/anim';
import { TEXTS } from '../timeline';
import { useSceneFrame, useVariant } from '../lib/timing';

const T = TEXTS.s02;

const Head: React.FC<{
  name: string;
  status: string;
  icon: 'person' | 'store';
  delay: number;
}> = ({ name, status, icon, delay }) => {
  const frame = useSceneFrame();
  const dot = s(frame, { delay: delay + 8, config: SPRING.bouncy });
  const blink = 0.75 + 0.25 * Math.sin((frame - delay) / 9);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: icon === 'store' ? COLORS.primary : COLORS.lavenderDeep,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${s(frame, { delay: delay + 3, config: SPRING.bouncy })})`,
        }}
      >
        {icon === 'store' ? (
          <StoreIcon size={54} color={COLORS.white} />
        ) : (
          <PersonIcon size={54} color={COLORS.primary} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.bold,
            fontSize: 42,
            color: COLORS.dark,
            letterSpacing: '-0.025em',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: 34,
            color: COLORS.muted,
          }}
        >
          {status}
        </div>
      </div>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: COLORS.greenDot,
          transform: `scale(${dot})`,
          opacity: blink,
        }}
      />
    </div>
  );
};

/** Bolha de mensagem cinza clara com texto digitado. */
const Msg: React.FC<{
  text: string;
  time: string;
  delay: number;
  background?: string;
  typing?: boolean;
  checks?: boolean;
}> = ({ text, time, delay, background = '#F4F4F8', typing = true, checks = false }) => {
  const frame = useSceneFrame();
  const e = enter(frame, { delay, y: 14, scale: 0.96, config: SPRING.pop, fade: 7 });
  const shown = typing ? typewriter(text, frame, delay + 4, 1.5) : text;
  const checkProg = s(frame, { delay: delay + 22, config: SPRING.soft });
  return (
    <div
      style={{
        background,
        borderRadius: 22,
        padding: '26px 30px 20px',
        opacity: e.opacity,
        transform: e.transform,
      }}
    >
      <div
        style={{
          fontFamily: FONT.family,
          fontWeight: FONT.regular,
          fontSize: 36,
          lineHeight: 1.34,
          color: COLORS.body,
          minHeight: 96,
          letterSpacing: '-0.012em',
        }}
      >
        {shown}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 10,
          marginTop: 6,
        }}
      >
        <span
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: 30,
            color: COLORS.muted,
          }}
        >
          {time}
        </span>
        {checks ? <DoubleCheck size={38} progress={checkProg} /> : null}
      </div>
    </div>
  );
};

/**
 * Duas leituras da mesma arte:
 *  v0 — a comparação sendo construída (início do vídeo);
 *  v1 — retomada no fecho ("ninguém respondeu a tempo"), com a câmera indo de
 *       um cartão ao outro e o selo "Não respondido" batendo.
 */
const D0 = { logo: 2, title: 10, cardA: 34, headA: 38, msgA: 46, chip: 68, cardB: 86, headB: 90, msgB: 96, reply: 112 };
const D1 = { logo: 0, title: 0, cardA: 4, headA: 6, msgA: 8, chip: 22, cardB: 12, headB: 14, msgB: 16, reply: 26 };

export const Scene02: React.FC = () => {
  const frame = useSceneFrame();
  const variant = useVariant();
  const back = variant === 1;
  const D = back ? D1 : D0;

  const chipBeat = back
    ? pulse(frame, 40, 0.14, 30) + pulse(frame, 78, 0.12, 26) + pulse(frame, 116, 0.1, 24)
    : pulse(frame, D.chip + 6, 0.1, 26) + pulse(frame, D.chip + 36, 0.07, 22);
  const chipIn = enter(frame, { delay: D.chip, scale: 0.8, config: SPRING.bouncy, fade: 8 });

  const moves: CameraMove[] = back
    ? [
        { at: 0, scale: 1.0, y: 960 },
        { at: 46, scale: 1.22, x: 540, y: 880 },
        { at: 120, scale: 1.3, x: 540, y: 1180 },
        { at: 200, scale: 1.05, y: 1000 },
      ]
    : [
        { at: 0, scale: 1.0, y: 960 },
        { at: 80, scale: 1.12, y: 1030 },
        { at: 150, scale: 1.2, y: 1100 },
      ];

  return (
    <Camera moves={moves} drift={back ? 4 : 6}>
    <Backdrop
      card={false}
      blobs={[
        { x: 1090, y: 30, r: 300, color: COLORS.primary, delay: 0, drift: 10 },
        { x: 110, y: 1730, r: 380, color: COLORS.primary, delay: 4, drift: 14 },
        { x: 820, y: 2080, r: 360, color: COLORS.primary, delay: 8, drift: 10 },
      ]}
      fans={[
        { x: 940, y: 660, size: 140, color: COLORS.peach, rotate: 168, delay: 18 },
        { x: -10, y: 700, size: 130, color: COLORS.lavenderFan, rotate: 195, delay: 22 },
      ]}
    >
      {/* Logo centralizado */}
      <div
        style={{
          position: 'absolute',
          top: 118,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Logo size={96} delay={D.logo} fontSize={80} gap={24} />
      </div>

      {/* Título centralizado */}
      <div style={{ position: 'absolute', top: 252, left: 60, right: 60 }}>
        <Headline
          lines={T.lines}
          fontSize={84}
          lineHeight={1.14}
          align="center"
          delay={D.title}
          stagger={back ? 2 : 3.4}
          lineStagger={back ? 3 : 6}
        />
      </div>

      {/* Cartão do cliente sem resposta */}
      <div style={{ position: 'absolute', left: 190, top: 654, width: 700 }}>
        <Card delay={D.cardA} radius={34} y={40} scale={0.9} style={{ padding: '34px 34px 30px' }}>
          <Head name={T.cardA.name} status={T.cardA.status} icon="person" delay={D.headA} />
          <div style={{ height: 26 }} />
          <Msg text={T.cardA.message} time={T.cardA.time} delay={D.msgA} typing={!back} />
          <div style={{ height: 22 }} />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 18,
              background: COLORS.lavender,
              borderRadius: 20,
              padding: '20px 30px',
              opacity: chipIn.opacity,
              transform: `${chipIn.transform} scale(${1 + chipBeat})`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: `4px solid ${COLORS.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckIcon size={26} color={COLORS.primary} strokeWidth={7} />
            </div>
            <span
              style={{
                fontFamily: FONT.family,
                fontWeight: FONT.semi,
                fontSize: 36,
                color: COLORS.primaryText,
                letterSpacing: '-0.02em',
              }}
            >
              {T.cardA.badge}
            </span>
          </div>
        </Card>
      </div>

      {/* Cartão do concorrente que respondeu */}
      <div style={{ position: 'absolute', left: 190, top: 1216, width: 700 }}>
        <Card delay={D.cardB} radius={34} y={46} scale={0.9} style={{ padding: '34px 34px 30px' }}>
          <Head name={T.cardB.name} status={T.cardB.status} icon="store" delay={D.headB} />
          <div style={{ height: 26 }} />
          <Msg text={T.cardB.message} time={T.cardB.time} delay={D.msgB} typing={false} />
          <div style={{ height: 20 }} />
          <Msg
            text={T.cardB.reply}
            time={T.cardB.replyTime}
            delay={D.reply}
            background={COLORS.lavender}
            checks
          />
        </Card>
      </div>

      {/* --------------------------------------------------------- efeitos */}
      {back ? (
        <>
          <Sfx name="whoosh_short" at={0} gain={0.8} />
          <Sfx name="soft_pop" at={6} />
          <Sfx name="soft_pop" at={14} gain={0.9} />
          <Sfx name="notification_pop" at={22} gain={0.8} />
          <Sfx name="whoosh_short" at={40} gain={0.5} />
          <Sfx name="impact" at={46} gain={0.5} />
          <Sfx name="tick" at={78} gain={0.6} />
          <Sfx name="whoosh_short" at={112} gain={0.5} />
          <Sfx name="success_chime" at={126} gain={0.6} />
          <Sfx name="sub_boom" at={150} gain={0.45} />
          <Sfx name="riser" at={200} gain={0.5} />
        </>
      ) : (
        <>
          <Sfx name="pop_ui" at={2} />
          <Sfx name="whoosh_short" at={8} />
          <Sfx name="whoosh_short" at={18} gain={0.8} />
          <Sfx name="impact" at={34} gain={0.55} />
          <Sfx name="soft_pop" at={38} />
          <Sfx name="digital_click" at={46} />
          <Sfx name="tick" at={56} gain={0.8} />
          <Sfx name="notification_pop" at={68} gain={0.7} />
          <Sfx name="whoosh_short" at={86} gain={1.1} />
          <Sfx name="soft_pop" at={90} />
          <Sfx name="digital_click" at={96} />
          <Sfx name="pop_ui" at={112} />
          <Sfx name="success_chime" at={126} gain={0.8} />
        </>
      )}
    </Backdrop>
    </Camera>
  );
};
