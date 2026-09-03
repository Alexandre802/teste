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
 * Cena 02 (texto) — "Não é necessariamente por causa do método."
 * Referência: 5B1C2A21-49F1-4A46-B18C-12B2F3DB636B.png
 */
export const S02Nao: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const A = 118;

  return (
    <AbsoluteFill>
      <BgLight tone="warm" charts={false} />

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
        progress={tween(frame, [4, 44], [0, 1])}
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
        progress={tween(frame, [10, 52], [0, 1])}
      />

      <Scene total={total} zoom={0.085} driftY={-18} punches={[3, 23]}>
        <LogoHeader delay={0} size={78} />

        <Stack top={700}>
          <KineticBlock
            size={A}
            family={FONTS.display}
            weight={400}
            tracking="-0.006em"
            lineHeight={0.9}
            step={5}
            dur={13}
            delay={3}
            rise={0.5}
            lines={[
              [
                { t: 'Não', tone: 'ink', scale: 0.86 },
                { t: 'é', tone: 'ink', scale: 0.86 },
              ],
              [{ t: 'necessariamente', tone: 'teal' }],
              [
                { t: 'por', tone: 'teal' },
                { t: 'causa', tone: 'teal' },
                { t: 'do', tone: 'ink', scale: 0.66 },
                { t: 'método.', tone: 'ink', scale: 0.66 },
              ],
            ]}
          />
        </Stack>
      </Scene>

      <LightSweep delay={26} dur={32} />
      <Flash at={0} dur={6} max={0.32} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.78 },
          { name: 'swipeFast', at: 3 },
          { name: 'popUi', at: 8 },
          { name: 'whooshShort', at: 13, rate: 0.94 },
          { name: 'subBoom', at: 13, volume: 0.55 },
          { name: 'popUi', at: 18, rate: 1.06 },
          { name: 'popUi', at: 23, rate: 1.12 },
          { name: 'tickMicro', at: 28 },
          { name: 'tickMicro', at: 33, rate: 1.2 },
          { name: 'impactHit', at: 24, volume: 0.7 },
          { name: 'sparkleShine', at: 40, volume: 0.6 },
        ]}
      />
    </AbsoluteFill>
  );
};
