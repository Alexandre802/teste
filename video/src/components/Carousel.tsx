import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { MarketScreen, type Brand } from './Market';
import { Phone } from './Ui';
import { BEAT, fade, overshoot } from '../config/beat';

type Slot = {
  brand: Brand;
  orders: { id: string; city: string; status: string }[];
};

/**
 * Os três marketplaces lado a lado, cada aparelho girando no próprio eixo.
 *
 * A volta completa dura um número redondo de tempos, então a rotação nunca
 * sai da grade musical; a defasagem entre eles evita que os três fiquem de
 * perfil no mesmo quadro.
 */
export const PhoneSpinRow: React.FC<{
  slots: Slot[];
  start: number;
  width: number;
  gap?: number;
  /** Tempos musicais para uma volta completa. */
  turnBeats?: number;
  ordersStart: number;
}> = ({ slots, start, width, gap = 22, turnBeats = 8, ordersStart }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'flex', gap, perspective: 2400, alignItems: 'center' }}>
      {slots.map((s, i) => {
        const at = start + i * 5;
        const enter = overshoot(frame, at, 1.5);
        // cada aparelho começa a girar com um atraso e mantém a defasagem
        const spin = ((frame - at) / (BEAT * turnBeats)) * 360 + i * 42;
        const rad = (spin * Math.PI) / 180;
        const facing = Math.cos(rad);
        return (
          <div
            key={s.brand}
            style={{
              transformStyle: 'preserve-3d',
              opacity: fade(frame, at, 0.6),
              transform:
                `translateY(${interpolate(enter, [0, 1], [90, 0])}px) ` +
                `scale(${interpolate(enter, [0, 1], [0.86, 1])}) ` +
                `rotateY(${spin}deg)`,
              // o verso do aparelho escurece, dando volume ao giro
              filter: `brightness(${0.5 + 0.5 * (facing * 0.5 + 0.5)})`,
            }}
          >
            <Phone start={at} width={width} delayFrom={0}>
              <MarketScreen
                brand={s.brand}
                width={width}
                start={ordersStart + i * 5}
                every={1.5}
                orders={s.orders}
              />
            </Phone>
          </div>
        );
      })}
    </div>
  );
};
