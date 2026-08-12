import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, SHADOW } from '../theme';
import { enter, float, iv, s, SPRING } from '../lib/anim';

/**
 * Leque decorativo (as "explosões" pêssego e lavanda das artes).
 * Reconstruído em SVG para poder animar cada lâmina.
 */
export const Fan: React.FC<{
  size: number;
  color: string;
  rotate?: number;
  blades?: number;
  spread?: number;
  delay?: number;
  frame: number;
}> = ({ size, color, rotate = 0, blades = 4, spread = 66, delay = 0, frame }) => {
  const mid = (blades - 1) / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <g transform={`rotate(${rotate} 50 50)`}>
        {Array.from({ length: blades }).map((_, i) => {
          const a = (i - mid) * (spread / Math.max(1, blades - 1));
          const grow = s(frame, { delay: delay + i * 3, config: SPRING.pop });
          const breathe = 1 + Math.sin((frame + i * 20) / 46) * 0.05;
          const len = 44 * grow * breathe;
          const base = 8.5;
          const tip = 5.5;
          return (
            <g key={i} transform={`rotate(${a} 50 94)`}>
              <path
                d={`M ${50 - base} 94
                    L ${50 - tip} ${94 - len}
                    Q 50 ${94 - len - 6} ${50 + tip} ${94 - len}
                    L ${50 + base} 94 Z`}
                fill={color}
                opacity={grow}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/** Pincelada pêssego arredondada (canto inferior esquerdo das artes). */
export const Stroke: React.FC<{
  size: number;
  color: string;
  rotate?: number;
  delay?: number;
  frame: number;
}> = ({ size, color, rotate = 0, delay = 0, frame }) => {
  const g = s(frame, { delay, config: SPRING.pop });
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 80 100" style={{ overflow: 'visible' }}>
      <g transform={`rotate(${rotate} 40 50) scale(${g})`} style={{ transformOrigin: '40px 50px' }}>
        {/* Pincelada em meia-lua, como nas artes de referência */}
        <path
          d="M 16 2
             C 56 2 78 26 74 54
             C 70 82 48 98 18 100
             C 40 82 52 62 50 44
             C 48 26 36 12 16 2 Z"
          fill={color}
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export type BlobSpec = {
  x: number;
  y: number;
  r: number;
  color?: string;
  delay?: number;
  /** Amplitude do parallax vertical. */
  drift?: number;
};

export type BackdropProps = {
  /** Desenha o cartão branco arredondado (como na maioria das artes). */
  card?: boolean;
  blobs?: BlobSpec[];
  fans?: {
    x: number;
    y: number;
    size: number;
    color: string;
    rotate?: number;
    blades?: number;
    delay?: number;
  }[];
  strokes?: { x: number; y: number; size: number; color: string; rotate?: number; delay?: number }[];
  /** Escala geral do cartão na entrada. */
  cardDelay?: number;
  /** Margem do cartão branco: [vertical, horizontal] em px. */
  inset?: [number, number];
  radius?: number;
  children?: React.ReactNode;
};

/**
 * Fundo completo de uma cena: página, blobs roxos, cartão branco e
 * decorações. Cada camada anima de forma independente.
 */
export const Backdrop: React.FC<BackdropProps> = ({
  card = true,
  blobs = [],
  fans = [],
  strokes = [],
  cardDelay = 0,
  inset = [52, 52],
  radius = 58,
  children,
}) => {
  const frame = useCurrentFrame();
  const cardIn = enter(frame, { delay: cardDelay, scale: 0.965, config: SPRING.soft, fade: 10 });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.pageBg, overflow: 'hidden' }}>
      {blobs.map((b, i) => {
        const g = s(frame, { delay: b.delay ?? 0, config: SPRING.soft });
        const dy = float(frame, b.drift ?? 10, 150, i * 30);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x - b.r,
              top: b.y - b.r,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: '50%',
              background: b.color ?? COLORS.primary,
              transform: `translate3d(0, ${dy}px, 0) scale(${0.86 + 0.14 * g})`,
              opacity: iv(frame, [b.delay ?? 0, (b.delay ?? 0) + 14], [0, 1]),
            }}
          />
        );
      })}

      {card ? (
        <div
          style={{
            position: 'absolute',
            inset: `${inset[0]}px ${inset[1]}px`,
            borderRadius: radius,
            background: COLORS.cardBg,
            boxShadow: SHADOW.sheet,
            opacity: cardIn.opacity,
            transform: cardIn.transform,
            overflow: 'hidden',
          }}
        />
      ) : null}

      {fans.map((f, i) => (
        <div key={`f${i}`} style={{ position: 'absolute', left: f.x, top: f.y }}>
          <Fan
            frame={frame}
            size={f.size}
            color={f.color}
            rotate={f.rotate}
            blades={f.blades}
            delay={f.delay ?? 6}
          />
        </div>
      ))}

      {strokes.map((st, i) => (
        <div key={`s${i}`} style={{ position: 'absolute', left: st.x, top: st.y }}>
          <Stroke
            frame={frame}
            size={st.size}
            color={st.color}
            rotate={st.rotate}
            delay={st.delay ?? 8}
          />
        </div>
      ))}

      {children}
    </AbsoluteFill>
  );
};

/** Máscara arredondada que recorta o conteúdo no formato do cartão branco. */
export const CardClip: React.FC<{
  children: React.ReactNode;
  inset?: [number, number];
  radius?: number;
}> = ({ children, inset = [52, 52], radius = 58 }) => (
  <div
    style={{
      position: 'absolute',
      inset: `${inset[0]}px ${inset[1]}px`,
      borderRadius: radius,
      overflow: 'hidden',
    }}
  >
    {/* Camada interna em coordenadas absolutas do quadro (1080x1920), para que
        as posições das cenas correspondam diretamente às artes de referência. */}
    <div
      style={{
        position: 'absolute',
        left: -inset[1],
        top: -inset[0],
        width: 1080,
        height: 1920,
      }}
    >
      {children}
    </div>
  </div>
);
