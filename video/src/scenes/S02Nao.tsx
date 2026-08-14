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
 * Cena 02 — "Não é necessariamente por causa do método."
 * Referência: 5B1C2A21-49F1-4A46-B18C-12B2F3DB636B.png (display condensado)
 */
export const S02Nao: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const A = 118; // Anton — display condensado

  return (
    <AbsoluteFill>
      <BgLight tone="warm" charts={false} />

      {/* gráficos decorativos das laterais, como na arte */}
      <MiniChart
        points={[
          [0, 120],
          [78, 66],
          [150, 84],
          [230, 8],
        ]}
        width={240}
        height={130}
        style={{ left: -14, top: 980 }}
        color={COLORS.greenPale}
        progress={tween(frame, [6, 56], [0, 1])}
      />
      <MiniChart
        points={[
          [0, 130],
          [88, 74],
          [166, 92],
          [250, 12],
        ]}
        width={260}
        height={140}
        style={{ right: 40, top: 790 }}
        color={COLORS.greenPale}
        progress={tween(frame, [14, 64], [0, 1])}
      />

      <Scene total={total} zoom={0.055} driftY={-14}>
        <LogoHeader delay={0} size={78} />

        <Stack top={700}>
          <Line
            size={A * 0.86}
            tone="ink"
            family={FONTS.display}
            weight={400}
            tracking="-0.005em"
            lineHeight={0.9}
            delay={6}
          >
            Não é
          </Line>
          <Line
            size={A}
            tone="teal"
            family={FONTS.display}
            weight={400}
            tracking="-0.008em"
            lineHeight={0.9}
            delay={14}
          >
            necessariamente
          </Line>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
            <Line
              size={A}
              tone="teal"
              family={FONTS.display}
              weight={400}
              tracking="-0.008em"
              lineHeight={0.9}
              delay={23}
            >
              por causa
            </Line>
            <Line
              size={A * 0.66}
              tone="ink"
              family={FONTS.display}
              weight={400}
              tracking="-0.005em"
              lineHeight={0.9}
              delay={31}
            >
              do método.
            </Line>
          </div>
        </Stack>
      </Scene>

      <LightSweep delay={40} dur={38} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.75 },
          { name: 'swipeFast', at: 6 },
          { name: 'swipeFast', at: 14, rate: 0.92 },
          { name: 'swipeFast', at: 23, rate: 1.1 },
          { name: 'popUi', at: 31 },
          { name: 'subBoom', at: 14, volume: 0.55 },
          { name: 'tickMicro', at: 46 },
          { name: 'tickMicro', at: 52, rate: 1.2 },
        ]}
      />
    </AbsoluteFill>
  );
};
