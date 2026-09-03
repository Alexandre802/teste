import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { cues } from '../config/sfx';

/**
 * Trilha de efeitos. Cada disparo entra numa Sequence própria a partir do
 * quadro do cue, então o som cai exatamente no quadro do gesto que ele
 * acompanha — e a grade de 15 quadros mantém tudo no tempo musical.
 */
export const SfxTrack: React.FC = () => (
  <>
    {cues.map((c, i) => (
      <Sequence key={`${c.sound}-${c.at}-${i}`} from={c.at} durationInFrames={150} name={`sfx:${c.sound}`}>
        <Audio src={staticFile(`sfx/${c.sound}.wav`)} volume={c.volume ?? 0.8} />
      </Sequence>
    ))}
  </>
);
