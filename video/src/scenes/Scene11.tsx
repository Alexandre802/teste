import React from 'react';
import { Backdrop, CardClip } from '../components/Backdrop';
import { Camera, CameraMove } from '../components/Camera';
import { Logo } from '../components/Logo';
import { Headline, Subtitle } from '../components/Text';
import { Card } from '../components/Ui';
import { BellIcon, CalendarIcon, ChatIcon, PersonIcon } from '../components/Icons';
import { Sfx } from '../components/Sfx';
import { COLORS, FONT } from '../theme';
import { iv, pulse, s, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';
import { useSceneFrame } from '../lib/timing';

/**
 * "Ele faz tudo sozinho" — a lista de capacidades citada na narração
 * (confirma agendamentos, reduz faltas, faz follow-up, responde objeções).
 *
 * Cena própria, no mesmo sistema visual das artes: fundo com blobs, cartão
 * branco, logo no canto e cartões de linha. A câmera passa por um item de cada
 * vez, no ritmo em que a locução os enumera.
 */
const T = TEXTS.s11;
const INSET: [number, number] = [50, 58];

const ICONS = {
  calendar: CalendarIcon,
  bell: BellIcon,
  person: PersonIcon,
  chat: ChatIcon,
} as const;

const ROW_TOP = 640;
const ROW_STEP = 208;
const ROW_H = 168;

/** Frames em que cada item entra e em que a câmera para nele. */
const ENTER = [30, 54, 78, 102];
const FOCUS = [64, 118, 172, 226];

export const Scene11: React.FC = () => {
  const frame = useSceneFrame();

  const moves: CameraMove[] = [
    { at: 0, scale: 1.0, y: 960 },
    { at: 40, scale: 1.16, y: 860 },
    { at: FOCUS[0], scale: 1.24, y: 790 },
    { at: FOCUS[1], scale: 1.24, y: 900 },
    { at: FOCUS[2], scale: 1.24, y: 1060 },
    { at: FOCUS[3], scale: 1.24, y: 1146 },
    { at: 286, scale: 1.06, y: 980 },
    { at: 326, scale: 1.0, y: 960 },
  ];

  /** Item que a câmera está observando. */
  const focused = T.features.findIndex(
    (_, i) => frame >= FOCUS[i] - 16 && frame < (FOCUS[i + 1] ?? 268) - 16,
  );

  return (
    <Camera moves={moves} drift={4}>
      <Backdrop
        inset={INSET}
        blobs={[
          { x: 1040, y: 60, r: 210, color: COLORS.primarySoft, delay: 0, drift: 8 },
          { x: 24, y: 1580, r: 250, color: COLORS.primarySoft, delay: 2, drift: 12 },
          { x: 1050, y: 1850, r: 150, color: COLORS.primary, delay: 4, drift: 8 },
        ]}
        fans={[{ x: 930, y: 340, size: 146, color: COLORS.peach, rotate: 170, delay: 8 }]}
        strokes={[{ x: 44, y: 1500, size: 88, color: COLORS.peachSoft, rotate: 200, delay: 12 }]}
      >
        <CardClip inset={INSET}>
          <div style={{ position: 'absolute', left: 112, top: 108 }}>
            <Logo size={84} delay={0} fontSize={70} gap={20} />
          </div>

          <div style={{ position: 'absolute', left: 104, top: 296, width: 900 }}>
            <Headline lines={[T.lines[0]]} fontSize={84} delay={6} stagger={3} />
          </div>
          <div style={{ position: 'absolute', left: 104, top: 424, width: 900 }}>
            <Headline lines={[T.lines[1]]} fontSize={84} delay={16} stagger={3} />
          </div>

          {T.features.map((f, i) => {
            const Icon = ICONS[f.icon];
            const delay = ENTER[i];
            const isFocus = focused === i;
            const iconIn = s(frame, { delay: delay + 4, config: SPRING.bouncy });
            const beat = pulse(frame, FOCUS[i] - 10, 0.05, 26);
            return (
              <div
                key={f.title}
                style={{ position: 'absolute', left: 104, top: ROW_TOP + i * ROW_STEP }}
              >
                <Card
                  delay={delay}
                  x={i % 2 === 0 ? -60 : 60}
                  y={20}
                  scale={0.94}
                  radius={32}
                  drift={4}
                  driftPhase={i * 26}
                  config={SPRING.pop}
                  style={{
                    width: 872,
                    height: ROW_H,
                    padding: '0 34px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 30,
                    transform: `scale(${1 + beat})`,
                  }}
                >
                  <div
                    style={{
                      width: 104,
                      height: 104,
                      borderRadius: 28,
                      background: isFocus ? COLORS.primary : COLORS.lavender,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transform: `scale(${iconIn.toFixed(4)})`,
                    }}
                  >
                    <Icon
                      size={58}
                      color={isFocus ? COLORS.white : COLORS.primary}
                      strokeWidth={7}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: FONT.family,
                      fontWeight: FONT.semi,
                      fontSize: 42,
                      color: COLORS.dark,
                      letterSpacing: '-0.025em',
                      opacity: iv(frame, [delay + 5, delay + 14], [0, 1]),
                    }}
                  >
                    {f.title}
                  </span>
                </Card>
              </div>
            );
          })}

          <div style={{ position: 'absolute', left: 104, top: 1520, width: 880 }}>
            <Subtitle fontSize={34} delay={250} color={COLORS.muted}>
              {T.footer}
            </Subtitle>
          </div>
        </CardClip>

        {/* --------------------------------------------------------- efeitos */}
        <Sfx name="pop_ui" at={2} />
        <Sfx name="whoosh_short" at={6} />
        <Sfx name="whoosh_short" at={16} gain={0.9} />
        {ENTER.map((d, i) => (
          <React.Fragment key={d}>
            <Sfx name="swipe_fast" at={d - 2} gain={0.7} />
            <Sfx name="pop_ui" at={d} gain={0.8 - i * 0.05} />
          </React.Fragment>
        ))}
        {FOCUS.map((f, i) => (
          <React.Fragment key={f}>
            <Sfx name="whoosh_short" at={f - 14} gain={0.4} />
            <Sfx name="tick" at={f - 10} gain={0.5} />
            {i === 3 ? <Sfx name="success_chime" at={f} gain={0.6} /> : null}
          </React.Fragment>
        ))}
        <Sfx name="soft_pop" at={250} gain={0.5} />
        <Sfx name="sub_boom" at={286} gain={0.35} />
      </Backdrop>
    </Camera>
  );
};
