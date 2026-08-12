import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EASE, iv } from '../lib/anim';
import { useSceneFrame } from '../lib/timing';

export type CameraMove = {
  /** Frame de projeto em que a câmera chega nesta posição. */
  at: number;
  /** Zoom (1 = enquadramento cheio). */
  scale?: number;
  /** Ponto de interesse no quadro 1080x1920 — a câmera centraliza nele. */
  x?: number;
  y?: number;
  /** Inclinação sutil, em graus. */
  rotate?: number;
};

const CENTER_X = 540;
const CENTER_Y = 960;

/**
 * Movimento de câmera sobre a cena.
 *
 * Em vez de deixar a tela parada depois que tudo entrou, a câmera passeia
 * pelos elementos: aproxima do cartão que está sendo narrado, afasta para
 * mostrar o conjunto, deriva de leve o tempo todo. É o que dá sensação de
 * continuidade nos blocos mais longos.
 */
export const Camera: React.FC<{
  moves: CameraMove[];
  /** Deriva contínua somada ao movimento programado. */
  drift?: number;
  children: React.ReactNode;
}> = ({ moves, drift = 0, children }) => {
  const frame = useSceneFrame();

  const at = (i: number) => moves[i]?.at ?? 0;
  let i = 0;
  while (i < moves.length - 1 && frame >= at(i + 1)) i += 1;

  const a = moves[Math.max(0, i)];
  const b = moves[Math.min(moves.length - 1, i + 1)] ?? a;
  const t = b === a ? 1 : iv(frame, [a.at, b.at], [0, 1], EASE.inOut);

  const lerp = (p: number, q: number) => p + (q - p) * t;
  const px = lerp(a.x ?? CENTER_X, b.x ?? CENTER_X);
  const py = lerp(a.y ?? CENTER_Y, b.y ?? CENTER_Y);
  const rot = lerp(a.rotate ?? 0, b.rotate ?? 0);

  // Com um zoom s, o quadro só cobre a tela enquanto o alvo ficar dentro de
  // [960/s, 1920-960/s] na vertical (e análogo na horizontal). Em vez de
  // inflar o zoom, o alvo é limitado: a câmera vai até onde dá sem mostrar
  // borda vazia.
  const scale = Math.max(1, lerp(a.scale ?? 1, b.scale ?? 1));
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const halfH = CENTER_Y / scale;
  const halfW = CENTER_X / scale;
  const cy = clamp(py, halfH, 1920 - halfH);
  const cx = clamp(px, halfW, 1080 - halfW);

  // Deriva lenta e contínua, para nunca ficar totalmente estático.
  const dx = drift ? Math.sin(frame / 96) * drift : 0;
  const dy = drift ? Math.cos(frame / 124) * drift * 0.7 : 0;

  const tx = (CENTER_X - cx) * scale + dx;
  const ty = (CENTER_Y - cy) * scale + dy;

  return (
    <AbsoluteFill
      style={{
        transform: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${rot.toFixed(3)}deg)`,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Destaque de um item durante a passagem da câmera: o item focado cresce um
 * pouco e os demais recuam. Recebe o índice focado no momento.
 */
export const useFocus = (
  ranges: { from: number; to: number }[],
  frame: number,
) => {
  const active = ranges.findIndex((r) => frame >= r.from && frame < r.to);
  return (index: number) => {
    if (active === -1) return { scale: 1, opacity: 1 };
    if (index === active) return { scale: 1.045, opacity: 1 };
    return { scale: 0.975, opacity: 0.55 };
  };
};
