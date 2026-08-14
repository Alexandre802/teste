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
import { COPY } from '../config/timeline';

/**
 * Cena 06 — "Quanto entrou? / Quanto saiu? / Quanto sobrou?"
 * Referência: FD6718AA-85B5-45CD-926E-4A5547E35EA5.png
 */
export const S06Quanto: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const H = 148;

  const charts = [
    { left: 34, top: 690, delay: 16 },
    { right: 96, top: 1080, delay: 34 },
    { right: 88, top: 1640, delay: 52 },
  ];

  return (
    <AbsoluteFill>
      <BgLight tone="warm" charts={false} />

      {charts.map((c, i) => (
        <MiniChart
          key={i}
          points={[
            [0, 90],
            [56, 40],
            [112, 62],
            [168, 8],
          ]}
          width={180}
          height={100}
          style={{ left: c.left, right: c.right, top: c.top }}
          color={COLORS.green}
          strokeWidth={3.5}
          progress={tween(frame, [c.delay, c.delay + 34], [0, 1])}
        />
      ))}

      <Scene total={total} zoom={0.055} driftY={-24}>
        <LogoHeader delay={0} size={78} />

        <Stack top={470} gap={104}>
          {COPY.s06.pairs.map((p, i) => (
            <div key={p.b}>
              <Line
                size={H}
                tone="ink"
                family={FONTS.sans}
                weight={800}
                tracking="-0.04em"
                lineHeight={0.94}
                delay={8 + i * 18}
              >
                {p.a}
              </Line>
              <Line
                size={H}
                tone="green"
                family={FONTS.sans}
                weight={800}
                tracking="-0.04em"
                lineHeight={0.94}
                delay={14 + i * 18}
                style={{ marginLeft: 42 }}
              >
                {p.b}
              </Line>
            </div>
          ))}
        </Stack>
      </Scene>

      <LightSweep delay={62} dur={40} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.7 },
          { name: 'whooshShort', at: 8 },
          { name: 'popUi', at: 14 },
          { name: 'whooshShort', at: 26, rate: 1.06 },
          { name: 'popUi', at: 32, rate: 1.06 },
          { name: 'whooshShort', at: 44, rate: 0.94 },
          { name: 'popUi', at: 50, rate: 0.94 },
          { name: 'bassHit', at: 50, volume: 0.7 },
          { name: 'tickMicro', at: 62 },
          { name: 'sparkleShine', at: 66, volume: 0.55 },
        ]}
      />
    </AbsoluteFill>
  );
};
