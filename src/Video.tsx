import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { NARRATION_VOLUME, SCENES, TOTAL_FRAMES, TRANSITION_FRAMES } from "./config/timeline";
import { Cue, cue } from "./config/sfx";
import { EASE, ip } from "./lib/anim";
import { FONT_WEIGHTS_PROBE, fontFamily } from "./lib/fonts";
import { SfxTrack } from "./lib/SfxTrack";
import { SCENE_COMPONENTS } from "./scenes";

/**
 * Mantém os 5 pesos da Poppins em uso desde o frame 0, para nenhum frame ser
 * pintado com fonte de fallback.
 */
const FontProbe: React.FC = () => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      left: -9999,
      top: -9999,
      opacity: 0,
      pointerEvents: "none",
    }}
  >
    {FONT_WEIGHTS_PROBE.map((w) => (
      <span key={w} style={{ fontFamily, fontWeight: w }}>
        ConsulTech 1.248 98,7%
      </span>
    ))}
  </div>
);

/**
 * Efeitos sonoros da trilha global (transições entre cenas) — em frames
 * absolutos, para poderem atravessar o corte.
 */
const transitionCues: Cue[] = SCENES.slice(1).flatMap((s) => [
  cue(s.from - 14, "reverse", 0.75),
  cue(s.from - 4, "whooshBig", 1),
  cue(s.from, "bass", 0.9),
]);

const globalCues: Cue[] = [
  ...transitionCues,
  // sting final de marca
  cue(TOTAL_FRAMES - 62, "sting", 1),
];

export const ConsulTechVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // pequena atenuação da narração nos impactos de transição não é necessária:
  // os cortes caem em pausas da locução (ver config/speechMap.ts).
  const fadeOut = ip(frame, [TOTAL_FRAMES - 10, TOTAL_FRAMES], [1, 0], EASE.in);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontProbe />

      {/* narração */}
      <Audio src={staticFile("audio/narration.mp3")} volume={NARRATION_VOLUME} />

      {/* efeitos das transições */}
      <SfxTrack cues={globalCues} />

      {/* cenas */}
      {SCENES.map((s) => {
        const Cmp = SCENE_COMPONENTS[s.id];
        return (
          <Sequence
            key={s.id}
            from={s.from}
            durationInFrames={s.renderDuration}
            name={s.label}
            style={{ zIndex: s.index + 1 }}
          >
            <Cmp duration={s.duration} />
          </Sequence>
        );
      })}

      {/* fade final */}
      <AbsoluteFill
        style={{ background: "#000", opacity: 1 - fadeOut, zIndex: 99, pointerEvents: "none" }}
      />
    </AbsoluteFill>
  );
};

export { TRANSITION_FRAMES };
