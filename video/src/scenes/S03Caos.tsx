import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgLight } from '../components/Bg';
import { Flash, RedSlash, Shards, SpeedLines } from '../components/Fx';
import { BarsIcon, DownloadBox, UploadBox } from '../components/Icons';
import { LogoHeader } from '../components/Logo';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { UiText } from '../components/Type';
import { Card, Counter, IconBadge } from '../components/Ui';
import { prog, rndRange, springAt, tween } from '../components/anim';
import { COLORS, EASE, SHADOW, SPRINGS } from '../config/theme';
import { COPY } from '../config/timeline';

/** Cédula estilizada que atravessa a tela (camada de parallax). */
const Bill: React.FC<{ i: number; delay: number }> = ({ i, delay }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay + rndRange(`bd${i}`, 0, 12), rndRange(`bu${i}`, 60, 110), EASE.out);
  if (p <= 0) return null;
  const ang = rndRange(`ba${i}`, 0, Math.PI * 2);
  const r = rndRange(`br${i}`, 420, 1180) * p;
  const w = rndRange(`bw${i}`, 110, 210);
  const rot = rndRange(`bo${i}`, -240, 240) * p;
  const tilt = rndRange(`bt${i}`, -70, 70) * p;
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
      <div style={{ position: 'absolute', inset: '14%', border: '2px solid rgba(255,255,255,0.55)', borderRadius: 4 }} />
      <div style={{ position: 'absolute', left: '10%', top: '34%', width: '26%', height: '32%', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
    </div>
  );
};

/**
 * Cena 03 (gráficos) — receitas × despesas × resultado.
 * Referência: 5F0A4926-BA0B-49C5-8626-D2B40D37A110.png
 *
 * Layout fiel à arte: logo, dois cards lado a lado, o card de resultado
 * abaixo ligado por conectores, o X vermelho e o dinheiro voando.
 * Nenhum texto além do que existe na arte.
 */
export const S03Caos: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CARD_W = 400;
  const CARD_H = 430;
  const connector = prog(frame, 46, 20, EASE.out);
  const RESULT = 54;
  const resultSpring = springAt(frame, fps, RESULT, SPRINGS.pop);

  // linhas de tendência do fundo da arte (uma verde caindo, uma vermelha subindo)
  const lineP = prog(frame, 6, 40, EASE.inOut);

  return (
    <AbsoluteFill>
      <BgLight tone="cool" charts={false} />
      <SpeedLines delay={0} dur={26} count={40} color="rgba(220,58,63,0.10)" />

      <Scene total={total} zoom={0.1} driftY={-14}>
        <LogoHeader delay={0} size={78} />

        {/* colunas e linhas de tendência ao fundo, como na arte */}
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const h = [300, 430, 360, 250, 190][i] * prog(frame, 2 + i * 3, 26, EASE.out);
            return (
              <rect
                key={i}
                x={330 + i * 105}
                y={620 - h + 300}
                width={82}
                height={h}
                rx={14}
                fill={i % 2 ? 'rgba(242,80,58,0.16)' : 'rgba(1,146,102,0.17)'}
              />
            );
          })}
          <path
            d="M -20 400 L 240 380 L 400 470 L 620 545 L 900 505 L 1100 560"
            fill="none"
            stroke="rgba(1,146,102,0.35)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={1600}
            strokeDashoffset={1600 * (1 - lineP)}
          />
          <path
            d="M -20 620 L 260 600 L 430 640 L 640 540 L 860 470 L 1100 300"
            fill="none"
            stroke="rgba(242,80,58,0.5)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={1600}
            strokeDashoffset={1600 * (1 - lineP)}
          />
          <circle cx={240} cy={380} r={13 * prog(frame, 20, 12)} fill="none" stroke="rgba(1,146,102,0.45)" strokeWidth={5} />
          <circle cx={860} cy={470} r={13 * prog(frame, 30, 12)} fill="none" stroke="rgba(242,80,58,0.6)" strokeWidth={5} />
        </svg>

        {Array.from({ length: 12 }).map((_, i) => (
          <Bill key={i} i={i} delay={14} />
        ))}

        <RedSlash delay={18} dur={14} opacity={0.55} />
        <Shards count={30} delay={22} />

        {/* cards receitas / despesas */}
        {COPY.s03.cards.map((c, i) => {
          const isRed = c.tone === 'red';
          const delay = 8 + i * 8;
          return (
            <Card
              key={c.label}
              delay={delay}
              w={CARD_W}
              h={CARD_H}
              radius={44}
              from={i === 0 ? 'left' : 'right'}
              distance={240}
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
                delay={delay + 5}
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
                delay={delay + 8}
              >
                {c.label}
              </UiText>
              <Counter
                to={c.value}
                delay={delay + 10}
                dur={30}
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
            strokeDashoffset={-frame * 1.1}
            opacity={connector}
          />
          <path
            d="M 802 0 L 802 84 L 540 84 L 540 152"
            fill="none"
            stroke={COLORS.red}
            strokeWidth={4}
            strokeDasharray="14 12"
            strokeDashoffset={frame * 1.1}
            opacity={connector}
          />
        </svg>

        {/* card resultado */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 1226,
            transform: `translateX(-50%) scale(${0.68 + resultSpring * 0.32})`,
            opacity: prog(frame, RESULT, 10),
          }}
        >
          <div
            style={{
              width: 430,
              height: 380,
              borderRadius: 46,
              background: COLORS.white,
              boxShadow: `${SHADOW.cardHi}, 0 0 ${70 * resultSpring}px rgba(3,179,119,0.38)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
            }}
          >
            <IconBadge bg={COLORS.greenPaler} size={118} radius={32} delay={RESULT + 6}>
              <BarsIcon size={62} color={COLORS.greenBright} />
            </IconBadge>
            <UiText size={36} weight={600} color={COLORS.greenDeep} delay={RESULT + 9}>
              {COPY.s03.result.label}
            </UiText>
            <Counter
              to={COPY.s03.result.value}
              delay={RESULT + 11}
              dur={30}
              prefix="R$ "
              size={66}
              weight={700}
              color={COLORS.greenDeep}
            />
          </div>
        </div>
      </Scene>

      <Flash at={18} dur={8} color="#FFD9D3" max={0.55} />

      <SfxTrack
        cues={[
          { name: 'riserShort', at: 0, volume: 0.6 },
          { name: 'whooshShort', at: 8 },
          { name: 'whooshShort', at: 16, rate: 1.1 },
          { name: 'popSoft', at: 13 },
          { name: 'popSoft', at: 21, rate: 1.1 },
          { name: 'impactHit', at: 18, volume: 1 },
          { name: 'subBoom', at: 18, volume: 0.7 },
          { name: 'glitchDigital', at: 24 },
          { name: 'tickMicro', at: 46 },
          { name: 'tickMicro', at: 50, rate: 1.15 },
          { name: 'notificationPop', at: RESULT },
          { name: 'bassHit', at: RESULT, volume: 0.68 },
          { name: 'successChime', at: RESULT + 30, volume: 0.6 },
          { name: 'sparkleShine', at: RESULT + 30, volume: 0.5 },
        ]}
      />
    </AbsoluteFill>
  );
};
