import React from 'react';
import { Composition } from 'remotion';
import { FPS } from './config/beat';
import { TOTAL_FRAMES } from './config/timeline';
import { TresEstrelas } from './Video';

/** Vertical 9:16, 1080×1920 — formato de reels/stories. */
export const RemotionRoot: React.FC = () => (
  <Composition
    id="TresEstrelas"
    component={TresEstrelas}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
