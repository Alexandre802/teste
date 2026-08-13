import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Camera, CameraMove } from '../components/Camera';
import { Logo } from '../components/Logo';
import { Sfx } from '../components/Sfx';
import { COLORS, FONT } from '../theme';
import { EASE, enter, float, iv, pulse, s, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';
import { useSceneFrame } from '../lib/timing';

/**
 * A conversa real dentro do WhatsApp — o take mais concreto do vídeo.
 *
 * As mensagens chegam UMA A UMA, no padrão do aplicativo: a do cliente entra
 * pela esquerda, o balão "digitando…" pisca, e só então a resposta da IA entra
 * pela direita com os dois tiques. Cada chegada cai numa marca da narração
 * (ver `MSG` abaixo, medido em `tools/find_cuts.py`).
 */
const T = TEXTS.s13;

/** Moldura do aparelho, em coordenadas do quadro. */
const PHONE = { left: 158, top: 356, width: 764, height: 1480, radius: 76, bezel: 14 };
const HEADER_H = 116;
const STATUS_H = 74;
const INPUT_H = 112;

/** Cores do WhatsApp. */
const WA = {
  paper: '#ECE3DA',
  bubbleThem: '#FFFFFF',
  bubbleMe: '#DCF8C6',
  label: '#1F7A4D',
  text: '#111B21',
  time: '#8696A0',
  header: '#F6F6F6',
  green: '#25D366',
  avatar: '#84C7A4',
  tick: '#34B7F1',
};

/**
 * Roteiro da conversa: `at` é o frame em que a mensagem chega e `typing` o
 * frame em que o balão de digitação aparece antes dela.
 */
const MSG: { at: number; typing?: number }[] = [
  { at: 10 },                 // cliente pergunta
  { at: 44, typing: 26 },     // IA responde preço e duração
  { at: 78 },                 // cliente escolhe o dia
  { at: 108, typing: 92 },    // IA oferece o horário
  { at: 152 },                // cliente confirma
  { at: 180, typing: 164 },   // IA fecha o agendamento
];

const CAM: CameraMove[] = [
  { at: 0, scale: 1.0, y: 960 },
  { at: 22, scale: 1.12, y: 1050 },
  { at: 76, scale: 1.15, y: 1110 },
  { at: 130, scale: 1.16, y: 1146 },
  { at: 176, scale: 1.14, y: 1120 },
  { at: 222, scale: 1.2, y: 1146 },
  { at: 286, scale: 1.06, y: 1010 },
  { at: 326, scale: 1.0, y: 960 },
];

const font = (weight: number, size: number, color: string) => ({
  fontFamily: FONT.family,
  fontWeight: weight,
  fontSize: size,
  color,
  letterSpacing: '-0.012em',
});

/** Dois tiques azuis, desenhados quando a mensagem é lida. */
const Ticks: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={30} height={19} viewBox="0 0 100 62">
    <g
      stroke={WA.tick}
      strokeWidth="11"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="70"
      strokeDashoffset={70 * (1 - progress)}
    >
      <path d="M 6 34 L 24 52 L 58 12" />
      <path d="M 40 34 L 58 52 L 92 12" />
    </g>
  </svg>
);

/** Balão de digitação do WhatsApp. */
const Typing: React.FC<{ at: number; until: number }> = ({ at, until }) => {
  const frame = useSceneFrame();
  if (frame < at || frame >= until) return null;
  const e = enter(frame, { delay: at, scale: 0.8, y: 10, config: SPRING.pop, fade: 4 });
  return (
    <div
      style={{
        alignSelf: 'flex-end',
        background: WA.bubbleMe,
        borderRadius: 20,
        borderBottomRightRadius: 6,
        padding: '22px 26px',
        display: 'flex',
        gap: 10,
        opacity: e.opacity,
        transform: e.transform,
        boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
      }}
    >
      {[0, 1, 2].map((i) => {
        const t = ((frame - at) / 11 + i * 0.28) % 1;
        const up = Math.max(0, Math.sin(t * Math.PI * 2));
        return (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#7C8B86',
              opacity: 0.45 + 0.55 * up,
              transform: `translateY(${(-up * 5).toFixed(2)}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

const Bubble: React.FC<{
  msg: (typeof T.messages)[number];
  at: number;
}> = ({ msg, at }) => {
  const frame = useSceneFrame();
  if (frame < at) return null;
  const me = msg.from === 'ia';
  const e = enter(frame, {
    delay: at,
    y: 22,
    x: me ? 26 : -26,
    scale: 0.88,
    config: SPRING.pop,
    fade: 5,
  });
  const ticks = s(frame, { delay: at + 9, config: SPRING.soft });

  return (
    <div
      style={{
        alignSelf: me ? 'flex-end' : 'flex-start',
        maxWidth: 540,
        background: me ? WA.bubbleMe : WA.bubbleThem,
        borderRadius: 20,
        borderBottomRightRadius: me ? 6 : 20,
        borderBottomLeftRadius: me ? 20 : 6,
        padding: '18px 22px 14px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
        opacity: e.opacity,
        transform: e.transform,
      }}
    >
      <div style={{ ...font(FONT.semi, 24, WA.label), marginBottom: 4 }}>
        {me ? 'IA:' : 'Cliente:'}
      </div>
      <div
        style={{
          ...font(FONT.regular, 29, WA.text),
          lineHeight: 1.34,
          display: 'inline',
        }}
      >
        {msg.text}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 8,
          marginTop: 4,
        }}
      >
        <span style={font(FONT.medium, 21, WA.time)}>{msg.time}</span>
        {me ? <Ticks progress={ticks} /> : null}
      </div>
    </div>
  );
};

export const SceneChat: React.FC = () => {
  const frame = useSceneFrame();
  const phoneIn = s(frame, { config: SPRING.pop, durationInFrames: 18 });
  const drift = float(frame, 5, 160);
  const lastAt = MSG[MSG.length - 1].at;
  const confirmBeat = pulse(frame, lastAt + 34, 0.03, 30);

  return (
    <AbsoluteFill style={{ background: COLORS.pageBg, overflow: 'hidden' }}>
      {/* barra do navegador, como na referência */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: iv(frame, [0, 8], [0, 1]) }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '30px 52px 10px',
            ...font(FONT.bold, 34, COLORS.dark),
          }}
        >
          10:02
          <div style={{ flex: 1 }} />
          <svg width={78} height={26} viewBox="0 0 78 26">
            <g fill={COLORS.dark}>
              <rect x="0" y="14" width="5" height="8" rx="1.5" />
              <rect x="8" y="10" width="5" height="12" rx="1.5" />
              <rect x="16" y="6" width="5" height="16" rx="1.5" opacity="0.35" />
              <path d="M 32 10 C 37 5 45 5 50 10 L 47 13 C 44 10 38 10 35 13 Z" />
              <path d="M 37 16 C 39.5 13.5 42.5 13.5 45 16 L 41 20 Z" />
              <rect x="58" y="7" width="18" height="12" rx="3" fill="none" stroke={COLORS.dark} strokeWidth="2" />
              <rect x="60" y="9" width="5" height="8" rx="1" />
            </g>
          </svg>
        </div>
        <div style={{ textAlign: 'center', ...font(FONT.medium, 30, COLORS.body), paddingBottom: 18 }}>
          waatzo.com
        </div>
        <div style={{ height: 2, background: '#E7E8EF' }} />
        <div style={{ padding: '26px 52px 24px' }}>
          <Logo size={64} delay={2} fontSize={54} gap={16} />
        </div>
        <div style={{ height: 2, background: '#E7E8EF' }} />
      </div>

      <Camera moves={CAM} drift={3}>
        {/* aparelho */}
        <div
          style={{
            position: 'absolute',
            left: PHONE.left,
            top: PHONE.top,
            width: PHONE.width,
            height: PHONE.height,
            borderRadius: PHONE.radius,
            background: 'linear-gradient(150deg, #4A4E57, #23262D 40%, #15171C)',
            padding: PHONE.bezel,
            boxShadow: '0 40px 90px rgba(16,18,26,0.34)',
            transform: `translateY(${((1 - phoneIn) * 60 + drift).toFixed(2)}px) scale(${(0.955 + 0.045 * phoneIn).toFixed(4)})`,
            opacity: iv(frame, [0, 10], [0, 1]),
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: PHONE.radius - PHONE.bezel,
              background: WA.paper,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* status do iOS */}
            <div
              style={{
                height: STATUS_H,
                background: WA.header,
                display: 'flex',
                alignItems: 'center',
                padding: '0 34px',
                position: 'relative',
                ...font(FONT.bold, 26, WA.text),
              }}
            >
              9:41
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 12,
                  transform: 'translateX(-50%)',
                  width: 168,
                  height: 44,
                  borderRadius: 22,
                  background: '#0B0D10',
                }}
              />
              <div style={{ flex: 1 }} />
              <svg width={62} height={20} viewBox="0 0 78 26">
                <g fill={WA.text}>
                  <rect x="0" y="14" width="5" height="8" rx="1.5" />
                  <rect x="8" y="10" width="5" height="12" rx="1.5" />
                  <rect x="16" y="6" width="5" height="16" rx="1.5" />
                  <path d="M 32 10 C 37 5 45 5 50 10 L 47 13 C 44 10 38 10 35 13 Z" />
                  <path d="M 37 16 C 39.5 13.5 42.5 13.5 45 16 L 41 20 Z" />
                  <rect x="58" y="7" width="18" height="12" rx="3" />
                </g>
              </svg>
            </div>

            {/* cabeçalho da conversa */}
            <div
              style={{
                height: HEADER_H,
                background: WA.header,
                borderBottom: '1px solid #DFE0E2',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '0 26px',
              }}
            >
              <svg width={30} height={30} viewBox="0 0 24 24">
                <path
                  d="M 15 4 L 7 12 L 15 20"
                  fill="none"
                  stroke={WA.text}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: '50%',
                  background: WA.avatar,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...font(FONT.semi, 26, '#FFFFFF'),
                }}
              >
                SA
              </div>
              <div style={{ flex: 1 }}>
                <div style={font(FONT.semi, 29, WA.text)}>{T.contact}</div>
                <div style={{ ...font(FONT.regular, 22, WA.time), marginTop: 2 }}>online</div>
              </div>
              {/* vídeo, ligação e menu */}
              <svg width={34} height={26} viewBox="0 0 34 26">
                <rect x="1" y="4" width="21" height="18" rx="4" fill="none" stroke={WA.text} strokeWidth="2" />
                <path d="M 24 11 L 32 6 L 32 20 L 24 15 Z" fill="none" stroke={WA.text} strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <svg width={28} height={28} viewBox="0 0 24 24">
                <path
                  d="M 6.5 3.5 C 5 3.5 3.5 5.5 3.5 8 C 3.5 14.5 10 20.5 16 20.5 C 18.5 20.5 20.5 19 20.5 17.5 L 16.5 14.5 L 14 17 C 11.5 15.5 8.5 12.5 7 10 L 9.5 7.5 Z"
                  fill="none"
                  stroke={WA.text}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <svg width={8} height={28} viewBox="0 0 8 28">
                <g fill={WA.text}>
                  <circle cx="4" cy="5" r="2.6" />
                  <circle cx="4" cy="14" r="2.6" />
                  <circle cx="4" cy="23" r="2.6" />
                </g>
              </svg>
            </div>

            {/* conversa */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                // ancorado embaixo: cada mensagem nova empurra a pilha para
                // cima, como acontece no WhatsApp
                justifyContent: 'flex-end',
                gap: 20,
                padding: '24px 26px',
                transform: `scale(${1 + confirmBeat})`,
                transformOrigin: 'center bottom',
              }}
            >
              {T.messages.map((m, i) => (
                <React.Fragment key={m.text}>
                  {MSG[i].typing !== undefined ? (
                    <Typing at={MSG[i].typing as number} until={MSG[i].at} />
                  ) : null}
                  <Bubble msg={m} at={MSG[i].at} />
                </React.Fragment>
              ))}
            </div>

            {/* barra de entrada */}
            <div
              style={{
                height: INPUT_H,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '0 22px 14px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: '#FFFFFF',
                  borderRadius: 999,
                  padding: '18px 24px',
                  ...font(FONT.regular, 27, WA.time),
                }}
              >
                <svg width={28} height={28} viewBox="0 0 24 24">
                  <g fill="none" stroke={WA.time} strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="9" cy="10" r="1.1" fill={WA.time} />
                    <circle cx="15" cy="10" r="1.1" fill={WA.time} />
                    <path d="M 8 14.5 C 9.6 16.5 14.4 16.5 16 14.5" strokeLinecap="round" />
                  </g>
                </svg>
                <span style={{ flex: 1 }}>Mensagem</span>
                <svg width={26} height={26} viewBox="0 0 24 24">
                  <path
                    d="M 17 9 L 10 16 C 8.3 17.8 5.5 17.8 3.8 16 C 2.2 14.4 2.2 11.6 3.8 10 L 12.5 1.5 C 13.7 0.4 15.6 0.4 16.8 1.5 C 18 2.7 18 4.6 16.8 5.8 L 8.8 13.8 C 8.3 14.3 7.5 14.3 7 13.8 C 6.5 13.3 6.5 12.5 7 12 L 14 5"
                    fill="none"
                    stroke={WA.time}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <svg width={28} height={28} viewBox="0 0 24 24">
                  <g fill="none" stroke={WA.time} strokeWidth="1.8">
                    <rect x="2.5" y="6" width="19" height="14" rx="3" />
                    <circle cx="12" cy="13" r="4" />
                    <path d="M 8.5 6 L 10 3.5 L 14 3.5 L 15.5 6" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: WA.green,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width={34} height={34} viewBox="0 0 24 24">
                  <g fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
                    <rect x="9.5" y="3" width="5" height="10" rx="2.5" fill="#FFFFFF" stroke="none" />
                    <path d="M 6 11.5 C 6 15 8.7 17 12 17 C 15.3 17 18 15 18 11.5" />
                    <path d="M 12 17 L 12 21" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Camera>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="whoosh_short" at={0} gain={0.5} />
      <Sfx name="soft_pop" at={4} gain={0.5} />

      <Sfx name="notification_pop" at={10} gain={0.8} />
      <Sfx name="tick" at={28} gain={0.4} />
      <Sfx name="bubble_pop" at={44} gain={0.7} />
      <Sfx name="tick" at={53} gain={0.35} />

      <Sfx name="notification_pop" at={78} gain={0.75} />
      <Sfx name="tick" at={94} gain={0.4} />
      <Sfx name="bubble_pop" at={108} gain={0.7} />
      <Sfx name="tick" at={117} gain={0.35} />

      <Sfx name="notification_pop" at={152} gain={0.75} />
      <Sfx name="tick" at={166} gain={0.4} />
      <Sfx name="bubble_pop" at={180} gain={0.75} />
      <Sfx name="tick" at={189} gain={0.35} />

      <Sfx name="success_chime" at={214} gain={0.7} />
      <Sfx name="sparkle" at={218} gain={0.45} />
      <Sfx name="whoosh_transition" at={286} gain={0.4} />
      <Sfx name="sub_boom" at={290} gain={0.35} />
    </AbsoluteFill>
  );
};
