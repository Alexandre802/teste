import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BgLight, MiniChart } from '../components/Bg';
import { LightSweep } from '../components/Fx';
import { LogoHeader } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { Line } from '../components/Type';
import { tween } from '../components/anim';
import { COLORS, FONTS } from '../config/theme';

/**
 * Cena 04 — "Você até pode estar fazendo dinheiro..."
 * Referência: 13D31795-DBA1-44E4-A31D-899896B71D9A.png
 * A arte tem uma leve inclinação no bloco de texto — preservada aqui.
 */
export const S04Dinheiro: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const A = 106;

  return (
    <AbsoluteFill>
      <BgLight tone="warm" charts={false} />

      <MiniChart
        points={[
          [0, 96],
          [58, 44],
          [116, 60],
          [176, 6],
        ]}
        width={190}
        height={110}
        style={{ left: 96, top: 700 }}
        color={COLORS.greenPale}
        strokeWidth={4}
        progress={tween(frame, [4, 40], [0, 1])}
      />
      <MiniChart
        points={[
          [0, 92],
          [64, 40],
          [128, 62],
          [190, 4],
        ]}
        width={200}
        height={104}
        style={{ right: 62, top: 1105 }}
        color={COLORS.greenPale}
        strokeWidth={4}
        progress={tween(frame, [12, 52], [0, 1])}
      />

      <Scene total={total} zoom={0.06} driftY={-18}>
        <LogoHeader delay={0} size={78} />

        <Stack top={790} style={{ transform: 'rotate(-2.2deg)' }}>
          <Line
            size={A}
            tone="ink"
            family={FONTS.display}
            weight={400}
            tracking="-0.004em"
            lineHeight={0.92}
            delay={5}
            distance={120}
          >
            Você até pode estar
          </Line>
          <Line
            size={A}
            tone="green"
            family={FONTS.display}
            weight={400}
            tracking="-0.004em"
            lineHeight={0.92}
            delay={14}
            distance={120}
          >
            fazendo dinheiro...
          </Line>
        </Stack>
      </Scene>

      <LightSweep delay={26} dur={34} />

      <SfxTrack
        cues={[
          { name: 'reverseWhoosh', at: 0, volume: 0.7 },
          { name: 'whooshShort', at: 5 },
          { name: 'whooshShort', at: 14, rate: 0.9 },
          { name: 'bassHit', at: 14, volume: 0.7 },
          { name: 'sparkleShine', at: 30, volume: 0.6 },
          { name: 'tickMicro', at: 40 },
        ]}
      />
    </AbsoluteFill>
  );
};
