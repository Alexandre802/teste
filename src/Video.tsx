/**
 * Montagem final: as seis cenas em sequencia, com sobreposicao de OVERLAP
 * quadros. A cena que entra cobre a que sai, e a propria entrada dela
 * (deslize / escala) e a transicao - fluida, sem corte seco.
 */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import {
  OVERLAP,
  SCENES,
  SCENE_STARTS,
  type SceneConfig,
} from "./config";
import { ramp } from "./lib/anim";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";

const IMPL = { s1: Scene1, s2: Scene2, s3: Scene3, s4: Scene4, s5: Scene5, s6: Scene6 };

/** Como cada cena entra em quadro durante a sobreposicao. */
const entry = (cfg: SceneConfig, p: number) => {
  if (p >= 1) return {};
  const k = 1 - p;
  const map = {
    bottom: `translate3d(0,${(k * 100).toFixed(1)}%,0)`,
    top: `translate3d(0,${(-k * 100).toFixed(1)}%,0)`,
    left: `translate3d(${(-k * 100).toFixed(1)}%,0,0)`,
    right: `translate3d(${(k * 100).toFixed(1)}%,0,0)`,
    scale: `scale(${(1.14 - 0.14 * p).toFixed(3)})`,
  } as const;
  return {
    transform: map[cfg.from],
    opacity: cfg.from === "scale" ? p : 1,
  };
};

const SceneSlot: React.FC<{ cfg: SceneConfig; index: number }> = ({ cfg, index }) => {
  const frame = useCurrentFrame();
  const Impl = IMPL[cfg.id];
  // primeira cena nao "entra": ja comeca em quadro
  const p = index === 0 ? 1 : ramp(frame, 0, OVERLAP);
  return (
    <AbsoluteFill style={{ ...entry(cfg, p), backgroundColor: "#0a1e78" }}>
      <Impl cfg={cfg} />
    </AbsoluteFill>
  );
};

export const TresEstrelasVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0a1e78" }}>
    {SCENES.map((cfg, i) => (
      <Sequence
        key={cfg.id}
        from={SCENE_STARTS[i]}
        durationInFrames={cfg.duration}
        name={`Cena ${i + 1}`}
      >
        <SceneSlot cfg={cfg} index={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
