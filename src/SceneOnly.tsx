import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneId, sceneById } from "./config/timeline";
import { FONT_WEIGHTS_PROBE, fontFamily } from "./lib/fonts";
import { SCENE_COMPONENTS } from "./scenes";

/** Renderiza uma cena isolada (útil para revisar/ajustar layout e timing). */
export const SceneOnly: React.FC<{ id: SceneId }> = ({ id }) => {
  const slot = sceneById(id);
  const Cmp = SCENE_COMPONENTS[id];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div aria-hidden style={{ position: "absolute", left: -9999, top: -9999, opacity: 0 }}>
        {FONT_WEIGHTS_PROBE.map((w) => (
          <span key={w} style={{ fontFamily, fontWeight: w }}>
            ConsulTech 1.248
          </span>
        ))}
      </div>
      <Cmp duration={slot.duration} />
    </AbsoluteFill>
  );
};
