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
  /** repete o brilho a cada N frames (luz correndo pelos fios) */
  sweepLoop?: number;
  /**
   * Revela o elemento progressivamente, como se estivesse sendo desenhado.
   * 'right' varre da esquerda para a direita — é o que faz uma linha de
   * gráfico "crescer" usando os pixels da própria arte.
   */
  wipe?: 'up' | 'down' | 'left' | 'right';
  wipeDur?: number;
  /** deslocamento radial na entrada (a partir do centro da tela) */
  radial?: number;
  /** deriva contínua com tombo — para elementos soltos, como as cédulas */
  orbit?: { rx?: number; ry?: number; spin?: number; speed?: number };
  /** o número sobe para o lugar como um contador assentando */
  roll?: boolean;
  rollDur?: number;
  /** rotação contínua, em graus por frame */
  spin?: number;
  zIndex?: number;
};

/** Recorte progressivo na direção pedida — o elemento "se desenha". */
const wipeInset = (
  frame: number,
  delay: number,
  dur: number,
  dir: 'up' | 'down' | 'left' | 'right',
) => {
  const q = (1 - prog(frame, delay, dur, EASE.inOut)) * 100;
  return dir === 'right'
    ? `inset(0 ${q}% 0 0)`
    : dir === 'left'
      ? `inset(0 0 0 ${q}%)`
      : dir === 'up'
        ? `inset(${q}% 0 0 0)`
        : `inset(0 0 ${q}% 0)`;
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
    sweepLoop,
    wipe,
    wipeDur = 26,
    radial = 0,
    orbit,
    roll = false,
    rollDur = 22,
    spin = 0,
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

  // deriva contínua com tombo (cédulas voando)
  const sp = orbit?.speed ?? 0.012;
  const ox = orbit ? Math.sin(frame * sp + phase) * (orbit.rx ?? 20) : 0;
  const oy = orbit ? Math.cos(frame * sp * 0.78 + phase) * (orbit.ry ?? 14) : 0;
  const tumble = orbit ? Math.sin(frame * sp * 0.62 + phase) * (orbit.spin ?? 6) : 0;

  // entrada radial: o elemento chega de fora, na direção do centro da tela
  const cx = geom.x + geom.w / 2;
  const cy = geom.y + geom.h / 2;
  const len = Math.hypot(cx - 540, cy - 960) || 1;
  const rx = radial ? ((cx - 540) / len) * radial * (1 - s) : 0;
  const ry = radial ? ((cy - 960) / len) * radial * (1 - s) : 0;
  const scaleIn = from === 'scale' ? '' : `scale(${0.965 + s * 0.035})`;
  const glowP = glow ? prog(frame, delay + 14, 26) : 0;
  const pulse = glow ? 0.7 + 0.3 * Math.sin(frame * 0.055 + phase) : 0;

  // rolagem do número: sobe de baixo, esticado e borrado, e assenta
  const rp = prog(frame, delay, rollDur, EASE.out);
  const rpf = prog(frame, delay, rollDur * 0.5, EASE.out);

  const sweep =
    sweepAt === undefined
      ? null
      : sweepLoop
        ? // brilho que volta a passar a cada ciclo
          tween(
            Math.max(0, frame - sweepAt) % sweepLoop,
            [0, Math.min(38, sweepLoop)],
            [-40, 140],
            EASE.inOut,
          )
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
        transform: `${move} ${scaleIn} translate3d(${ox + rx}px, ${drift + oy + ry}px, 0) rotate(${(1 - s) * rotate + tumble + frame * spin}deg)`,
        overflow: roll ? 'hidden' : undefined,
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
          clipPath: wipe ? wipeInset(frame, delay, wipeDur, wipe) : undefined,
          transform: roll
            ? `translateY(${(1 - rp) * 118}%) scaleY(${1 + (1 - rpf) * 0.5})`
            : undefined,
          filter: roll && rpf < 0.999 ? `blur(${(1 - rpf) * 7}px)` : undefined,
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
