import React from 'react';

import { COLORS, FONT } from '../theme';
import { enter, iv, pulse, s, SPRING } from '../lib/anim';
import { useSceneFrame } from '../lib/timing';

/** Raio do ícone quadrado, proporcional ao tamanho (como na arte). */
const RADIUS_RATIO = 0.29;

export const Bolt: React.FC<{ size: number; color?: string; progress?: number }> = ({
  size,
  color = COLORS.white,
  progress = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M 63 6 L 24 57 L 45 57 L 37 94 L 78 41 L 55 41 Z"
      fill={color}
      style={{
        transformOrigin: '50px 50px',
        transform: `scale(${progress})`,
      }}
    />
  </svg>
);

/**
 * Lockup da marca. O quadrado, o raio e cada letra entram separadamente.
 */
export const Logo: React.FC<{
  size?: number;
  delay?: number;
  word?: boolean;
  fontSize?: number;
  gap?: number;
}> = ({ size = 86, delay = 0, word = true, fontSize, gap = 20 }) => {
  const frame = useSceneFrame();
  const box = enter(frame, { delay, scale: 0.4, rotate: -14, config: SPRING.bouncy, fade: 6 });
  const boltProg = s(frame, { delay: delay + 4, config: SPRING.bouncy });
  const beat = pulse(frame, delay + 10, 0.08, 22);
  const fs = fontSize ?? size * 0.78;
  const letters = 'Waatzo'.split('');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * RADIUS_RATIO,
          background: `linear-gradient(155deg, ${COLORS.primarySoft} 0%, ${COLORS.primary} 46%, ${COLORS.primaryDeep} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: box.opacity,
          transform: `${box.transform} scale(${1 + beat})`,
          boxShadow: `0 ${size * 0.14}px ${size * 0.34}px rgba(75,69,241,0.32)`,
        }}
      >
        <Bolt size={size * 0.62} progress={boltProg} />
      </div>

      {word ? (
        <div style={{ display: 'flex' }}>
          {letters.map((l, i) => {
            const e = enter(frame, {
              delay: delay + 6 + i * 2.2,
              y: 14,
              scale: 0.72,
              config: SPRING.pop,
              fade: 6,
            });
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONT.family,
                  fontWeight: FONT.extra,
                  fontSize: fs,
                  color: COLORS.primaryText,
                  letterSpacing: '-0.035em',
                  lineHeight: 1,
                  display: 'inline-block',
                  opacity: e.opacity,
                  transform: e.transform,
                }}
              >
                {l}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

/** Marca-d'água discreta usada quando o logo já apareceu na cena anterior. */
export const LogoQuiet: React.FC<{ size?: number; delay?: number }> = ({
  size = 78,
  delay = 0,
}) => {
  const frame = useSceneFrame();
  const o = iv(frame, [delay, delay + 12], [0, 1]);
  return (
    <div style={{ opacity: o }}>
      <Logo size={size} delay={delay} />
    </div>
  );
};
