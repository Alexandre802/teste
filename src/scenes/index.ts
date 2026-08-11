import React from "react";
import { SceneId } from "../config/timeline";
import { Cue } from "../config/sfx";
import { Scene1Oportunidades, scene1Cues } from "./Scene1Oportunidades";
import { Scene2EoPior, scene2Cues } from "./Scene2EoPior";
import { Scene3PrecisaConsultar, scene3Cues } from "./Scene3PrecisaConsultar";
import { Scene4CemMais, scene4Cues } from "./Scene4CemMais";
import { Scene5PagueSo, scene5Cues } from "./Scene5PagueSo";

export const SCENE_COMPONENTS: Record<SceneId, React.FC<{ duration: number }>> = {
  oportunidades: Scene1Oportunidades,
  eoPior: Scene2EoPior,
  precisaConsultar: Scene3PrecisaConsultar,
  cemMais: Scene4CemMais,
  pagueSo: Scene5PagueSo,
};

export const SCENE_CUES: Record<SceneId, Cue[]> = {
  oportunidades: scene1Cues,
  eoPior: scene2Cues,
  precisaConsultar: scene3Cues,
  cemMais: scene4Cues,
  pagueSo: scene5Cues,
};
