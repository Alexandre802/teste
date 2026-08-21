import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { beat, fade, fadeOut, overshoot, pulse } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 12–16s — URGÊNCIA. Da copy: "Pedido vendido → separado → enviado. A
 * interface começa a mostrar o prazo."
 *
 * O aparelho da arte está em perspectiva, então nada de retângulo reto por
 * cima: o que anima são os marcadores do rastreio acendendo em sequência,
 * com a linha ligando um ao outro, e o prazo destacado no fim.
 */

/** Marcadores das etapas na arte, no espaço 3840×1280. */
const ETAPAS = [
  { x: 755, y: 562 },
  { x: 755, y: 715 },
  { x: 761, y: 884 },
];
/** Faixa do prazo estimado. */
const PRAZO = { x: 690, y: 1190, w: 470, h: 96 };

export const S4Urgencia: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);
  const scale = interpolate(frame, [0, duration], [1.0, 1.035]);
  const glow = pulse(frame, 2);

  return (
    <AbsoluteFill style={{ opacity: out, overflow: 'hidden', backgroundColor: theme.navy }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile('plates/s4_urgencia.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* a linha desce ligando as etapas */}
        {ETAPAS.slice(0, -1).map((e, i) => {
          const at = beat(1 + i * 1.5);
          const grow = interpolate(frame, [at, at + beat(1)], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          const next = ETAPAS[i + 1];
          return (
            <div
              key={`l${i}`}
              style={{
                position: 'absolute',
                left: e.x - 3, top: e.y,
                width: 6, height: (next.y - e.y) * grow,
                background: theme.blueBright,
                boxShadow: `0 0 18px ${theme.cyan}`,
                opacity: 0.9,
              }}
            />
          );
        })}

        {/* cada etapa acende no seu tempo */}
        {ETAPAS.map((e, i) => {
          const at = beat(1 + i * 1.5);
          const p = overshoot(frame, at, 1);
          const on = fade(frame, at, 0.4);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: e.x, top: e.y,
                width: 62, height: 62, borderRadius: '50%',
                transform: `translate(-50%, -50%) scale(${interpolate(p, [0, 1], [0.4, 1])})`,
                border: `5px solid ${theme.cyanSoft}`,
                boxShadow: `0 0 ${26 + glow * 22}px ${theme.cyan}`,
                opacity: on * 0.95,
              }}
            />
          );
        })}

        {/* o prazo aparece por último */}
        <div
          style={{
            position: 'absolute',
            left: PRAZO.x, top: PRAZO.y, width: PRAZO.w, height: PRAZO.h,
            borderRadius: 16,
            border: `3px solid ${theme.cyan}`,
            boxShadow: `0 0 ${30 + glow * 26}px ${theme.cyan}66`,
            opacity: fade(frame, beat(5.5), 0.6) * 0.9,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
