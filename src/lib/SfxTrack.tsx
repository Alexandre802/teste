import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { Cue, MASTER_SFX_VOLUME, SFX } from "../config/sfx";

/**
 * Toca uma lista de cues de efeito sonoro.
 * Dentro de uma cena os frames são relativos à cena; na trilha global,
 * absolutos.
 */
export const SfxTrack: React.FC<{ cues: Cue[]; gain?: number }> = ({ cues, gain = 1 }) => {
  return (
    <>
      {cues.map((c, i) => {
        const def = SFX[c.name];
        const from = Math.max(0, Math.round(c.at));
        return (
          <Sequence
            key={`${c.name}-${i}-${from}`}
            from={from}
            layout="none"
            name={`sfx:${c.name}`}
          >
            <Audio
              src={staticFile(`audio/sfx/${def.file}`)}
              volume={def.volume * (c.gain ?? 1) * gain * MASTER_SFX_VOLUME}
              playbackRate={c.rate ?? 1}
            />
          </Sequence>
        );
      })}
    </>
  );
};
