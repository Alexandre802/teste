import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BgLight, MiniChart } from '../components/Bg';
import { Flash, LightSweep } from '../components/Fx';
import { KineticBlock } from '../components/Kinetic';
import { LogoHeader } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { tween } from '../components/anim';
import { COLORS, FONTS } from '../config/theme';

/**
 * Cena 04 (texto) — "Você até pode estar fazendo dinheiro..."
 * Referência: 13D31795-DBA1-44E4-A31D-899896B71D9A.png
 * A leve inclinação do bloco existe na arte e foi preservada.
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
        progress={tween(frame, [2, 32], [0, 1])}
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
        progress={tween(frame, [22, 54], [0, 1])}
      />

      <Scene total={total} zoom={0.095} driftY={-20} punches={[3, 19]}>
        <LogoHeader delay={0} size={78} />

        <Stack top={790} style={{ transform: 'rotate(-2.2deg)' }}>
          <KineticBlock
            size={A}
            family={FONTS.display}
            weight={400}
            tracking="-0.004em"
            lineHeight={0.92}
            step={4}
            dur={13}
            delay={3}
            rise={0.55}
            lines={[
              [
                { t: 'Você', tone: 'ink' },
                { t: 'até', tone: 'ink' },
                { t: 'pode', tone: 'ink' },
                { t: 'estar', tone: 'ink' },
              ],
              [
                { t: 'fazendo', tone: 'green' },
                { t: 'dinheiro...', tone: 'green' },
              ],
            ]}
          />
        </Stack>
      </Scene>

      <LightSweep delay={24} dur={30} />
      <Flash at={0} dur={6} max={0.34} />

      <SfxTrack
        cues={[
          { name: 'reverseWhoosh', at: 0, volume: 0.7 },
          { name: 'whooshShort', at: 3 },
          { name: 'popUi', at: 7 },
          { name: 'popUi', at: 11, rate: 1.06 },
          { name: 'popUi', at: 15, rate: 1.12 },
          { name: 'bassHit', at: 19, volume: 0.72 },
          { name: 'whooshShort', at: 19, rate: 0.9 },
          { name: 'popUi', at: 23, rate: 0.94 },
          { name: 'sparkleShine', at: 30, volume: 0.65 },
          { name: 'tickMicro', at: 40 },
        ]}
      />
    </AbsoluteFill>
  );
};
