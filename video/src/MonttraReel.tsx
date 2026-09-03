import type { FC, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { Fonts } from "./components/Fonts";
import { SCENES } from "./config/scenes";
import { SCENE_COMPONENTS } from "./scenes";
import { presentationFor } from "./transitions";
import { COLORS } from "./config/theme";

/** Reel completo: cenas encadeadas por TransitionSeries. */
export const MonttraReel: FC = () => {
  const active = SCENES.filter((s) => SCENE_COMPONENTS[s.id]);
  const children: ReactNode[] = [];

  active.forEach((scene, i) => {
    const Comp = SCENE_COMPONENTS[scene.id];
    children.push(
      <TransitionSeries.Sequence key={`${scene.id}-seq`} durationInFrames={scene.durationInFrames}>
        <Comp cfg={scene} />
      </TransitionSeries.Sequence>,
    );
    if (i < active.length - 1) {
      children.push(
        <TransitionSeries.Transition
          key={`${scene.id}-tr`}
          presentation={presentationFor(scene.transition.kind)}
          timing={linearTiming({ durationInFrames: scene.transition.durationInFrames })}
        />,
      );
    }
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Fonts />
      <TransitionSeries>{children}</TransitionSeries>
    </AbsoluteFill>
  );
};
