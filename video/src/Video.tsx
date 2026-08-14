import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import './fonts';
import { tween } from './components/anim';
import { COLORS, EASE } from './config/theme';
import {
  SCENE_ORDER,
  SCENE_SECONDS,
  SCENE_START,
  SceneId,
  sec,
} from './config/timeline';

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

const SCENES: Record<SceneId, React.FC<{ total: number }>> = {
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

/**
 * A cena que sai continua na tela por mais alguns frames enquanto a que entra
 * aparece por cima — é isso que transforma o corte em uma dissolução com
 * empurrão de câmera, em vez de um quadro vazio entre as duas.
 */
const OVERLAP = 12;
const ENTER = 10;

/** Entrada da cena: aplicada por fora, cobre inclusive o fundo. */
const SceneEnter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const p = tween(frame, [0, ENTER], [0, 1], EASE.out);
  return (
    <AbsoluteFill
      style={{
        opacity: p,
        transform: `scale(${1.045 - p * 0.045})`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const MonttraReel: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bgWarm }}>
    {SCENE_ORDER.map((id) => {
      const Comp = SCENES[id];
      const total = sec(SCENE_SECONDS[id]);
      return (
        <Sequence
          key={id}
          from={SCENE_START[id]}
          durationInFrames={total + OVERLAP}
          name={id}
        >
          <SceneEnter>
            <Comp total={total} />
          </SceneEnter>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
