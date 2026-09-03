import { interpolate, spring } from 'remotion';

export const FPS = 30;
/** 120 BPM: um acento a cada 0,5s = 15 quadros. É a grade da referência. */
export const BEAT = 15;
/** Converte um índice de tempo musical em quadros. */
export const beat = (n: number) => Math.round(n * BEAT);

/**
 * Entrada com passagem além do ponto final e retorno, medida na referência:
 * o elemento ultrapassa a marca e assenta em ~0,4s.
 */
export const overshoot = (frame: number, start: number, durInBeats = 1.2) =>
  spring({
    frame: frame - start,
    fps: FPS,
    durationInFrames: beat(durInBeats),
    config: { damping: 12, mass: 0.7, stiffness: 120 },
  });

/** Rampa linear com corte nas pontas, para opacidade. */
export const fade = (frame: number, start: number, durInBeats = 0.5) =>
  interpolate(frame, [start, start + beat(durInBeats)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Saída: some pouco antes da virada para o flash não pegar o elemento cheio. */
export const fadeOut = (frame: number, end: number, durInBeats = 0.5) =>
  interpolate(frame, [end - beat(durInBeats), end], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Pulso contínuo travado no tempo musical (para brilhos e rotas). */
export const pulse = (frame: number, beatsPerCycle = 2) =>
  0.5 + 0.5 * Math.sin((frame / (BEAT * beatsPerCycle)) * Math.PI * 2);
