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
  /** Glifo do ícone: usa o da marca quando informado. */
  glyph?: string;
};

/** `light` reproduz o card claro das artes; `dark` é o card de vidro escuro. */
export type NotifTone = 'dark' | 'light';

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
  tone?: NotifTone;
  /** De que lado a carta entra, para o leque abrir na direção certa. */
  side?: 'left' | 'right';
}> = ({
  items, start, everyBeats = 1.5, width,
  cardHeight = 118, gap = 14, spread = 2.4, exitAt,
  tone = 'dark', side = 'left',
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
        const dir = side === 'left' ? 1 : -1;
        const angle = off * spread * dir * Math.min(1, opened / 2);
        const x = off * 6 * dir;
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
            <NotifCard item={item} height={cardHeight} tone={tone} />
          </div>
        );
      })}
    </div>
  );
};

const NotifCard: React.FC<{ item: NotifItem; height: number; tone: NotifTone }> = ({
  item, height, tone,
}) => {
  const light = tone === 'light';
  const k = height / 118;
  return (
    <div
      style={{
        height,
        display: 'flex', alignItems: 'center', gap: 14 * k,
        padding: `0 ${20 * k}px`,
        borderRadius: 20 * k,
        background: light ? 'rgba(232,240,255,0.93)' : 'rgba(12,22,58,0.84)',
        border: `1px solid ${light ? 'rgba(255,255,255,0.9)' : 'rgba(150,190,255,0.3)'}`,
        backdropFilter: 'blur(14px)',
        boxShadow: light
          ? '0 16px 34px rgba(0,0,0,0.42)'
          : '0 22px 50px rgba(0,0,0,0.5)',
        fontFamily: font.body,
      }}
    >
      <div
        style={{
          width: 46 * k, height: 46 * k, borderRadius: 11 * k, flexShrink: 0,
          background: item.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24 * k, fontWeight: 800,
          color: item.accent === '#ffe600' ? '#2d3277' : '#ffffff',
        }}
      >
        {item.glyph ?? 'S'}
      </div>
      <div style={{ minWidth: 0, flex: 1, lineHeight: 1.25 }}>
        <div style={{ fontSize: 21 * k, fontWeight: 700, color: light ? '#0b1020' : theme.white }}>
          {item.app}
        </div>
        <div style={{ fontSize: 18 * k, color: light ? '#3c4763' : 'rgba(226,238,255,0.92)' }}>
          {item.body}
        </div>
      </div>
    </div>
  );
};
