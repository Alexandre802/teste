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
import { S15Clareza } from './scenes/S15Clareza';

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
  s15Clareza: S15Clareza,
};

/**
 * A cena que sai continua alguns frames na tela, encolhendo e borrando,
 * enquanto a que entra chega ampliada e desfocada por cima. É esse par
 * (punch out / punch in) que dá o corte seco e dinâmico da referência.
 */
const OVERLAP = 12;
const ENTER = 11;

const SceneEnter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const p = tween(frame, [0, ENTER], [0, 1], EASE.out);
  const pf = tween(frame, [0, ENTER * 0.62], [0, 1], EASE.out);
  return (
    <AbsoluteFill
      style={{
        opacity: pf,
        transform: `scale(${1.3 - p * 0.3})`,
        filter: pf < 0.999 ? `blur(${(1 - pf) * 30}px)` : undefined,
        transformOrigin: 'center center',
        willChange: 'transform, filter',
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
