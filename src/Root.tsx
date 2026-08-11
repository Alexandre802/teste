import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH } from "./config/timeline";
import { ConsulTechVideo } from "./Video";
import { SceneOnly } from "./SceneOnly";
import "./lib/fonts";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* vídeo final 9:16 */}
      <Composition
        id="ConsulTechReel"
        component={ConsulTechVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {/* uma composição por cena, para revisar/ajustar cada tela isoladamente */}
      {SCENES.map((s) => (
        <Composition
          key={s.id}
          id={`scene-${s.index + 1}-${s.id}`}
          component={SceneOnly}
          durationInFrames={s.renderDuration}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{ id: s.id }}
        />
      ))}
    </>
  );
};
