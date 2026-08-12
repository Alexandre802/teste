import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SCENES, SCENE_STARTS } from './timeline';
import { SCENE_COMPONENTS } from './scenes';
import { SceneShell, TRANSITION_SFX } from './components/SceneShell';
import { Sfx } from './components/Sfx';
import { COLORS } from './theme';
import { loadFonts } from './lib/fonts';

loadFonts();

/**
 * Montagem principal: 10 cenas encadeadas com sobreposição, mais a trilha de
 * efeitos das transições (disparada em frames absolutos para permitir
 * antecipação — riser/reverse whoosh antes do corte).
 */
export const WaatzoVideo: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.pageBg }}>
    {SCENES.map((scene, i) => {
      const Comp = SCENE_COMPONENTS[i];
      const start = SCENE_STARTS[i];
      const next = SCENES[i + 1];
      const exitLen = next ? next.overlap : 0;
      return (
        <Sequence key={scene.id} from={start} durationInFrames={scene.dur} name={scene.id}>
          <SceneShell
            enterLen={i === 0 ? 18 : scene.overlap}
            exitLen={exitLen}
            dur={scene.dur}
            transition={scene.transition}
            nextTransition={next?.transition}
          >
            <Comp />
          </SceneShell>
        </Sequence>
      );
    })}

    {/* Efeitos das transições, em frames absolutos */}
    {SCENES.map((scene, i) =>
      i === 0
        ? null
        : TRANSITION_SFX[scene.transition].map((cue, k) => (
            <Sfx
              key={`${scene.id}-${k}`}
              name={cue.name}
              at={SCENE_STARTS[i] + cue.at}
              gain={cue.gain}
            />
          )),
    )}
  </AbsoluteFill>
);
