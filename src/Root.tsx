import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./config";
import { TresEstrelasVideo } from "./Video";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TresEstrelas"
    component={TresEstrelasVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
