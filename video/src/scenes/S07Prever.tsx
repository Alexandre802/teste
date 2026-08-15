import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BgLight, MiniChart } from '../components/Bg';
import { Flash, LightSweep } from '../components/Fx';
import { KineticBlock } from '../components/Kinetic';
import { LogoHeader } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { tween } from '../components/anim';
import { COLORS } from '../config/theme';

/**
 * Cena 07 (texto) — "E mais importante: quanto vai fechar na próxima semana?"
 * Referência: DD7785A5-981F-4EB7-A382-9925D6A4CD70.png
 */
export const S07Prever: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const H = 138;

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
        style={{ right: 44, top: 690 }}
        color={COLORS.greenDeep}
        strokeWidth={3.4}
        nodes={false}
        progress={tween(frame, [16, 52], [0, 1])}
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
        progress={tween(frame, [44, 78], [0, 1])}
      />

      <Scene total={total} zoom={0.08} driftY={-24} punches={[2, 26, 42]}>
        <LogoHeader delay={0} size={78} />

        <Stack top={496}>
          <KineticBlock
            size={H}
            step={5}
            dur={13}
            delay={2}
            rise={0.46}
            lines={[
              [{ t: 'E', tone: 'ink' }],
              [{ t: 'mais', tone: 'green' }],
              [{ t: 'importante:', tone: 'green' }],
            ]}
          />

          <div style={{ height: 22 }} />

          <KineticBlock
            size={H}
            step={5}
            dur={13}
            delay={26}
            rise={0.46}
            lines={[
              [
                { t: 'Quanto', tone: 'ink', scale: 0.70 },
                { t: 'vai', tone: 'ink', scale: 0.70 },
                { t: 'fechar', tone: 'ink', scale: 0.70 },
              ],
            ]}
          />

          <div style={{ height: 18 }} />

          <KineticBlock
            size={H}
            step={5}
            dur={13}
            delay={42}
            rise={0.46}
            lines={[
              [
                { t: 'na', tone: 'ink' },
                { t: 'próxima', tone: 'green' },
              ],
              [{ t: 'semana?', tone: 'green' }],
            ]}
          />
        </Stack>
      </Scene>

      <LightSweep delay={54} dur={34} />
      <Flash at={0} dur={6} max={0.3} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.75 },
          { name: 'whooshShort', at: 2 },
          { name: 'popUi', at: 7 },
          { name: 'popUi', at: 12, rate: 1.08 },
          { name: 'impactHit', at: 12, volume: 0.7 },
          { name: 'swipeFast', at: 26 },
          { name: 'tickMicro', at: 31 },
          { name: 'tickMicro', at: 36, rate: 1.12 },
          { name: 'whooshShort', at: 42, rate: 1.05 },
          { name: 'popUi', at: 47 },
          { name: 'bassHit', at: 52, volume: 0.72 },
          { name: 'notificationPop', at: 60, volume: 0.7 },
        ]}
      />
    </AbsoluteFill>
  );
};
