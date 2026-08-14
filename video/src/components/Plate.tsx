import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import PLATES from '../config/plates.json';
import { EASE, SPRINGS } from '../config/theme';
import { prog, springAt, tween } from './anim';

/**
 * Cenas de interface montadas com os pixels das artes originais.
 *
 * `tools/decompose.py` recorta cada elemento da arte e gera o "plate" — a
 * mesma arte com os elementos removidos. Aqui o plate entra como fundo e
 * cada recorte volta para a sua posição exata, animado de forma
 * independente. O quadro final é idêntico à arte, pixel a pixel.
 */

export type SceneKey = keyof typeof PLATES;

export type LayerAnim = {
  id: string;
  delay?: number;
  /** direção de entrada */
  from?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  distance?: number;
  rotate?: number;
  spring?: keyof typeof SPRINGS;
  /** desfoque de entrada (px) */
  blur?: number;
  /** amplitude da flutuação contínua (px) */
  float?: number;
  /** fase da flutuação, para os elementos não subirem juntos */
  phase?: number;
  /** halo que pulsa atrás do elemento */
  glow?: string;
  /** brilho que atravessa o elemento */
  sweepAt?: number;
  /** revela de baixo para cima, como uma cortina */
  wipe?: boolean;
  zIndex?: number;
};

const Layer: React.FC<{
  scene: SceneKey;
  anim: LayerAnim;
  geom: { x: number; y: number; w: number; h: number };
}> = ({ scene, anim, geom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    id,
    delay = 0,
    from = 'up',
    distance = 90,
    rotate = 0,
    spring: springKey = 'snappy',
    blur = 16,
    float = 0,
    phase = 0,
    glow,
    sweepAt,
    wipe = false,
    zIndex,
  } = anim;

  const s = from === 'none' ? 1 : springAt(frame, fps, delay, SPRINGS[springKey]);
  const p = prog(frame, delay, 12, EASE.out);
  const off = (1 - s) * distance;

  const move =
    from === 'up'
      ? `translateY(${off}px)`
      : from === 'down'
        ? `translateY(${-off}px)`
        : from === 'left'
          ? `translateX(${-off}px)`
          : from === 'right'
            ? `translateX(${off}px)`
            : from === 'scale'
              ? `scale(${0.84 + s * 0.16})`
              : '';

  const drift = float ? Math.sin(frame * 0.021 + phase) * float : 0;
  const scaleIn = from === 'scale' ? '' : `scale(${0.965 + s * 0.035})`;
  const glowP = glow ? prog(frame, delay + 14, 26) : 0;
  const pulse = glow ? 0.7 + 0.3 * Math.sin(frame * 0.055 + phase) : 0;

  const sweep =
    sweepAt === undefined
      ? null
      : tween(frame, [sweepAt, sweepAt + 34], [-40, 140], EASE.inOut);

  return (
    <div
      style={{
        position: 'absolute',
        left: geom.x,
        top: geom.y,
        width: geom.w,
        height: geom.h,
        opacity: p,
        transform: `${move} ${scaleIn} translateY(${drift}px) rotate(${(1 - s) * rotate}deg)`,
        filter: p < 0.999 && blur ? `blur(${(1 - p) * blur}px)` : undefined,
        zIndex,
        willChange: 'transform, filter',
      }}
    >
      {glow && (
        <div
          style={{
            position: 'absolute',
            inset: '-6%',
            borderRadius: '10%',
            boxShadow: `0 0 ${70 * glowP * pulse}px ${glow}`,
            opacity: glowP,
          }}
        />
      )}
      <Img
        src={staticFile(`plates/${scene}-${id}.png`)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          clipPath: wipe
            ? `inset(${(1 - prog(frame, delay, 20, EASE.out)) * 100}% 0 0 0)`
            : undefined,
        }}
      />
      {sweep !== null && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(102deg, transparent ${sweep - 18}%, rgba(255,255,255,0.55) ${sweep}%, transparent ${sweep + 18}%)`,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

export const PlateScene: React.FC<{
  scene: SceneKey;
  layers: LayerAnim[];
  plateDelay?: number;
  children?: React.ReactNode;
}> = ({ scene, layers, plateDelay = 0, children }) => {
  const frame = useCurrentFrame();
  const cfg = PLATES[scene] as {
    plate: string;
    layers: Record<string, { x: number; y: number; w: number; h: number }>;
  };
  const p = prog(frame, plateDelay, 18, EASE.out);

  return (
    <AbsoluteFill>
      {/* O plate nao pode ter movimento proprio: qualquer transformacao
          aqui desalinharia as camadas recortadas do fundo. O avanco de
          camera fica a cargo de <Scene>, que move tudo junto. */}
      <Img
        src={staticFile(`plates/${cfg.plate}`)}
        style={{ position: 'absolute', width: 1080, height: 1920, opacity: p }}
      />
      {layers.map((a) => (
        <Layer key={a.id} scene={scene} anim={a} geom={cfg.layers[a.id]} />
      ))}
      {children}
    </AbsoluteFill>
  );
};
