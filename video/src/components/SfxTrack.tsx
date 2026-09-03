import type { FC } from "react";
import { Audio, Sequence, staticFile } from "remotion";
import type { SfxCue } from "../config/scenes";

/**
 * Dispara cada efeito sonoro no frame relativo declarado em `scenes.ts`.
 * Um Sequence por cue, para que o audio comece exatamente no frame pedido.
 */
export const SfxTrack: FC<{ cues: SfxCue[]; gain?: number }> = ({ cues, gain = 1 }) => (
  <>
    {cues.map((cue, i) => (
      <Sequence
        key={`${cue.s}-${cue.at}-${i}`}
        from={Math.max(0, Math.round(cue.at))}
        layout="none"
        name={`sfx ${cue.s}`}
      >
        <Audio src={staticFile(`sfx/${cue.s}.wav`)} volume={(cue.v ?? 0.45) * gain} />
      </Sequence>
    ))}
  </>
);
