import React from 'react';
import { Backdrop } from '../components/Backdrop';
import { Camera, CameraMove } from '../components/Camera';
import { Logo } from '../components/Logo';
import { Headline } from '../components/Text';
import { Sfx } from '../components/Sfx';
import { COLORS } from '../theme';
import { float } from '../lib/anim';
import { TEXTS } from '../timeline';
import { useSceneFrame } from '../lib/timing';

/**
 * Fecho argumentativo: "o problema não é falta de clientes, é perder
 * oportunidades por não responder a tempo".
 *
 * Tipografia sobre o fundo cheio da marca, como as artes 2 e 4 — sem cartão
 * branco, blobs grandes nos cantos e as linhas entrando uma a uma no ritmo da
 * frase.
 */
const T = TEXTS.s12;

const CAM: CameraMove[] = [
  { at: 0, scale: 1.1, y: 1010 },
  { at: 70, scale: 1.0, y: 960 },
  { at: 150, scale: 1.05, y: 985 },
  { at: 239, scale: 1.14, y: 1030 },
];

export const Scene12: React.FC = () => {
  const frame = useSceneFrame();
  const logoDrift = float(frame, 7, 150);

  return (
    <Camera moves={CAM} drift={7}>
      <Backdrop
        card={false}
        blobs={[
          { x: 1050, y: 40, r: 300, color: COLORS.primary, delay: 0, drift: 12 },
          { x: 120, y: 1810, r: 380, color: COLORS.primary, delay: 3, drift: 16 },
        ]}
        fans={[
          { x: 940, y: 620, size: 148, color: COLORS.peach, rotate: 168, delay: 10 },
          { x: -20, y: 660, size: 140, color: COLORS.lavenderFan, rotate: 196, delay: 14 },
        ]}
      >
        <div
          style={{
            position: 'absolute',
            top: 214,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            transform: `translateY(${logoDrift.toFixed(2)}px)`,
          }}
        >
          <Logo size={92} delay={2} fontSize={78} gap={22} />
        </div>

        <div style={{ position: 'absolute', top: 640, left: 46, right: 46 }}>
          <Headline
            lines={T.lines}
            fontSize={74}
            lineHeight={1.22}
            align="center"
            delay={14}
            stagger={3.4}
            lineStagger={22}
            mode="pop"
          />
        </div>

        {/* --------------------------------------------------------- efeitos */}
        <Sfx name="reverse_whoosh" at={0} gain={0.6} />
        <Sfx name="pop_ui" at={4} />
        <Sfx name="whoosh_short" at={14} />
        <Sfx name="impact" at={18} gain={0.45} />
        <Sfx name="whoosh_short" at={36} gain={0.9} />
        <Sfx name="bass_hit" at={40} gain={0.5} />
        <Sfx name="whoosh_short" at={58} gain={0.9} />
        <Sfx name="impact" at={62} gain={0.5} />
        <Sfx name="whoosh_short" at={80} gain={0.95} />
        <Sfx name="impact" at={84} gain={0.7} />
        <Sfx name="sub_boom" at={88} gain={0.5} />
        <Sfx name="tick" at={140} gain={0.4} />
        <Sfx name="riser" at={200} gain={0.55} />
      </Backdrop>
    </Camera>
  );
};
