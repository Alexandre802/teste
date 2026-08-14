import React from 'react';
import { AbsoluteFill } from 'remotion';
import './fonts';
import { SCENE_SECONDS, SceneId, sec } from './config/timeline';

import { S01Hook } from './scenes/S01Hook';
import { S02Nao } from './scenes/S02Nao';
import { S03Caos } from './scenes/S03Caos';
import { S04Dinheiro } from './scenes/S04Dinheiro';
import { S05Enxergar } from './scenes/S05Enxergar';
import { S06Quanto } from './scenes/S06Quanto';
import { S07Prever } from './scenes/S07Prever';
import { S08Nasceu } from './scenes/S08Nasceu';
import { S09Phone } from './scenes/S09Phone';
import { S10Periodo } from './scenes/S10Periodo';
import { S11TudoUm } from './scenes/S11TudoUm';
import { S12Operacao } from './scenes/S12Operacao';
import { S13Previsao } from './scenes/S13Previsao';
import { S14Cta } from './scenes/S14Cta';

const MAP: Record<SceneId, React.FC<{ total: number }>> = {
  s01Hook: S01Hook,
  s02Nao: S02Nao,
  s03Caos: S03Caos,
  s04Dinheiro: S04Dinheiro,
  s05Enxergar: S05Enxergar,
  s06Quanto: S06Quanto,
  s07Prever: S07Prever,
  s08Nasceu: S08Nasceu,
  s09Phone: S09Phone,
  s10Periodo: S10Periodo,
  s11TudoUm: S11TudoUm,
  s12Operacao: S12Operacao,
  s13Previsao: S13Previsao,
  s14Cta: S14Cta,
};

/** Renderiza uma cena isolada — usado nas composições de inspeção. */
export const SceneLab: React.FC<{ id: SceneId }> = ({ id }) => {
  const Comp = MAP[id];
  return (
    <AbsoluteFill>
      <Comp total={sec(SCENE_SECONDS[id])} />
    </AbsoluteFill>
  );
};
