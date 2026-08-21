import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { MarketScreen, type Brand } from './Market';
import { Phone } from './Ui';
import { BEAT, FPS, beat, fade } from '../config/beat';

type Slot = {
  brand: Brand;
  orders: { id: string; city: string; status: string }[];
};

/**
 * Sessão de marketplaces: os aparelhos não giram — a fileira desliza para o
 * lado e o próximo app assume o centro, como um swipe de carrossel. A cena
 * abre com o Mercado Livre no meio, Shopee à esquerda e Shein à direita,
 * como a copy pede. O que
 * está no centro fica cheio; os vizinhos recuam em escala, brilho e leve
 * rotação, dando profundidade sem tirar o layout original de cena.
 */
export const PhoneSwiper: React.FC<{
  slots: Slot[];
  start: number;
  width: number;
  gap?: number;
  /** Tempos musicais entre uma troca e a seguinte. */
  everyBeats?: number;
  /** Qual aparelho abre a cena no centro. */
  initialIndex?: number;
  ordersStart: number;
}> = ({ slots, start, width, gap = 46, everyBeats = 2, initialIndex = 0, ordersStart }) => {
  const frame = useCurrentFrame();
  const step = width + gap;

  // o índice ativo avança na grade; a passagem entre eles é amortecida
  const elapsed = Math.max(0, frame - (start + beat(1)));
  const swipeIndex = elapsed / beat(everyBeats);
  const current = Math.floor(swipeIndex);
  const progress = spring({
    frame: elapsed - current * beat(everyBeats),
    fps: FPS,
    durationInFrames: beat(1.1),
    config: { damping: 15, mass: 0.9, stiffness: 110 },
  });
  const active = initialIndex + current + progress;

  const enter = spring({
    frame: frame - start,
    fps: FPS,
    durationInFrames: beat(1.5),
    config: { damping: 14, mass: 0.8, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: 'relative',
        width: '100%', height: width * 2.02,
        perspective: 2600,
        overflow: 'hidden',
        opacity: fade(frame, start, 0.6),
      }}
    >
      <div
        style={{
          position: 'absolute', top: 0, left: '50%',
          height: '100%',
          display: 'flex', gap, alignItems: 'center',
          transformStyle: 'preserve-3d',
          transform:
            `translateX(${-width / 2 - active * step}px) ` +
            `translateY(${interpolate(enter, [0, 1], [90, 0])}px)`,
        }}
      >
        {slots.map((s, i) => {
          // distância até o centro, contínua, para a transição não ter degrau
          const d = i - active;
          const ad = Math.min(Math.abs(d), 2);
          const scale = interpolate(ad, [0, 1, 2], [1, 0.82, 0.72]);
          const dim = interpolate(ad, [0, 1, 2], [1, 0.5, 0.34]);
          const tilt = interpolate(d, [-1, 0, 1], [26, 0, -26], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <div
              key={s.brand}
              style={{
                flexShrink: 0,
                transform: `scale(${scale}) rotateY(${tilt}deg)`,
                filter: `brightness(${dim})`,
                zIndex: Math.round((2 - ad) * 10),
              }}
            >
              <Phone start={start} width={width} delayFrom={0}>
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
    </div>
  );
};
