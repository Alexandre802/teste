import type { FC } from "react";
import { AbsoluteFill, Composition } from "remotion";
import { MonttraReel } from "./MonttraReel";
import { Fonts } from "./components/Fonts";
import { SCENES, TOTAL_DURATION } from "./config/scenes";
import { SCENE_COMPONENTS } from "./scenes";
import { VIDEO } from "./config/theme";

/** Wrapper para pré-visualizar uma cena isolada durante o desenvolvimento. */
const Solo: FC<{ id: string }> = ({ id }) => {
  const cfg = SCENES.find((s) => s.id === id);
  const Comp = cfg ? SCENE_COMPONENTS[cfg.id] : undefined;
  if (!cfg || !Comp) return <AbsoluteFill />;
  return (
    <AbsoluteFill>
      <Fonts />
      <Comp cfg={cfg} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: FC = () => (
  <>
    <Composition
      id="MonttraReel"
      component={MonttraReel}
      durationInFrames={Math.max(
        1,
        SCENES.filter((s) => SCENE_COMPONENTS[s.id]).reduce((a, s) => a + s.durationInFrames, 0) -
          SCENES.filter((s) => SCENE_COMPONENTS[s.id]).slice(0, -1).reduce(
            (a, s) => a + s.transition.durationInFrames,
            0,
          ),
      )}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{}}
    />

    {SCENES.map((s) => (
      <Composition
        key={s.id}
        id={`Solo-${s.id}`}
        component={Solo}
        durationInFrames={s.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{ id: s.id }}
      />
    ))}
  </>
);

/** Exportado para conferência: duração final do reel quando as 10 cenas existem. */
export const FULL_DURATION = TOTAL_DURATION;
