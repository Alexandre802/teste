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
 * Pilha de notificações no gesto da referência do cliente: cada card novo
 * **sobe por baixo** e assenta abaixo do anterior, e o conjunto vai se
 * abrindo como um leque — as cartas espalham em ângulo e deslocamento à
 * medida que a pilha cresce.
 */
export const NotificationStack: React.FC<{
  items: NotifItem[];
  start: number;
  /** Intervalo entre chegadas, em tempos musicais. */
  everyBeats?: number;
  width: number;
  cardHeight?: number;
  gap?: number;
  /** Abertura do leque: graus por carta a partir do centro. */
  spread?: number;
  /** Quadro em que a pilha começa a sair de cena. */
  exitAt?: number;
}> = ({
  items, start, everyBeats = 1.5, width,
  cardHeight = 118, gap = 14, spread = 2.4, exitAt,
}) => {
  const frame = useCurrentFrame();

  const arrival = (i: number) => start + beat(i * everyBeats);
  const settle = (at: number) =>
    spring({
      frame: frame - at,
      fps: FPS,
      durationInFrames: beat(1.2),
      config: { damping: 15, mass: 0.85, stiffness: 125 },
    });

  // quantas cartas já chegaram, de forma contínua: é o que abre o leque
  const opened = items.reduce((acc, _, i) => acc + settle(arrival(i)), 0);
  const center = (opened - 1) / 2;

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

        const enter = settle(at);
        // sobe por baixo até o próprio lugar na pilha
        const baseY = i * (cardHeight + gap);
        const y = baseY + interpolate(enter, [0, 1], [cardHeight + 70, 0]);

        // leque: ângulo e deslocamento crescem com a distância até o centro
        const off = i - center;
        const angle = off * spread * Math.min(1, opened / 2);
        const x = off * 11;
        const depth = 1 - Math.abs(off) * 0.018;
        const float = Math.sin((frame + i * 24) / (BEAT * 3)) * 2.5;

        return (
          <div
            key={i}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              transformOrigin: '50% 140%',
              transform:
                `translate(${x}px, ${y + float + exiting * 70}px) ` +
                `rotate(${angle}deg) ` +
                `scale(${depth * interpolate(enter, [0, 1], [0.88, 1]) * (1 - exiting * 0.08)})`,
              opacity: fade(frame, at, 0.4) * (1 - exiting),
              filter: exiting > 0 ? `blur(${exiting * 10}px)` : undefined,
              zIndex: i + 1,
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
      background: 'rgba(12,22,58,0.84)',
      border: '1px solid rgba(150,190,255,0.3)',
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
