import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { MIX, SFX_MASTER } from '../timeline';

export type SfxName =
  | 'whoosh_short'
  | 'whoosh_transition'
  | 'swipe_fast'
  | 'pop_ui'
  | 'soft_pop'
  | 'bubble_pop'
  | 'digital_click'
  | 'tap'
  | 'notification_pop'
  | 'impact'
  | 'bass_hit'
  | 'sub_boom'
  | 'riser'
  | 'reverse_whoosh'
  | 'glitch'
  | 'tick'
  | 'success_chime'
  | 'sparkle'
  | 'logo_sting';

type Props = {
  name: SfxName;
  /** Frame (relativo à cena) em que o efeito dispara. */
  at: number;
  /** Multiplicador sobre o volume da família em MIX. */
  gain?: number;
  /** Recorte do início do arquivo, em frames. */
  trim?: number;
};

/**
 * Um disparo de efeito sonoro. Colocado ao lado da animação que ele sonoriza,
 * para que mexer no timing da animação e do som seja a mesma edição.
 */
export const Sfx: React.FC<Props> = ({ name, at, gain = 1, trim = 0 }) => {
  const volume = (MIX[name] ?? 0.3) * gain * SFX_MASTER;
  return (
    <Sequence from={Math.max(0, Math.round(at))} layout="none">
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} trimBefore={trim} />
    </Sequence>
  );
};

/** Vários disparos do mesmo efeito (ex.: ticks de um contador). */
export const SfxSeries: React.FC<{
  name: SfxName;
  from: number;
  count: number;
  every: number;
  gain?: number;
}> = ({ name, from, count, every, gain = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Sfx key={i} name={name} at={from + i * every} gain={gain} />
    ))}
  </>
);
