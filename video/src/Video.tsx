import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Flash, FxDefs, Grain, RgbSplit, ScenePush, splitAmount } from './components/Fx';
import { HudFrame, SceneMark, Sweep, Ticker } from './components/Hud';
import { SfxTrack } from './components/Sfx';
import { scenes } from './config/timeline';
import { theme } from './config/theme';
import { ensureFonts } from './fonts';
import { S1VoceVende } from './scenes/S1VoceVende';
import { S2Operacao } from './scenes/S2Operacao';
import { S3Escala } from './scenes/S3Escala';
import { S4Urgencia } from './scenes/S4Urgencia';
import { S5Promessa } from './scenes/S5Promessa';
import { S6Confianca } from './scenes/S6Confianca';
import { S7Assinatura } from './scenes/S7Assinatura';

const SCENE_MAP = {
  s1: S1VoceVende,
  s2: S2Operacao,
  s3: S3Escala,
  s4: S4Urgencia,
  s5: S5Promessa,
  s6: S6Confianca,
  s7: S7Assinatura,
} as const;

/** As viradas ficam nos limites de cena — nunca fora da grade de 15 quadros. */
const boundaries = scenes.slice(1).map((s) => s.from);

export const TresEstrelas: React.FC = () => {
  ensureFonts();
  const frame = useCurrentFrame();
  const split = splitAmount(frame, boundaries);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.navy }}>
      <FxDefs />

      <RgbSplit amount={split}>
        <AbsoluteFill>
          {scenes.map((s, i) => {
            const Comp = SCENE_MAP[s.id];
            return (
              <Sequence key={s.id} from={s.from} durationInFrames={s.duration} name={s.id}>
                <ScenePush duration={s.duration} dir={i % 2 === 0 ? 1 : -1}>
                  <Comp duration={s.duration} />
                </ScenePush>
              </Sequence>
            );
          })}
        </AbsoluteFill>
      </RgbSplit>

      {boundaries.map((b) => <Sweep key={`sw-${b}`} at={b} />)}
      {boundaries.map((b) => <Flash key={b} at={b} />)}

      <HudFrame />
      <Ticker />
      <SceneMark />
      <Grain />

      <SfxTrack />
    </AbsoluteFill>
  );
};
