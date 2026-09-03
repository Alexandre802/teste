import React from 'react';
import { Composition } from 'remotion';
import { MonttraReel } from './Video';
import { SceneLab } from './SceneLab';
import {
  FPS,
  HEIGHT,
  SCENE_ORDER,
  SCENE_SECONDS,
  TOTAL_FRAMES,
  WIDTH,
  sec,
} from './config/timeline';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="MonttraReel"
      component={MonttraReel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    {/* Composições isoladas por cena — facilitam ajustar timing e layout. */}
    {SCENE_ORDER.map((id) => (
      <Composition
        key={id}
        id={`Scene-${id}`}
        component={SceneLab}
        durationInFrames={sec(SCENE_SECONDS[id])}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ id }}
      />
    ))}
  </>
);
