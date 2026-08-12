import React from 'react';
import { AbsoluteFill, Composition } from 'remotion';
import { WaatzoVideo } from './Video';
import { SCENES, FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from './timeline';
import { SCENE_COMPONENTS } from './scenes';
import { SceneShell } from './components/SceneShell';
import { COLORS } from './theme';
import { loadFonts } from './lib/fonts';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="WaatzoReel"
      component={WaatzoVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />

    {/* Cada cena isolada — facilita ajustar timing e revisar uma parte só. */}
    {SCENES.map((scene, i) => {
      const Comp = SCENE_COMPONENTS[i];
      const Solo: React.FC = () => (
        <AbsoluteFill style={{ background: COLORS.pageBg }}>
          <SceneShell
            enterLen={Math.max(10, scene.overlap)}
            exitLen={0}
            dur={scene.dur}
            transition={scene.transition}
          >
            <Comp />
          </SceneShell>
        </AbsoluteFill>
      );
      return (
        <Composition
          key={scene.id}
          id={scene.id}
          component={Solo}
          durationInFrames={scene.dur}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      );
    })}
  </>
);
