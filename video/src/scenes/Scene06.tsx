import React from 'react';

import { Backdrop, CardClip } from '../components/Backdrop';
import { Camera, CameraMove } from '../components/Camera';
import { Logo } from '../components/Logo';
import { Headline, Subtitle } from '../components/Text';
import { Card, PhoneFrame, SkeletonLine } from '../components/Ui';
import { CheckIcon, RobotIcon } from '../components/Icons';
import { Sfx } from '../components/Sfx';
import { COLORS, FONT, SHADOW } from '../theme';
import { enter, float, iv, pulse, s, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';
import { useSceneFrame, useVariant } from '../lib/timing';

const T = TEXTS.s06;
const INSET: [number, number] = [50, 58];

/**
 * v0 — o lançamento ("nasceu a Waatzo");
 * v1 — retomada em "é como ter uma funcionária que nunca atrasa": tudo já está
 *      em cena e a câmera entra no aparelho e no robô confirmando.
 */
const D0 = { logo: 2, l1: 12, l2: 22, sub: 40, phone: 48, icon: 34, bot: 92, botIcon: 98, sk1: 104, sk2: 110, check: 108 };
const D1 = { logo: 0, l1: 0, l2: 3, sub: 8, phone: 2, icon: 8, bot: 16, botIcon: 20, sk1: 26, sk2: 32, check: 40 };

export const Scene06: React.FC = () => {
  const frame = useSceneFrame();
  const variant = useVariant();
  const back = variant === 1;
  const D = back ? D1 : D0;
  const logoIn = s(frame, { delay: D.icon, config: SPRING.bouncy });
  const glow = 0.35 + 0.25 * Math.sin(frame / 16);
  const checkProg = s(frame, { delay: D.check, config: SPRING.bouncy });
  const checkBeat = pulse(frame, D.check + 2, 0.18, 24) + (back ? pulse(frame, 120, 0.12, 26) : 0);
  const botFloat = float(frame, 7, 120);

  const moves: CameraMove[] = back
    ? [
        // Retomada: fica no aparelho e no robô — o título de lançamento fica
        // fora de quadro, porque a frase agora é outra.
        { at: 0, scale: 1.26, x: 546, y: 1100 },
        { at: 90, scale: 1.34, x: 546, y: 1180 },
        { at: 198, scale: 1.14, x: 540, y: 1020 },
      ]
    : [
        { at: 0, scale: 1.12, y: 880 },
        { at: 60, scale: 1.0, y: 960 },
        { at: 150, scale: 1.14, y: 1060 },
        { at: 262, scale: 1.24, y: 1130 },
      ];

  return (
    <Camera moves={moves} drift={back ? 4 : 6}>
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
          <Logo size={100} delay={D.logo} fontSize={86} gap={24} />
        </div>

        {/* "Nasceu a Waatzo" */}
        <div style={{ position: 'absolute', top: 430, left: 60, right: 60 }}>
          <Headline
            lines={[[{ t: T.line1, c: 'dark' }]]}
            fontSize={116}
            align="center"
            delay={D.l1}
            stagger={4}
          />
        </div>
        <div style={{ position: 'absolute', top: 566, left: 40, right: 40 }}>
          <Headline
            lines={[[{ t: T.line2, c: 'blue' }]]}
            fontSize={170}
            align="center"
            delay={D.l2}
            stagger={4}
            mode="pop"
            letterSpacing="-0.045em"
          />
        </div>

        <div style={{ position: 'absolute', top: 786, left: 0, right: 0 }}>
          <Subtitle fontSize={50} delay={D.sub} align="center" color={COLORS.muted}>
            {T.subtitle}
          </Subtitle>
        </div>

        {/* Telefone com o app aberto */}
        <div style={{ position: 'absolute', left: 246, top: 924 }}>
          <PhoneFrame width={620} height={980} delay={D.phone} borderWidth={22} radius={76} y={110}>
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
          <Card delay={D.bot} radius={38} y={44} scale={0.88} style={{ width: 712, padding: 34 }}>
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
                  transform: `scale(${s(frame, { delay: D.botIcon, config: SPRING.bouncy })})`,
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
                    opacity: iv(frame, [D.botIcon + 2, D.botIcon + 12], [0, 1]),
                  }}
                >
                  {T.botName}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <SkeletonLine width={300} height={20} delay={D.sk1} />
                  <SkeletonLine width={210} height={20} delay={D.sk2} />
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
      {back ? (
        <>
          <Sfx name="whoosh_short" at={0} gain={0.8} />
          <Sfx name="soft_pop" at={8} />
          <Sfx name="pop_ui" at={16} />
          <Sfx name="tick" at={26} gain={0.6} />
          <Sfx name="tick" at={32} gain={0.6} />
          <Sfx name="whoosh_short" at={48} gain={0.5} />
          <Sfx name="sparkle" at={56} gain={0.6} />
          <Sfx name="whoosh_short" at={112} gain={0.5} />
          <Sfx name="success_chime" at={120} gain={0.7} />
          <Sfx name="sub_boom" at={150} gain={0.4} />
          <Sfx name="whoosh_transition" at={186} gain={0.5} />
        </>
      ) : (
        <>
          <Sfx name="pop_ui" at={2} />
          <Sfx name="whoosh_short" at={10} />
          <Sfx name="reverse_whoosh" at={10} gain={0.7} />
          <Sfx name="impact" at={22} gain={0.8} />
          <Sfx name="bass_hit" at={22} gain={0.7} />
          <Sfx name="sparkle" at={26} gain={0.8} />
          <Sfx name="soft_pop" at={40} />
          <Sfx name="whoosh_transition" at={46} gain={0.7} />
          <Sfx name="digital_click" at={34} />
          <Sfx name="sub_boom" at={36} gain={0.5} />
          <Sfx name="pop_ui" at={92} />
          <Sfx name="soft_pop" at={98} />
          <Sfx name="tick" at={104} gain={0.7} />
          <Sfx name="success_chime" at={108} />
          <Sfx name="sparkle" at={112} gain={0.6} />
        </>
      )}
    </Backdrop>
    </Camera>
  );
};
