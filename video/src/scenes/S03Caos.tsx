import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgLight } from '../components/Bg';
import { Flash, RedSlash, Shards, SpeedLines } from '../components/Fx';
import { DownloadBox, UploadBox, BarsIcon } from '../components/Icons';
import { LogoHeader } from '../components/Logo';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { UiText } from '../components/Type';
import { Card, Counter, IconBadge } from '../components/Ui';
import { prog, rndRange, springAt, tween } from '../components/anim';
import { COLORS, EASE, FONTS, SHADOW, SPRINGS } from '../config/theme';
import { COPY } from '../config/timeline';

/** Cédula estilizada que atravessa a tela (camada de parallax). */
const Bill: React.FC<{ i: number; delay: number }> = ({ i, delay }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay + rndRange(`bd${i}`, 0, 14), rndRange(`bu${i}`, 70, 130), EASE.out);
  if (p <= 0) return null;
  const ang = rndRange(`ba${i}`, 0, Math.PI * 2);
  const r = rndRange(`br${i}`, 420, 1180) * p;
  const w = rndRange(`bw${i}`, 110, 210);
  const rot = rndRange(`bo${i}`, -220, 220) * p;
  const tilt = rndRange(`bt${i}`, -60, 60) * p;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 + Math.cos(ang) * r - w / 2,
        top: 960 + Math.sin(ang) * r * 1.2,
        width: w,
        height: w * 0.46,
        borderRadius: 8,
        background: 'linear-gradient(126deg, #DFF0E6 0%, #A8D8BE 42%, #6FBF95 100%)',
        boxShadow: '0 10px 26px rgba(9,32,27,0.18)',
        opacity: (1 - p) * 0.95,
        transform: `rotate(${rot}deg) rotate3d(1, 0.4, 0, ${tilt}deg)`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '14%',
          border: '2px solid rgba(255,255,255,0.55)',
          borderRadius: 4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '10%',
          top: '34%',
          width: '26%',
          height: '32%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.4)',
        }}
      />
    </div>
  );
};

/**
 * Cena 03 — ganhos e gastos espalhados: receitas x despesas x resultado.
 * Referência: 5F0A4926-BA0B-49C5-8626-D2B40D37A110.png
 */
export const S03Caos: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CARD_W = 400;
  const CARD_H = 430;
  const connector = prog(frame, 84, 26, EASE.out);
  const resultSpring = springAt(frame, fps, 96, SPRINGS.pop);

  return (
    <AbsoluteFill>
      <BgLight tone="cool" charts={false} />
      <SpeedLines delay={2} dur={30} count={40} color="rgba(220,58,63,0.10)" />

      <Scene total={total} zoom={0.07} driftY={-10}>
        <LogoHeader delay={0} />

        {/* cédulas voando */}
        {Array.from({ length: 12 }).map((_, i) => (
          <Bill key={i} i={i} delay={26} />
        ))}

        <RedSlash delay={30} dur={16} opacity={0.52} />
        <Shards count={30} delay={34} />

        <UiText
          size={34}
          weight={500}
          color={COLORS.gray}
          delay={10}
          style={{
            position: 'absolute',
            top: 320,
            width: '100%',
            textAlign: 'center',
            letterSpacing: '0.01em',
          }}
        >
          {COPY.s03.kicker}
        </UiText>

        {/* cards receitas / despesas */}
        {COPY.s03.cards.map((c, i) => {
          const isRed = c.tone === 'red';
          const delay = 16 + i * 10;
          return (
            <Card
              key={c.label}
              delay={delay}
              w={CARD_W}
              h={CARD_H}
              radius={44}
              from={i === 0 ? 'left' : 'right'}
              distance={220}
              spring="snappy"
              shadow={SHADOW.cardHi}
              style={{
                position: 'absolute',
                left: i === 0 ? 78 : 'auto',
                right: i === 1 ? 78 : 'auto',
                top: 640,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 28,
              }}
            >
              <IconBadge
                bg={isRed ? COLORS.redPale : COLORS.greenPaler}
                size={128}
                radius={34}
                delay={delay + 8}
              >
                {isRed ? (
                  <UploadBox size={68} color={COLORS.red} strokeWidth={2.4} />
                ) : (
                  <DownloadBox size={68} color={COLORS.greenBright} strokeWidth={2.4} />
                )}
              </IconBadge>
              <UiText
                size={38}
                weight={600}
                color={isRed ? COLORS.red : COLORS.green}
                delay={delay + 12}
              >
                {c.label}
              </UiText>
              <Counter
                to={c.value}
                delay={delay + 14}
                dur={46}
                prefix="R$ "
                size={62}
                weight={700}
                color={isRed ? COLORS.red : COLORS.greenDeep}
              />
            </Card>
          );
        })}

        {/* conectores tracejados até o resultado */}
        <svg
          width={1080}
          height={420}
          viewBox="0 0 1080 420"
          style={{ position: 'absolute', left: 0, top: 1070 }}
        >
          <path
            d="M 278 0 L 278 84 L 540 84 L 540 152"
            fill="none"
            stroke={COLORS.greenBright}
            strokeWidth={4}
            strokeDasharray="14 12"
            strokeDashoffset={-frame * 0.8}
            opacity={connector}
          />
          <path
            d="M 802 0 L 802 84 L 540 84 L 540 152"
            fill="none"
            stroke={COLORS.red}
            strokeWidth={4}
            strokeDasharray="14 12"
            strokeDashoffset={frame * 0.8}
            opacity={connector}
          />
        </svg>

        {/* card resultado */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 1226,
            transform: `translateX(-50%) scale(${0.7 + resultSpring * 0.3})`,
            opacity: prog(frame, 96, 12),
          }}
        >
          <div
            style={{
              width: 430,
              height: 380,
              borderRadius: 46,
              background: COLORS.white,
              boxShadow: `${SHADOW.cardHi}, 0 0 ${60 * resultSpring}px rgba(3,179,119,0.35)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
            }}
          >
            <IconBadge bg={COLORS.greenPaler} size={118} radius={32} delay={104}>
              <BarsIcon size={62} color={COLORS.greenBright} />
            </IconBadge>
            <UiText size={36} weight={600} color={COLORS.greenDeep} delay={108}>
              {COPY.s03.result.label}
            </UiText>
            <Counter
              to={COPY.s03.result.value}
              delay={110}
              dur={44}
              prefix="R$ "
              size={66}
              weight={700}
              color={COLORS.greenDeep}
            />
          </div>
        </div>

        {/* pergunta que fica */}
        <div
          style={{
            position: 'absolute',
            bottom: 118,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 52,
            letterSpacing: '-0.03em',
            color: COLORS.ink,
            opacity: prog(frame, 150, 18),
            transform: `translateY(${(1 - prog(frame, 150, 24)) * 30}px)`,
          }}
        >
          Tudo espalhado.{' '}
          <span style={{ color: COLORS.red }}>Nada claro.</span>
        </div>
      </Scene>

      <Flash at={30} dur={8} color="#FFD9D3" max={0.55} />

      <SfxTrack
        cues={[
          { name: 'riserShort', at: 0, volume: 0.6 },
          { name: 'whooshShort', at: 16 },
          { name: 'whooshShort', at: 26, rate: 1.1 },
          { name: 'popSoft', at: 24 },
          { name: 'popSoft', at: 34, rate: 1.1 },
          { name: 'impactHit', at: 30, volume: 1 },
          { name: 'subBoom', at: 30, volume: 0.7 },
          { name: 'glitchDigital', at: 36 },
          { name: 'tickMicro', at: 84 },
          { name: 'tickMicro', at: 90, rate: 1.15 },
          { name: 'notificationPop', at: 96 },
          { name: 'bassHit', at: 96, volume: 0.65 },
          { name: 'whooshShort', at: 150, rate: 0.9 },
        ]}
      />
    </AbsoluteFill>
  );
};
