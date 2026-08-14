import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgLight } from '../components/Bg';
import { LineChart } from '../components/Charts';
import { LightSweep, Sparks } from '../components/Fx';
import { Bell, HomeIcon, Menu, PieIcon, TrendUp, UserIcon, BarsIcon } from '../components/Icons';
import { LogoHeader } from '../components/Logo';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { UiText } from '../components/Type';
import { Counter, Rule, Skeleton } from '../components/Ui';
import { breathe, fmtBRL, prog, springAt, tween, typewriter } from '../components/anim';
import { COLORS, EASE, FONTS, SHADOW, SPRINGS } from '../config/theme';
import { COPY } from '../config/timeline';

const PHONE = { x: 316, y: 400, w: 476, h: 1236, r: 72 };
const PAD = 30;

/** Linha da lista "Atividade recente". */
const ActivityRow: React.FC<{ value: number; delay: number; y: number }> = ({
  value,
  delay,
  y,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springAt(frame, fps, delay, SPRINGS.snappy);
  return (
    <div
      style={{
        position: 'absolute',
        left: PAD,
        top: y,
        width: PHONE.w - PAD * 2,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        opacity: prog(frame, delay, 12),
        transform: `translateX(${(1 - s) * 46}px)`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: COLORS.greenBright,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <TrendUp size={22} color="#FFFFFF" strokeWidth={2.6} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton w="72%" h={9} delay={delay + 4} />
        <Skeleton w="46%" h={9} delay={delay + 7} color="#F1F3F3" />
      </div>
      <div
        style={{
          fontFamily: FONTS.ui,
          fontWeight: 600,
          fontSize: 22,
          color: COLORS.green,
          opacity: prog(frame, delay + 6, 12),
        }}
      >
        + R$ {fmtBRL(value, 2)}
      </div>
    </div>
  );
};

/**
 * Cena 09 — mockup do app: "Veja o lucro real".
 * Referência: 133BCCC2-5D93-4FE2-8763-C59A943458A1.png
 * O aparelho e cada elemento da tela são camadas independentes.
 */
export const S09Phone: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneS = springAt(frame, fps, 8, SPRINGS.heavy);
  const greet = typewriter(frame, 34, COPY.s09.greeting, 22, fps);
  const chipL = springAt(frame, fps, 84, SPRINGS.pop);
  const chipR = springAt(frame, fps, 96, SPRINGS.pop);

  return (
    <AbsoluteFill>
      <BgLight tone="cool" charts={false} grain={0.18} />

      {/* rastro de luz verde atrás do aparelho */}
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="sw" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(5,213,142,0)" />
            <stop offset="50%" stopColor="rgba(5,213,142,0.55)" />
            <stop offset="100%" stopColor="rgba(123,255,214,0)" />
          </linearGradient>
          <filter id="swb" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
        </defs>
        {[0, 1, 2].map((i) => {
          const p = prog(frame, 16 + i * 6, 70, EASE.inOut);
          const L = 3400;
          return (
            <path
              key={i}
              d={`M -120 ${1560 + i * 62} C 300 ${1470 + i * 60}, 760 ${1240 + i * 50}, 1180 ${420 - i * 70}`}
              fill="none"
              stroke="url(#sw)"
              strokeWidth={26 - i * 6}
              strokeLinecap="round"
              filter="url(#swb)"
              strokeDasharray={L}
              strokeDashoffset={L * (1 - p)}
              opacity={0.8 - i * 0.2}
            />
          );
        })}
      </svg>

      <Scene total={total} zoom={0.05} driftY={-14}>
        <LogoHeader delay={0} />

        {/* título */}
        <div
          style={{
            position: 'absolute',
            top: 300,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONTS.ui,
            fontWeight: 400,
            fontSize: 60,
            letterSpacing: '-0.02em',
            color: COLORS.inkSoft,
            opacity: prog(frame, 4, 20),
            transform: `translateY(${(1 - prog(frame, 4, 26)) * 26}px)`,
          }}
        >
          {COPY.s09.title[0]}
          <span style={{ color: COLORS.green, fontWeight: 700 }}>
            {COPY.s09.title[1]}
          </span>
        </div>

        {/* aparelho */}
        <div
          style={{
            position: 'absolute',
            left: PHONE.x,
            top: PHONE.y,
            width: PHONE.w,
            height: PHONE.h,
            borderRadius: PHONE.r,
            background: 'linear-gradient(150deg, #1B2C2A 0%, #0B1817 40%, #233B37 100%)',
            padding: 9,
            boxShadow: '0 50px 110px rgba(9,32,27,0.30), 0 12px 32px rgba(9,32,27,0.16)',
            opacity: prog(frame, 8, 14),
            transform: `translateY(${(1 - phoneS) * 140}px) scale(${0.92 + phoneS * 0.08}) rotate(${(1 - phoneS) * 1.6}deg)`,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: PHONE.r - 9,
              background: '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            {/* notch */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 16,
                transform: 'translateX(-50%)',
                width: 118,
                height: 30,
                borderRadius: 999,
                background: '#0B1817',
              }}
            />

            {/* header */}
            <div
              style={{
                position: 'absolute',
                left: PAD,
                right: PAD,
                top: 74,
                display: 'flex',
                justifyContent: 'space-between',
                opacity: prog(frame, 26, 14),
              }}
            >
              <Menu size={30} color={COLORS.ink} strokeWidth={2.4} />
              <Bell size={30} color={COLORS.ink} strokeWidth={2.2} />
            </div>

            {/* saudação com digitação */}
            <div
              style={{
                position: 'absolute',
                left: PAD,
                top: 128,
                fontFamily: FONTS.ui,
                fontWeight: 600,
                fontSize: 40,
                letterSpacing: '-0.02em',
                color: COLORS.ink,
              }}
            >
              {greet.shown}
              {!greet.done && greet.caret && (
                <span style={{ color: COLORS.greenBright }}>|</span>
              )}
            </div>
            <UiText
              size={21}
              weight={400}
              color={COLORS.grayLight}
              delay={54}
              style={{ position: 'absolute', left: PAD, top: 178 }}
            >
              {COPY.s09.greetingSub}
            </UiText>

            {/* card lucro total */}
            <div
              style={{
                position: 'absolute',
                left: PAD,
                top: 218,
                width: PHONE.w - PAD * 2,
                height: 128,
                borderRadius: 26,
                background: 'linear-gradient(120deg, #DFF3EA 0%, #C9EEDD 100%)',
                opacity: prog(frame, 58, 14),
                transform: `scale(${0.94 + springAt(frame, fps, 58, SPRINGS.snappy) * 0.06})`,
              }}
            >
              <UiText
                size={21}
                weight={500}
                color={COLORS.inkSoft}
                delay={62}
                style={{ position: 'absolute', left: 22, top: 18 }}
              >
                {COPY.s09.totalLabel}
              </UiText>
              <Counter
                to={COPY.s09.total}
                delay={64}
                dur={46}
                prefix="R$ "
                decimals={2}
                size={40}
                weight={700}
                color={COLORS.ink}
                style={{ position: 'absolute', left: 22, top: 46 }}
              />
              <UiText
                size={20}
                weight={600}
                color={COLORS.green}
                delay={104}
                style={{ position: 'absolute', left: 22, top: 96 }}
              >
                {COPY.s09.delta}
              </UiText>
              <div
                style={{
                  position: 'absolute',
                  right: 20,
                  top: 22,
                  width: 62,
                  height: 62,
                  borderRadius: 18,
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${springAt(frame, fps, 68, SPRINGS.pop)}) rotate(${breathe(frame, 0.05, 3)}deg)`,
                }}
              >
                <TrendUp size={32} color={COLORS.green} strokeWidth={2.6} />
              </div>
            </div>

            {/* dois cards vazios */}
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: PAD + i * ((PHONE.w - PAD * 2) / 2 + 8),
                  top: 362,
                  width: (PHONE.w - PAD * 2) / 2 - 8,
                  height: 74,
                  borderRadius: 20,
                  background: '#F4F6F6',
                  opacity: prog(frame, 72 + i * 4, 14),
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 8,
                  paddingLeft: 16,
                }}
              >
                <Skeleton w="62%" h={9} delay={76 + i * 4} color="#E4E8E8" />
                <Skeleton w="40%" h={9} delay={79 + i * 4} color="#EAEDED" />
              </div>
            ))}

            {/* desempenho */}
            <UiText
              size={22}
              weight={500}
              color={COLORS.inkSoft}
              delay={84}
              style={{ position: 'absolute', left: PAD, top: 462 }}
            >
              {COPY.s09.perfLabel}
            </UiText>
            <div style={{ position: 'absolute', left: PAD, top: 498 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: i * 56,
                    width: PHONE.w - PAD * 2,
                    borderTop: '2px dashed #EDF0EF',
                    opacity: prog(frame, 86 + i * 3, 12),
                  }}
                />
              ))}
              <LineChart
                id="phone"
                points={[
                  [0, 148],
                  [46, 120],
                  [86, 138],
                  [126, 96],
                  [168, 118],
                  [212, 72],
                  [258, 96],
                  [304, 40],
                  [352, 66],
                  [416, 8],
                ]}
                width={PHONE.w - PAD * 2}
                height={168}
                delay={88}
                dur={54}
                color={COLORS.green}
                areaFrom="rgba(1,146,102,0.22)"
                strokeWidth={5}
                nodeRadius={0}
                nodes={false}
                baseline={168}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 416 - 9,
                  top: 8 - 9,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: COLORS.greenBright,
                  boxShadow: `0 0 ${10 + breathe(frame, 0.12, 6)}px ${COLORS.greenNeon}`,
                  opacity: prog(frame, 138, 10),
                  transform: `scale(${springAt(frame, fps, 138, SPRINGS.pop)})`,
                }}
              />
            </div>

            {/* atividade recente */}
            <UiText
              size={22}
              weight={500}
              color={COLORS.inkSoft}
              delay={132}
              style={{ position: 'absolute', left: PAD, top: 762 }}
            >
              {COPY.s09.activityLabel}
            </UiText>
            {COPY.s09.activity.map((v, i) => (
              <ActivityRow key={v} value={v} delay={138 + i * 8} y={816 + i * 74} />
            ))}

            {/* nav inferior */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 30,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '0 34px',
              }}
            >
              {[HomeIcon, BarsIcon, PieIcon, UserIcon].map((Ico, i) => (
                <div
                  key={i}
                  style={{
                    opacity: prog(frame, 118 + i * 4, 12),
                    transform: `scale(${springAt(frame, fps, 118 + i * 4, SPRINGS.pop)})`,
                  }}
                >
                  <Ico size={34} color={i === 0 ? COLORS.greenBright : '#C3CBCB'} />
                </div>
              ))}
            </div>

            <Rule
              delay={112}
              color="#EDEFEF"
              height={2}
              style={{ position: 'absolute', left: PAD, right: PAD, bottom: 96 }}
            />
          </div>
        </div>

        {/* chip flutuante esquerdo */}
        <div
          style={{
            position: 'absolute',
            left: 34,
            top: 660,
            width: 288,
            height: 232,
            borderRadius: 34,
            background: COLORS.white,
            boxShadow: SHADOW.cardHi,
            opacity: prog(frame, 84, 12),
            transform: `translateX(${(1 - chipL) * -140}px) rotate(${(1 - chipL) * -6}deg) translateY(${breathe(frame, 0.03, 7)}px)`,
            padding: 26,
          }}
        >
          <UiText size={26} weight={600} color={COLORS.ink}>
            {COPY.s09.chip}
          </UiText>
          <LineChart
            id="chip"
            points={[
              [0, 96],
              [40, 70],
              [76, 84],
              [116, 44],
              [156, 62],
              [200, 10],
            ]}
            width={236}
            height={110}
            delay={92}
            dur={38}
            color={COLORS.greenBright}
            areaFrom="rgba(3,179,119,0.24)"
            strokeWidth={5}
            nodes={false}
            baseline={110}
            style={{ top: 62, left: 0 }}
          />
          <div
            style={{
              position: 'absolute',
              left: 200 - 8,
              top: 62 + 10 - 8,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: COLORS.greenBright,
              opacity: prog(frame, 126, 10),
            }}
          />
        </div>

        {/* badge flutuante direito */}
        <div
          style={{
            position: 'absolute',
            right: 30,
            top: 1148,
            width: 288,
            height: 208,
            borderRadius: 34,
            background: COLORS.white,
            boxShadow: SHADOW.cardHi,
            opacity: prog(frame, 96, 12),
            transform: `translateX(${(1 - chipR) * 150}px) rotate(${(1 - chipR) * 6}deg) translateY(${breathe(frame, 0.028, 8, 1.4)}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.ui,
              fontWeight: 700,
              fontSize: 66,
              letterSpacing: '-0.03em',
              color: COLORS.green,
              opacity: prog(frame, 104, 12),
              transform: `scale(${tween(frame, [104, 122], [0.7, 1], EASE.back)})`,
            }}
          >
            {COPY.s09.badge.value}
          </div>
          <UiText size={26} weight={400} color={COLORS.gray} delay={112}>
            {COPY.s09.badge.caption}
          </UiText>
        </div>
      </Scene>

      <Sparks
        count={16}
        delay={104}
        origin={[900, 1160]}
        spread={240}
        rise={160}
        color={COLORS.greenNeon}
        seed="ph"
      />
      <LightSweep delay={30} dur={46} />
      <LightSweep delay={150} dur={44} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.8 },
          { name: 'whooshShort', at: 8 },
          { name: 'bassHit', at: 12, volume: 0.7 },
          { name: 'clickDigital', at: 26 },
          { name: 'tickMicro', at: 36 },
          { name: 'tickMicro', at: 42, rate: 1.1 },
          { name: 'tickMicro', at: 48, rate: 0.9 },
          { name: 'popSoft', at: 58 },
          { name: 'tapButton', at: 68 },
          { name: 'popUi', at: 72 },
          { name: 'popUi', at: 76, rate: 1.1 },
          { name: 'swipeFast', at: 88 },
          { name: 'whooshShort', at: 84, rate: 1.2 },
          { name: 'whooshShort', at: 96, rate: 1.1 },
          { name: 'notificationPop', at: 104 },
          { name: 'clickDigital', at: 118 },
          { name: 'clickDigital', at: 122, rate: 1.08 },
          { name: 'clickDigital', at: 126, rate: 1.16 },
          { name: 'clickDigital', at: 130, rate: 1.24 },
          { name: 'sparkleShine', at: 138 },
          { name: 'popSoft', at: 138 },
          { name: 'popSoft', at: 146, rate: 1.06 },
          { name: 'popSoft', at: 154, rate: 1.12 },
        ]}
      />
    </AbsoluteFill>
  );
};
