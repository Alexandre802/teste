import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Backdrop, CardClip } from '../components/Backdrop';
import { Logo } from '../components/Logo';
import { Headline } from '../components/Text';
import {
  Avatar,
  Card,
  ChatBubble,
  NotificationCard,
  PhoneFrame,
  SkeletonLine,
} from '../components/Ui';
import {
  ArrowLeftIcon,
  CombIcon,
  DotsIcon,
  MicIcon,
  PaperclipIcon,
  PhoneCallIcon,
  ScissorsIcon,
  SmileyIcon,
} from '../components/Icons';
import { Sfx } from '../components/Sfx';
import { COLORS, FONT, SHADOW } from '../theme';
import { enter, float, iv, s, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';

const T = TEXTS.s01;
const INSET: [number, number] = [26, 48];

/** Cabeçalho do WhatsApp dentro do telefone. */
const ChatHeader: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const e = enter(frame, { delay, y: -18, config: SPRING.soft, fade: 8 });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '26px 22px 18px',
        background: COLORS.white,
        borderBottom: `1px solid ${COLORS.lavender}`,
        opacity: e.opacity,
        transform: e.transform,
      }}
    >
      <ArrowLeftIcon size={26} color={COLORS.body} strokeWidth={8} />
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: COLORS.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={24} height={24} viewBox="0 0 100 100">
          <path d="M 63 6 L 24 57 L 45 57 L 37 94 L 78 41 L 55 41 Z" fill="#FFF" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.bold,
            fontSize: 27,
            color: COLORS.dark,
            letterSpacing: '-0.02em',
          }}
        >
          Waatzo
        </div>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: 19,
            color: COLORS.muted,
          }}
        >
          online
        </div>
      </div>
      <PhoneCallIcon size={26} color={COLORS.body} />
      <VideoBadge />
      <DotsIcon size={22} color={COLORS.body} />
    </div>
  );
};

const VideoBadge: React.FC = () => (
  <svg width={30} height={22} viewBox="0 0 100 70">
    <rect x="4" y="8" width="60" height="54" rx="12" fill={COLORS.body} />
    <path d="M 68 30 L 94 14 L 94 56 L 68 40 Z" fill={COLORS.body} />
  </svg>
);

/** Barra de digitação com cursor piscando. */
const ChatInput: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const e = enter(frame, { delay, y: 30, config: SPRING.pop, fade: 8 });
  const caret = Math.floor((frame - delay) / 9) % 2 === 0;
  const micBeat = 1 + Math.max(0, Math.sin((frame - delay) / 14)) * 0.06;
  return (
    <div
      style={{
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 22,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        opacity: e.opacity,
        transform: e.transform,
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: COLORS.white,
          borderRadius: 999,
          padding: '16px 22px',
          boxShadow: '0 3px 12px rgba(24,22,78,0.10)',
        }}
      >
        <SmileyIcon size={26} color={COLORS.placeholder} strokeWidth={7} />
        <span
          style={{
            flex: 1,
            fontFamily: FONT.family,
            fontWeight: FONT.regular,
            fontSize: 24,
            color: COLORS.placeholder,
          }}
        >
          {T.inputPlaceholder}
          <span style={{ opacity: caret ? 1 : 0, color: COLORS.primary }}>|</span>
        </span>
        <PaperclipIcon size={24} color={COLORS.placeholder} strokeWidth={7} />
      </div>
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: COLORS.green,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${micBeat})`,
          boxShadow: '0 6px 18px rgba(37,211,102,0.35)',
        }}
      >
        <MicIcon size={28} color="#FFF" strokeWidth={7} />
      </div>
    </div>
  );
};

export const Scene01: React.FC = () => {
  const frame = useCurrentFrame();
  const photo = enter(frame, { delay: 26, scale: 1.12, config: SPRING.soft, fade: 16 });
  const photoDrift = float(frame, 10, 190);

  return (
    <Backdrop
      inset={INSET}
      radius={54}
      blobs={[
        { x: 1005, y: 40, r: 210, color: COLORS.primarySoft, delay: 0, drift: 8 },
        { x: 60, y: 1500, r: 250, color: COLORS.primary, delay: 3, drift: 12 },
        { x: 1040, y: 1780, r: 150, color: COLORS.primary, delay: 6, drift: 8 },
      ]}
      fans={[{ x: 930, y: 350, size: 150, color: COLORS.peach, rotate: 170, delay: 16 }]}
      strokes={[{ x: 44, y: 1360, size: 92, color: COLORS.peachSoft, rotate: 200, delay: 20 }]}
    >
      <CardClip inset={INSET} radius={54}>
        {/* Foto do salão ao fundo (parallax lento) */}
        <div
          style={{
            position: 'absolute',
            left: 712,
            top: 826,
            width: 320,
            height: 652,
            opacity: photo.opacity * 0.98,
            transform: `${photo.transform} translateY(${photoDrift}px)`,
            maskImage: 'radial-gradient(120% 100% at 60% 40%, #000 55%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(120% 100% at 60% 40%, #000 55%, transparent 100%)',
          }}
        >
          <Img
            src={staticFile('photos/s1_salon.png')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Logo */}
        <div style={{ position: 'absolute', left: 112, top: 112 }}>
          <Logo size={88} delay={2} fontSize={72} gap={22} />
        </div>

        {/* Título — dois blocos, palavra a palavra */}
        <div style={{ position: 'absolute', left: 118, top: 272, width: 900 }}>
          <Headline
            lines={[T.line1.slice(0, 1), T.line1.slice(1, 2), T.line1.slice(2, 3)]}
            fontSize={86}
            lineHeight={1.09}
            delay={12}
            stagger={3}
            lineStagger={5}
          />
        </div>
        <div style={{ position: 'absolute', left: 118, top: 604, width: 920 }}>
          <Headline
            lines={[T.line2.slice(0, 2), T.line2.slice(2, 3)]}
            fontSize={78}
            lineHeight={1.1}
            delay={30}
            stagger={3}
            lineStagger={6}
          />
        </div>

        {/* Telefone com a conversa */}
        <div style={{ position: 'absolute', left: 118, top: 858 }}>
          <PhoneFrame width={640} height={1064} delay={38} borderWidth={16} radius={58} y={90}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#EDE7DF',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ChatHeader delay={44} />
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  padding: '20px 22px',
                }}
              >
                <ChatBubble
                  text={T.chat[0].text}
                  time={T.chat[0].time}
                  side="left"
                  delay={52}
                  maxWidth={370}
                  fontSize={24}
                />
                <ChatBubble
                  text={T.chat[1].text}
                  time={T.chat[1].time}
                  side="right"
                  delay={62}
                  maxWidth={390}
                  fontSize={24}
                  checks
                />
                <div style={{ height: 108 }} />
                <ChatBubble
                  text={T.chat[2].text}
                  time={T.chat[2].time}
                  side="right"
                  delay={86}
                  maxWidth={400}
                  fontSize={24}
                  checks
                />
                <div style={{ height: 104 }} />
                <ChatBubble
                  text={T.chat[3].text}
                  time={T.chat[3].time}
                  side="right"
                  delay={112}
                  maxWidth={390}
                  fontSize={24}
                  checks
                />
              </div>
              <ChatInput delay={128} />
            </div>
          </PhoneFrame>
        </div>

        {/* Cartões de notificação por cima do telefone */}
        <div style={{ position: 'absolute', left: 146, top: 1152 }}>
          <NotificationCard
            width={556}
            name={T.notifications[0].name}
            text={T.notifications[0].text}
            time={T.notifications[0].time}
            initials={T.notifications[0].initial}
            badge={1}
            delay={70}
            from="right"
            driftPhase={0}
          />
        </div>
        <div style={{ position: 'absolute', left: 146, top: 1382 }}>
          <NotificationCard
            width={556}
            name={T.notifications[1].name}
            text={T.notifications[1].text}
            time={T.notifications[1].time}
            initials={T.notifications[1].initial}
            badge={1}
            delay={94}
            from="right"
            driftPhase={40}
          />
        </div>
        <div style={{ position: 'absolute', left: 146, top: 1608 }}>
          <NotificationCard
            width={556}
            name={T.notifications[2].name}
            text={T.notifications[2].text}
            time={T.notifications[2].time}
            initials={T.notifications[2].initial}
            badge={1}
            delay={118}
            from="right"
            driftPhase={80}
          />
        </div>

        {/* Cartão de serviços (tesoura + pente) */}
        <div style={{ position: 'absolute', left: 716, top: 1528 }}>
          <Card delay={132} radius={30} scale={0.8} y={40} style={{ width: 300, padding: 30 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 22 }}>
              <ScissorsIcon size={96} color={COLORS.lavenderDeep} strokeWidth={7} />
              <CombIcon size={86} color={COLORS.lavenderDeep} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonLine width={230} height={16} delay={142} />
              <SkeletonLine width={170} height={16} delay={148} />
            </div>
          </Card>
        </div>
      </CardClip>

      {/* Brilho suave que passa pelo cartão na abertura */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)',
          opacity: interpolate(frame, [0, 26, 46], [0, 0.8, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          transform: `translateX(${iv(frame, [0, 46], [-700, 700])}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="pop_ui" at={4} />
      <Sfx name="sparkle" at={8} gain={0.7} />
      <Sfx name="whoosh_short" at={12} />
      <Sfx name="whoosh_short" at={30} gain={0.85} />
      <Sfx name="tick" at={20} />
      <Sfx name="whoosh_short" at={38} gain={1.1} />
      <Sfx name="tap" at={48} />
      <Sfx name="soft_pop" at={52} />
      <Sfx name="bubble_pop" at={62} />
      <Sfx name="notification_pop" at={70} />
      <Sfx name="bubble_pop" at={86} gain={0.9} />
      <Sfx name="notification_pop" at={94} gain={0.95} />
      <Sfx name="bubble_pop" at={112} gain={0.9} />
      <Sfx name="notification_pop" at={118} gain={0.9} />
      <Sfx name="pop_ui" at={132} gain={0.9} />
      <Sfx name="digital_click" at={128} />
      <Sfx name="tick" at={142} />
      <Sfx name="tick" at={148} />
    </Backdrop>
  );
};
