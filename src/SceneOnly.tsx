import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneId, sceneById } from "./config/timeline";
import { SCENE_COMPONENTS } from "./scenes";

/** Renderiza uma cena isolada (útil para revisar/ajustar layout e timing). */
export const SceneOnly: React.FC<{ id: SceneId }> = ({ id }) => {
  const slot = sceneById(id);
  const Cmp = SCENE_COMPONENTS[id];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Cmp duration={slot.duration} />
    </AbsoluteFill>
  );
};
