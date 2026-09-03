import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SCENES, SCENE_SCALE, SCENE_SPANS } from './timeline';
import { SCENE_COMPONENTS } from './scenes';
import { SceneShell, TRANSITION_SFX } from './components/SceneShell';
import { Sfx } from './components/Sfx';
import { SceneTiming } from './lib/timing';
import { COLORS } from './theme';
import { loadFonts } from './lib/fonts';

loadFonts();

/**
 * Montagem principal.
 *
 * Cada bloco começa exatamente no frame em que a frase correspondente começa
 * na narração de referência (ver `SCENES` em timeline.ts). A cena anterior
 * segue visível por mais alguns frames (`hold`) para a transição cruzar.
 */
export const WaatzoVideo: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.pageBg }}>
    {SCENES.map((scene, i) => {
      const Comp = SCENE_COMPONENTS[scene.scene];
      const { start, dur } = SCENE_SPANS[i];
      const next = SCENES[i + 1];
      return (
        <Sequence key={scene.id} from={start} durationInFrames={dur} name={scene.id}>
          <SceneTiming scale={SCENE_SCALE[i]} variant={scene.variant ?? 0}>
            <SceneShell
              enterLen={i === 0 ? 16 : 12}
              exitLen={scene.hold}
              dur={dur}
              transition={scene.transition}
              nextTransition={next?.transition}
            >
              <Comp />
            </SceneShell>
          </SceneTiming>
        </Sequence>
      );
    })}

    {/* Efeitos das transições, em frames absolutos (permitem antecipação) */}
    {SCENES.map((scene, i) =>
      i === 0
        ? null
        : TRANSITION_SFX[scene.transition].map((cue, k) => (
            <Sfx
              key={`${scene.id}-${k}`}
              name={cue.name}
              at={scene.at + cue.at}
              gain={cue.gain}
            />
          )),
    )}
  </AbsoluteFill>
);
