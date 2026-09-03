import React from 'react';
import { AbsoluteFill, Composition } from 'remotion';
import { WaatzoVideo } from './Video';
import { SCENES, SCENE_SCALE, SCENE_SPANS, FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from './timeline';
import { SCENE_COMPONENTS } from './scenes';
import { SceneShell } from './components/SceneShell';
import { SceneTiming } from './lib/timing';
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

    {/* Cada bloco isolado — facilita ajustar timing e revisar uma parte só. */}
    {SCENES.map((scene, i) => {
      const Comp = SCENE_COMPONENTS[scene.scene];
      const { dur } = SCENE_SPANS[i];
      const Solo: React.FC = () => (
        <AbsoluteFill style={{ background: COLORS.pageBg }}>
          <SceneTiming scale={SCENE_SCALE[i]} variant={scene.variant ?? 0}>
            <SceneShell
              enterLen={12}
              exitLen={0}
              dur={dur}
              transition={scene.transition}
            >
              <Comp />
            </SceneShell>
          </SceneTiming>
        </AbsoluteFill>
      );
      return (
        <Composition
          key={scene.id}
          id={scene.id}
          component={Solo}
          durationInFrames={dur}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      );
    })}
  </>
);
