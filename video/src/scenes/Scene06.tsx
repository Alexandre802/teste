import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Backdrop, CardClip } from '../components/Backdrop';
import { Logo } from '../components/Logo';
import { Headline, Subtitle } from '../components/Text';
import { Card, PhoneFrame, SkeletonLine } from '../components/Ui';
import { CheckIcon, RobotIcon } from '../components/Icons';
import { Sfx } from '../components/Sfx';
import { COLORS, FONT, SHADOW } from '../theme';
import { enter, float, iv, pulse, s, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';

const T = TEXTS.s06;
const INSET: [number, number] = [50, 58];

export const Scene06: React.FC = () => {
  const frame = useCurrentFrame();
  const logoIn = s(frame, { delay: 34, config: SPRING.bouncy });
  const glow = 0.35 + 0.25 * Math.sin(frame / 16);
  const checkProg = s(frame, { delay: 108, config: SPRING.bouncy });
  const checkBeat = pulse(frame, 110, 0.18, 24);
  const botFloat = float(frame, 7, 120);

  return (
    <Backdrop
      inset={INSET}
      blobs={[
        { x: 1040, y: 60, r: 215, color: COLORS.primarySoft, delay: 0, drift: 9 },
        { x: 20, y: 1420, r: 235, color: COLORS.primarySoft, delay: 4, drift: 12 },
        { x: 1050, y: 1830, r: 160, color: COLORS.primary, delay: 8, drift: 8 },
      ]}
      fans={[{ x: 935, y: 440, size: 145, color: COLORS.peach, rotate: 170, delay: 14 }]}
      strokes={[{ x: 46, y: 1560, size: 88, color: COLORS.peachSoft, rotate: 200, delay: 18 }]}
    >
      <CardClip inset={INSET}>
        <div
          style={{
            position: 'absolute',
            top: 236,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Logo size={100} delay={2} fontSize={86} gap={24} />
        </div>

        {/* "Nasceu o Waatzo" */}
        <div style={{ position: 'absolute', top: 430, left: 60, right: 60 }}>
          <Headline
            lines={[[{ t: T.line1, c: 'dark' }]]}
            fontSize={116}
            align="center"
            delay={12}
            stagger={4}
          />
        </div>
        <div style={{ position: 'absolute', top: 566, left: 40, right: 40 }}>
          <Headline
            lines={[[{ t: T.line2, c: 'blue' }]]}
            fontSize={170}
            align="center"
            delay={22}
            stagger={4}
            mode="pop"
            letterSpacing="-0.045em"
          />
        </div>

        <div style={{ position: 'absolute', top: 786, left: 0, right: 0 }}>
          <Subtitle fontSize={50} delay={40} align="center" color={COLORS.muted}>
            {T.subtitle}
          </Subtitle>
        </div>

        {/* Telefone com o app aberto */}
        <div style={{ position: 'absolute', left: 246, top: 924 }}>
          <PhoneFrame width={620} height={980} delay={48} borderWidth={22} radius={76} y={110}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: COLORS.cardBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Halo pulsante atrás do ícone */}
              <div
                style={{
                  position: 'absolute',
                  width: 420,
                  height: 420,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(75,69,241,${glow * 0.5}) 0%, transparent 62%)`,
                  transform: `translateY(-218px) scale(${1 + glow * 0.18})`,
                }}
              />
              <div
                style={{
                  width: 232,
                  height: 232,
                  borderRadius: 66,
                  background: `linear-gradient(155deg, ${COLORS.primarySoft}, ${COLORS.primaryDeep})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `translateY(-218px) scale(${logoIn}) rotate(${(1 - logoIn) * -18}deg)`,
                  boxShadow: `0 26px 60px rgba(75,69,241,0.4)`,
                }}
              >
                <svg width={124} height={124} viewBox="0 0 100 100">
                  <path d="M 63 6 L 24 57 L 45 57 L 37 94 L 78 41 L 55 41 Z" fill="#FFF" />
                </svg>
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* Cartão do robô confirmando */}
        <div
          style={{
            position: 'absolute',
            left: 196,
            top: 1408,
            transform: `translateY(${botFloat}px)`,
          }}
        >
          <Card delay={92} radius={38} y={44} scale={0.88} style={{ width: 712, padding: 34 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
              <div
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: '50%',
                  background: COLORS.primarySoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${s(frame, { delay: 98, config: SPRING.bouncy })})`,
                }}
              >
                <RobotIcon size={88} color={COLORS.white} accent={COLORS.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: FONT.family,
                    fontWeight: FONT.bold,
                    fontSize: 44,
                    color: COLORS.dark,
                    letterSpacing: '-0.025em',
                    marginBottom: 18,
                    opacity: iv(frame, [100, 110], [0, 1]),
                  }}
                >
                  {T.botName}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <SkeletonLine width={300} height={20} delay={104} />
                  <SkeletonLine width={210} height={20} delay={110} />
                </div>
              </div>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: '50%',
                  background: COLORS.green,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${checkProg * (1 + checkBeat)})`,
                  boxShadow: '0 10px 26px rgba(37,211,102,0.4)',
                }}
              >
                <CheckIcon size={52} color="#FFF" strokeWidth={8} />
              </div>
            </div>
          </Card>
        </div>
      </CardClip>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="pop_ui" at={4} />
      <Sfx name="whoosh_short" at={12} />
      <Sfx name="reverse_whoosh" at={12} gain={0.7} />
      <Sfx name="impact" at={24} gain={0.8} />
      <Sfx name="bass_hit" at={24} gain={0.7} />
      <Sfx name="sparkle" at={28} gain={0.8} />
      <Sfx name="soft_pop" at={40} />
      <Sfx name="whoosh_transition" at={46} gain={0.7} />
      <Sfx name="digital_click" at={34} />
      <Sfx name="sub_boom" at={36} gain={0.5} />
      <Sfx name="pop_ui" at={92} />
      <Sfx name="soft_pop" at={98} />
      <Sfx name="tick" at={104} gain={0.7} />
      <Sfx name="tick" at={110} gain={0.7} />
      <Sfx name="success_chime" at={108} />
      <Sfx name="sparkle" at={112} gain={0.6} />
    </Backdrop>
  );
};
