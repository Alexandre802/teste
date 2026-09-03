import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE, iv, p, s, SPRING } from '../lib/anim';
import { TransitionKind } from '../timeline';
import { SfxName } from './Sfx';

/**
 * Efeitos que acompanham cada tipo de transição. `at` é relativo ao início da
 * cena e pode ser negativo (antecipação) — por isso são disparados na timeline
 * global, em Video.tsx, e não aqui dentro.
 */
export const TRANSITION_SFX: Record<TransitionKind, { name: SfxName; at: number; gain?: number }[]> = {
  slideUp: [{ name: 'whoosh_transition', at: -4 }, { name: 'bass_hit', at: 0, gain: 0.45 }],
  pushLeft: [
    { name: 'whoosh_transition', at: -5 },
    { name: 'swipe_fast', at: 0, gain: 0.9 },
    { name: 'impact', at: 0, gain: 0.4 },
  ],
  punchIn: [
    { name: 'reverse_whoosh', at: -12 },
    { name: 'impact', at: 0 },
    { name: 'bass_hit', at: 0, gain: 0.75 },
  ],
  zoomOut: [
    { name: 'whoosh_transition', at: -4, gain: 0.95 },
    { name: 'sub_boom', at: 1, gain: 0.6 },
  ],
  glitch: [
    { name: 'glitch', at: -2 },
    { name: 'digital_click', at: 3 },
    { name: 'impact', at: 0, gain: 0.75 },
  ],
  slideDown: [{ name: 'whoosh_transition', at: -4 }, { name: 'sub_boom', at: 0, gain: 0.4 }],
  swipeUp: [
    { name: 'whoosh_short', at: -3 },
    { name: 'swipe_fast', at: 0 },
    { name: 'bass_hit', at: 0, gain: 0.4 },
  ],
  spin: [
    { name: 'riser', at: -20 },
    { name: 'impact', at: 0 },
  ],
  flash: [{ name: 'impact', at: 0 }],
};

/** Movimento de câmera de fundo, por tipo de entrada — nunca fica parado. */
const DRIFT: Record<TransitionKind, { zoom: number; x: number; y: number }> = {
  slideUp: { zoom: 0.045, x: 0, y: -14 },
  slideDown: { zoom: 0.04, x: 0, y: 14 },
  pushLeft: { zoom: 0.05, x: -18, y: 0 },
  punchIn: { zoom: -0.035, x: 0, y: 10 },
  zoomOut: { zoom: 0.055, x: 10, y: -10 },
  glitch: { zoom: 0.045, x: -12, y: 8 },
  swipeUp: { zoom: 0.05, x: 0, y: -16 },
  spin: { zoom: 0.05, x: 14, y: 10 },
  flash: { zoom: 0.04, x: 0, y: 0 },
};

type ShellProps = {
  /** Frames de entrada. */
  enterLen: number;
  /** Frames de saída no fim da cena (o hold configurado na timeline). */
  exitLen: number;
  dur: number;
  transition: TransitionKind;
  /** Transição da PRÓXIMA cena — define como esta sai. */
  nextTransition?: TransitionKind;
  children: React.ReactNode;
};

/**
 * Envelope de cena: transição de entrada, saída e uma deriva de câmera
 * contínua por baixo de tudo, para que nenhum trecho fique estático.
 */
export const SceneShell: React.FC<ShellProps> = ({
  enterLen,
  exitLen,
  dur,
  transition,
  nextTransition,
  children,
}) => {
  const frame = useCurrentFrame();
  const el = Math.max(6, enterLen);
  const tin = p(frame, 0, el, EASE.out);
  const springIn = s(frame, { config: SPRING.snap, durationInFrames: Math.max(10, el) });
  const tout = exitLen > 0 ? p(frame, dur - exitLen, dur, EASE.in) : 0;

  let transform = '';
  let opacity = 1;
  let filter = '';

  switch (transition) {
    case 'slideUp':
      transform = `translate3d(0, ${((1 - springIn) * 100).toFixed(2)}%, 0)`;
      break;
    case 'slideDown':
      transform = `translate3d(0, ${(-(1 - springIn) * 100).toFixed(2)}%, 0)`;
      break;
    case 'pushLeft':
      transform = `translate3d(${((1 - springIn) * 100).toFixed(2)}%, 0, 0)`;
      break;
    case 'swipeUp':
      transform = `translate3d(0, ${((1 - springIn) * 76).toFixed(2)}%, 0) scale(${(0.9 + 0.1 * springIn).toFixed(4)})`;
      opacity = tin;
      break;
    case 'punchIn':
      transform = `scale(${(1.5 - 0.5 * springIn).toFixed(4)})`;
      opacity = iv(frame, [0, el * 0.5], [0, 1], EASE.out);
      filter = `blur(${((1 - tin) * 16).toFixed(2)}px)`;
      break;
    case 'zoomOut':
      transform = `scale(${(0.56 + 0.44 * springIn).toFixed(4)})`;
      opacity = iv(frame, [0, el * 0.55], [0, 1], EASE.out);
      break;
    case 'spin':
      transform = `scale(${(0.66 + 0.34 * springIn).toFixed(4)}) rotate(${(-12 * (1 - springIn)).toFixed(2)}deg)`;
      opacity = iv(frame, [0, el * 0.55], [0, 1], EASE.out);
      break;
    case 'glitch': {
      const j = frame < el ? (Math.sin(frame * 7.3) + Math.sin(frame * 13.1)) * (1 - tin) * 16 : 0;
      transform = `translate3d(${j.toFixed(2)}px, ${(j * 0.3).toFixed(2)}px, 0) scale(${(1.08 - 0.08 * tin).toFixed(4)})`;
      opacity = frame < el ? (Math.sin(frame * 5.1) > -0.75 ? tin : tin * 0.3) : 1;
      break;
    }
    case 'flash':
    default:
      opacity = tin;
      break;
  }

  // Deriva contínua: zoom lento e leve deslocamento ao longo de toda a cena.
  const dr = DRIFT[transition];
  const t = Math.min(1, frame / Math.max(1, dur));
  const camScale = 1 + dr.zoom * t;
  const camX = dr.x * t;
  const camY = dr.y * t;

  const outTransform =
    nextTransition === 'pushLeft'
      ? `translate3d(${(-18 * tout).toFixed(2)}%, 0, 0) scale(${(1 - 0.06 * tout).toFixed(4)})`
      : nextTransition === 'slideDown'
        ? `translate3d(0, ${(16 * tout).toFixed(2)}%, 0) scale(${(1 - 0.06 * tout).toFixed(4)})`
        : nextTransition === 'punchIn' || nextTransition === 'spin'
          ? `scale(${(1 - 0.16 * tout).toFixed(4)})`
          : `translate3d(0, ${(-12 * tout).toFixed(2)}%, 0) scale(${(1 - 0.05 * tout).toFixed(4)})`;

  return (
    <AbsoluteFill
      style={{
        transform: `${transform} ${outTransform}`,
        opacity: opacity * (1 - tout * 0.9),
        filter: filter || undefined,
        transformOrigin: 'center center',
        backfaceVisibility: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translate3d(${camX.toFixed(2)}px, ${camY.toFixed(2)}px, 0) scale(${camScale.toFixed(4)})`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        {children}
      </AbsoluteFill>

      {/* Clarão branco nas transições de impacto */}
      {(transition === 'punchIn' || transition === 'glitch') && frame < el ? (
        <AbsoluteFill
          style={{
            background: '#FFFFFF',
            opacity: iv(frame, [0, el * 0.5], [0.6, 0], EASE.in),
            mixBlendMode: 'screen',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
