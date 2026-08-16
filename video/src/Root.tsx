import React from "react";
import { Composition } from "remotion";
import { NubankReels } from "./Video";
import { TOTAL_FRAMES } from "./config/timeline";
import { VIDEO } from "./config/theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="NubankReels"
    component={NubankReels}
    durationInFrames={TOTAL_FRAMES}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
