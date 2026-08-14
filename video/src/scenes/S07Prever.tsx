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
 * Cena 07 — "E mais importante: quanto vai fechar na próxima semana?"
 * Referência: DD7785A5-981F-4EB7-A382-9925D6A4CD70.png
 */
export const S07Prever: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const H = 118;

  return (
    <AbsoluteFill>
      <BgLight tone="warm" charts={false} />

      <MiniChart
        points={[
          [0, 70],
          [70, 66],
          [130, 26],
          [186, 40],
          [238, 4],
        ]}
        width={250}
        height={84}
        style={{ right: 150, top: 786 }}
        color={COLORS.greenDeep}
        strokeWidth={3.4}
        nodes={false}
        progress={tween(frame, [22, 62], [0, 1])}
      />
      <MiniChart
        points={[
          [0, 56],
          [52, 20],
          [96, 34],
          [140, 2],
        ]}
        width={150}
        height={64}
        style={{ left: 74, top: 1560 }}
        color={COLORS.greenDeep}
        strokeWidth={3.4}
        nodes={false}
        progress={tween(frame, [46, 82], [0, 1])}
      />

      <Scene total={total} zoom={0.05} driftY={-20}>
        <LogoHeader delay={0} size={78} />

        <Stack top={560}>
          <Line size={H} tone="ink" weight={800} tracking="-0.04em" delay={4}>
            E mais
          </Line>
          <Line size={H} tone="green" weight={800} tracking="-0.04em" delay={11}>
            importante:
          </Line>

          <div style={{ height: 26 }} />

          <Line
            size={H * 0.70}
            tone="ink"
            weight={800}
            tracking="-0.035em"
            delay={26}
          >
            Quanto vai fechar
          </Line>

          <div style={{ height: 22 }} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 26 }}>
            <Line size={H * 0.86} tone="ink" weight={800} tracking="-0.04em" delay={38}>
              na
            </Line>
            <Line size={H} tone="green" weight={800} tracking="-0.04em" delay={44}>
              próxima
            </Line>
          </div>
          <Line size={H} tone="green" weight={800} tracking="-0.04em" delay={52}>
            semana?
          </Line>
        </Stack>
      </Scene>

      <LightSweep delay={58} dur={38} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.72 },
          { name: 'whooshShort', at: 4 },
          { name: 'popUi', at: 11 },
          { name: 'swipeFast', at: 26 },
          { name: 'popSoft', at: 38 },
          { name: 'whooshShort', at: 44, rate: 1.08 },
          { name: 'impactHit', at: 52, volume: 0.85 },
          { name: 'notificationPop', at: 62, volume: 0.7 },
        ]}
      />
    </AbsoluteFill>
  );
};
