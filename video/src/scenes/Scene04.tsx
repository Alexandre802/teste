import React from 'react';

import { Camera } from '../components/Camera';
import { Backdrop } from '../components/Backdrop';
import { Logo } from '../components/Logo';
import { Headline } from '../components/Text';
import { Sfx } from '../components/Sfx';
import { COLORS } from '../theme';
import { float, iv } from '../lib/anim';
import { TEXTS } from '../timeline';
import { useSceneFrame } from '../lib/timing';

const T = TEXTS.s04;

/**
 * Cena tipográfica. Sem cards: o peso está no ritmo das palavras, no
 * respiro dos blobs e na leve deriva das decorações.
 */
/** Respiração: afasta enquanto as palavras entram, depois aproxima. */
const CAM = [
  { at: 0, scale: 1.12, y: 1030 },
  { at: 70, scale: 1.0, y: 960 },
  { at: 150, scale: 1.05, y: 990 },
  { at: 236, scale: 1.14, y: 1040 },
];

export const Scene04: React.FC = () => {
  const frame = useSceneFrame();
  const logoDrift = float(frame, 8, 150);
  // Zoom lento no bloco de texto — dá sensação de aproximação
  const zoom = iv(frame, [0, 236], [1, 1.06]);

  return (
    <Camera moves={CAM} drift={8}>
    <Backdrop
      card={false}
      blobs={[
        { x: 1030, y: 60, r: 310, color: COLORS.primary, delay: 0, drift: 14 },
        { x: 150, y: 1810, r: 400, color: COLORS.primary, delay: 3, drift: 18 },
      ]}
      fans={[
        { x: 950, y: 660, size: 155, color: COLORS.peach, rotate: 168, delay: 14 },
        { x: -24, y: 660, size: 150, color: COLORS.lavenderFan, rotate: 196, delay: 18 },
      ]}
    >
      <div
        style={{
          position: 'absolute',
          top: 268,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          transform: `translateY(${logoDrift}px)`,
        }}
      >
        <Logo size={92} delay={4} fontSize={78} gap={22} />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 740,
          left: 40,
          right: 40,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <Headline
          lines={T.lines}
          fontSize={92}
          lineHeight={1.16}
          align="center"
          delay={16}
          stagger={4.5}
          lineStagger={9}
          mode="pop"
        />
      </div>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="reverse_whoosh" at={0} gain={0.7} />
      <Sfx name="pop_ui" at={6} />
      <Sfx name="sparkle" at={10} gain={0.6} />
      <Sfx name="whoosh_short" at={16} />
      <Sfx name="impact" at={20} gain={0.5} />
      <Sfx name="whoosh_short" at={30} gain={0.9} />
      <Sfx name="bass_hit" at={34} gain={0.55} />
      <Sfx name="whoosh_short" at={44} gain={0.95} />
      <Sfx name="impact" at={48} gain={0.7} />
      <Sfx name="sub_boom" at={52} gain={0.5} />
      <Sfx name="tick" at={90} gain={0.5} />
      <Sfx name="glitch" at={150} gain={0.35} />
      <Sfx name="riser" at={198} gain={0.55} />
    </Backdrop>
    </Camera>
  );
};
