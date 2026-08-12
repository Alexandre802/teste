import React from 'react';
import { Img, staticFile } from 'remotion';
import { Camera } from '../components/Camera';
import { Backdrop, CardClip } from '../components/Backdrop';
import { Logo } from '../components/Logo';
import { Headline } from '../components/Text';
import { NotificationCard } from '../components/Ui';
import { Sfx } from '../components/Sfx';
import { COLORS } from '../theme';
import { enter, float, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';
import { useSceneFrame } from '../lib/timing';

const T = TEXTS.s03;
const INSET: [number, number] = [50, 58];

/** Aproximação lenta seguindo a enxurrada de mensagens. */
const CAM = [
  { at: 0, scale: 1.0, y: 960 },
  { at: 90, scale: 1.1, y: 1030 },
  { at: 218, scale: 1.2, y: 1110 },
];

export const Scene03: React.FC = () => {
  const frame = useSceneFrame();
  // Foto entra com leve zoom-out e segue em parallax lento (efeito Ken Burns)
  const photo = enter(frame, { delay: 6, scale: 1.1, config: SPRING.soft, fade: 18 });
  const drift = float(frame, 12, 210);
  const slowZoom = 1 + (frame / 218) * 0.05;

  return (
    <Camera moves={CAM} drift={6}>
    <Backdrop
      inset={INSET}
      blobs={[
        { x: 1030, y: 90, r: 200, color: COLORS.primarySoft, delay: 0, drift: 8 },
        { x: 40, y: 1620, r: 260, color: COLORS.primary, delay: 4, drift: 12 },
      ]}
      fans={[{ x: 930, y: 360, size: 145, color: COLORS.peach, rotate: 170, delay: 16 }]}
      strokes={[{ x: 34, y: 700, size: 80, color: COLORS.peachSoft, rotate: 150, delay: 22 }]}
    >
      <CardClip inset={INSET}>
        {/* Foto do atendimento */}
        <div
          style={{
            position: 'absolute',
            left: 63,
            top: 482,
            width: 958,
            height: 1372,
            opacity: photo.opacity,
            transform: `${photo.transform} translateY(${drift}px) scale(${slowZoom})`,
            transformOrigin: '60% 40%',
          }}
        >
          <Img
            src={staticFile('photos/s3_pro.png')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Logo */}
        <div style={{ position: 'absolute', left: 115, top: 106 }}>
          <Logo size={82} delay={2} fontSize={68} gap={20} />
        </div>

        {/* Título */}
        <div style={{ position: 'absolute', left: 108, top: 286, width: 940 }}>
          <Headline
            lines={T.lines}
            fontSize={78}
            lineHeight={1.13}
            delay={10}
            stagger={3}
            lineStagger={6}
          />
        </div>

        {/* Notificações que não param de chegar */}
        {T.cards.map((c, i) => (
          <div key={c.name} style={{ position: 'absolute', left: 63, top: 932 + i * 196 }}>
            <NotificationCard
              width={476}
              name={c.name}
              text={c.text}
              time={c.time}
              photo={c.photo}
              delay={44 + i * 22}
              from="left"
              fontSize={24}
              driftPhase={i * 34}
            />
          </div>
        ))}
      </CardClip>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="pop_ui" at={4} />
      <Sfx name="whoosh_short" at={10} />
      <Sfx name="whoosh_transition" at={6} gain={0.5} />
      <Sfx name="whoosh_short" at={24} gain={0.8} />
      {T.cards.map((c, i) => (
        <React.Fragment key={c.name}>
          <Sfx name="swipe_fast" at={42 + i * 22} gain={0.75} />
          <Sfx name="notification_pop" at={44 + i * 22} gain={1 - i * 0.06} />
        </React.Fragment>
      ))}
      <Sfx name="sub_boom" at={126} gain={0.45} />
    </Backdrop>
    </Camera>
  );
};
