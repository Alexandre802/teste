import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { evolvePath, getLength, getPointAtLength } from '@remotion/paths';
import { IconBox } from '../components/Icons';
import { beat, fadeOut, pulse } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 16–20s — A GRANDE PROMESSA. Da copy: "Uma caixa atravessa o mapa
 * rapidamente." A rota é desenhada sobre o traçado da própria arte e a caixa
 * corre por cima dela, de Goiânia a São Paulo.
 */

/** Traçado da rota sobre a arte, no espaço 3840×1280. */
const ROTA = 'M 2560 690 C 2790 560, 3080 560, 3300 700';

export const S5Promessa: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);
  const scale = interpolate(frame, [0, duration], [1.03, 1.0]);

  const t = interpolate(frame, [beat(1), beat(4)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const evolved = evolvePath(t, ROTA);
  const pt = getPointAtLength(ROTA, t * getLength(ROTA));
  const glow = pulse(frame, 2);

  return (
    <AbsoluteFill style={{ opacity: out, overflow: 'hidden', backgroundColor: theme.navy }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile('plates/s5_mapa.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <svg width={3840} height={1280} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <path
            d={ROTA}
            stroke={theme.cyanSoft}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={evolved.strokeDasharray}
            strokeDashoffset={evolved.strokeDashoffset}
            style={{ filter: `drop-shadow(0 0 ${16 + glow * 16}px ${theme.cyan})` }}
          />
        </svg>

        {pt && t > 0 && t < 1.02 ? (
          <div
            style={{
              position: 'absolute',
              left: pt.x, top: pt.y,
              transform: 'translate(-50%, -50%)',
              filter: `drop-shadow(0 0 26px ${theme.cyan})`,
            }}
          >
            <IconBox size={92} color={theme.white} />
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
