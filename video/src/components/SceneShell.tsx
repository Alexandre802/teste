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
  slideUp: [{ name: 'whoosh_transition', at: -4 }],
  pushLeft: [
    { name: 'whoosh_transition', at: -5 },
    { name: 'swipe_fast', at: 0, gain: 0.8 },
  ],
  punchIn: [
    { name: 'reverse_whoosh', at: -14 },
    { name: 'impact', at: 0 },
    { name: 'bass_hit', at: 0, gain: 0.7 },
  ],
  zoomOut: [{ name: 'whoosh_transition', at: -4, gain: 0.9 }, { name: 'sub_boom', at: 1, gain: 0.6 }],
  glitch: [
    { name: 'glitch', at: -2 },
    { name: 'digital_click', at: 3 },
    { name: 'impact', at: 0, gain: 0.7 },
  ],
  slideDown: [{ name: 'whoosh_transition', at: -4 }],
  swipeUp: [{ name: 'whoosh_short', at: -3 }, { name: 'swipe_fast', at: 0 }],
  spin: [
    { name: 'riser', at: -22 },
    { name: 'impact', at: 0 },
  ],
  flash: [{ name: 'impact', at: 0 }],
};

type ShellProps = {
  /** Frames de entrada (normalmente igual ao overlap configurado). */
  enterLen: number;
  /** Frames de saída no fim da cena. */
  exitLen: number;
  dur: number;
  transition: TransitionKind;
  /** Transição da PRÓXIMA cena — define como esta sai. */
  nextTransition?: TransitionKind;
  children: React.ReactNode;
};

/**
 * Envelope de cena: aplica a transição de entrada e a de saída sobre a cena
 * inteira, mantendo as animações internas independentes.
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
  const el = Math.max(8, enterLen);
  const tin = p(frame, 0, el, EASE.out);
  const springIn = s(frame, { config: SPRING.soft, durationInFrames: Math.max(12, el) });
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
      transform = `translate3d(0, ${((1 - springIn) * 72).toFixed(2)}%, 0) scale(${(0.92 + 0.08 * springIn).toFixed(4)})`;
      opacity = tin;
      break;
    case 'punchIn':
      transform = `scale(${(1.4 - 0.4 * springIn).toFixed(4)})`;
      opacity = iv(frame, [0, el * 0.55], [0, 1], EASE.out);
      filter = `blur(${((1 - tin) * 14).toFixed(2)}px)`;
      break;
    case 'zoomOut':
      transform = `scale(${(0.62 + 0.38 * springIn).toFixed(4)})`;
      opacity = iv(frame, [0, el * 0.6], [0, 1], EASE.out);
      break;
    case 'spin':
      transform = `scale(${(0.7 + 0.3 * springIn).toFixed(4)}) rotate(${(-10 * (1 - springIn)).toFixed(2)}deg)`;
      opacity = iv(frame, [0, el * 0.6], [0, 1], EASE.out);
      break;
    case 'glitch': {
      const j = frame < el ? (Math.sin(frame * 7.3) + Math.sin(frame * 13.1)) * (1 - tin) * 14 : 0;
      transform = `translate3d(${j.toFixed(2)}px, ${(j * 0.3).toFixed(2)}px, 0) scale(${(1.06 - 0.06 * tin).toFixed(4)})`;
      opacity = frame < el ? (Math.sin(frame * 5.1) > -0.75 ? tin : tin * 0.35) : 1;
      break;
    }
    case 'flash':
    default:
      opacity = tin;
      break;
  }

  // Saída: a cena recua levemente e some (a próxima entra por cima).
  const outTransform =
    nextTransition === 'pushLeft'
      ? `translate3d(${(-16 * tout).toFixed(2)}%, 0, 0) scale(${(1 - 0.05 * tout).toFixed(4)})`
      : nextTransition === 'slideDown'
        ? `translate3d(0, ${(14 * tout).toFixed(2)}%, 0) scale(${(1 - 0.05 * tout).toFixed(4)})`
        : nextTransition === 'punchIn' || nextTransition === 'spin'
          ? `scale(${(1 - 0.12 * tout).toFixed(4)})`
          : `translate3d(0, ${(-10 * tout).toFixed(2)}%, 0) scale(${(1 - 0.04 * tout).toFixed(4)})`;

  return (
    <AbsoluteFill
      style={{
        transform: `${transform} ${outTransform}`,
        opacity: opacity * (1 - tout * 0.85),
        filter: filter || undefined,
        transformOrigin: 'center center',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}

      {/* Clarão branco nas transições de impacto */}
      {(transition === 'punchIn' || transition === 'glitch') && frame < el ? (
        <AbsoluteFill
          style={{
            background: '#FFFFFF',
            opacity: iv(frame, [0, el * 0.5], [0.55, 0], EASE.in),
            mixBlendMode: 'screen',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
