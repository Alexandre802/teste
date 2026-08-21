import React from 'react';
import { Composition } from 'remotion';
import { FPS } from './config/beat';
import { TOTAL_FRAMES } from './config/timeline';
import { TresEstrelas } from './Video';

/** Formato das artes: 2172×724 (3:1), o mesmo do vídeo de referência. */
export const RemotionRoot: React.FC = () => (
  <Composition
    id="TresEstrelas"
    component={TresEstrelas}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={2172}
    height={724}
  />
);
