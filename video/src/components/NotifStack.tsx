import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { BEAT, FPS, beat, fade } from '../config/beat';
import { font, theme } from '../config/theme';

export type NotifItem = {
  app: string;
  /** Cor da marca no ícone do app. */
  accent: string;
  time: string;
  body: React.ReactNode;
};

/**
 * Pilha de notificações, exatamente como na referência do cliente: o card cai
 * de cima, assenta, e cada nova chegada empurra as anteriores para baixo.
 * Nada some — a pilha cresce e continua flutuando de leve.
 */
export const NotificationStack: React.FC<{
  items: NotifItem[];
  start: number;
  /** Intervalo entre chegadas, em tempos musicais. */
  everyBeats?: number;
  width: number;
  cardHeight?: number;
  gap?: number;
  /** Quadro em que a pilha começa a sair de cena. */
  exitAt?: number;
}> = ({ items, start, everyBeats = 1.5, width, cardHeight = 118, gap = 14, exitAt }) => {
  const frame = useCurrentFrame();

  const arrival = (i: number) => start + beat(i * everyBeats);
  const settle = (at: number) =>
    spring({
      frame: frame - at,
      fps: FPS,
      durationInFrames: beat(1.2),
      config: { damping: 14, mass: 0.8, stiffness: 130 },
    });

  const exiting = exitAt !== undefined
    ? interpolate(frame, [exitAt, exitAt + beat(1)], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <div style={{ position: 'relative', width, height: items.length * (cardHeight + gap) + cardHeight }}>
      {items.map((item, i) => {
        const at = arrival(i);
        if (frame < at - 3) return null;

        // cada chegada posterior empurra este card mais para baixo
        let push = 0;
        for (let j = i + 1; j < items.length; j++) {
          push += (cardHeight + gap) * settle(arrival(j));
        }

        const enter = settle(at);
        const y = interpolate(enter, [0, 1], [-(cardHeight + 60), 0]) + push;
        const float = Math.sin((frame + i * 21) / (BEAT * 3)) * 3;

        return (
          <div
            key={i}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              transform:
                `translateY(${y + float + exiting * 90}px) ` +
                `scale(${interpolate(enter, [0, 1], [0.9, 1]) * (1 - exiting * 0.08)})`,
              opacity: fade(frame, at, 0.4) * (1 - exiting),
              filter: exiting > 0 ? `blur(${exiting * 10}px)` : undefined,
              zIndex: items.length - i,
            }}
          >
            <NotifCard item={item} height={cardHeight} />
          </div>
        );
      })}
    </div>
  );
};

const NotifCard: React.FC<{ item: NotifItem; height: number }> = ({ item, height }) => (
  <div
    style={{
      height,
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '0 24px',
      borderRadius: 26,
      background: 'rgba(12,22,58,0.82)',
      border: '1px solid rgba(150,190,255,0.28)',
      backdropFilter: 'blur(14px)',
      boxShadow: '0 22px 50px rgba(0,0,0,0.5)',
      fontFamily: font.body,
    }}
  >
    <div
      style={{
        width: 62, height: 62, borderRadius: 15, flexShrink: 0,
        background: item.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30,
      }}
    >
      🤝
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div style={{ fontSize: 25, fontWeight: 700, color: theme.white }}>{item.app}</div>
        <div style={{ fontSize: 19, color: 'rgba(200,220,255,0.65)' }}>{item.time}</div>
      </div>
      <div style={{ fontSize: 21, color: 'rgba(226,238,255,0.92)', lineHeight: 1.3, marginTop: 2 }}>
        {item.body}
      </div>
    </div>
  </div>
);
