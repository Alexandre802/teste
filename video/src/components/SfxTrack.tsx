/**
 * Trilha de efeitos sonoros.
 *
 * As marcações vivem em config/timeline.ts (por cena, em segundos).
 * Aqui elas viram frames absolutos, então um som disparado no fim de
 * uma cena continua tocando por cima da próxima, sem corte.
 */
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { SCENES, SCENE_STARTS, sec } from "../config/timeline";

export const SfxTrack: React.FC<{ masterVolume?: number }> = ({ masterVolume = 1 }) => (
  <>
    {SCENES.flatMap((scene, si) =>
      scene.sfx.map((cue, ci) => {
        const from = SCENE_STARTS[si] + sec(cue.at);
        return (
          <Sequence
            key={`${scene.id}-${ci}`}
            from={from}
            name={`sfx:${cue.sound}`}
            layout="none"
          >
            <Audio
              src={staticFile(`sfx/${cue.sound}.wav`)}
              volume={(cue.volume ?? 0.7) * masterVolume}
            />
          </Sequence>
        );
      }),
    )}
  </>
);
