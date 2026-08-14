import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BgLight } from '../components/Bg';
import { Flash, LightSweep, SpeedLines } from '../components/Fx';
import { LogoHeader } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { Line } from '../components/Type';
import { COPY } from '../config/timeline';

/**
 * Cena 01 — "Método não dá resultado. Mas sabe por quê?"
 * Referência: 55933092-0842-4F02-90AE-197EE4CCC18A.png
 */
export const S01Hook: React.FC<{ total: number }> = ({ total }) => {
  const H = 152; // corpo da manchete
  const S = 104; // subtítulo

  return (
    <AbsoluteFill>
      <BgLight tone="warm" />
      <SpeedLines delay={0} dur={22} count={30} />

      <Scene total={total} zoom={0.06} driftY={-22}>
        <LogoHeader delay={2} size={78} />

        <Stack top={620}>
          <Line size={H} tone="green" weight={800} delay={10} rotate={-1.4}>
            {COPY.s01.lines[0].text}
          </Line>
          <Line size={H} tone="ink" weight={800} delay={19}>
            {COPY.s01.lines[1].text}
          </Line>
          <Line size={H} tone="ink" weight={800} delay={27}>
            {COPY.s01.lines[2].text}
          </Line>

          <div style={{ height: 54 }} />

          <Line size={S} tone="ink" weight={800} delay={52}>
            {COPY.s01.sub[0].text}
          </Line>
          <Line size={S} tone="green" weight={800} delay={60}>
            {COPY.s01.sub[1].text}
          </Line>
        </Stack>
      </Scene>

      <LightSweep delay={34} dur={40} />
      <Flash at={8} dur={7} max={0.5} />

      <SfxTrack
        cues={[
          { name: 'reverseWhoosh', at: 0 },
          { name: 'bassHit', at: 10, volume: 0.9 },
          { name: 'whooshShort', at: 10 },
          { name: 'whooshShort', at: 19, rate: 1.12 },
          { name: 'whooshShort', at: 27, rate: 0.94 },
          { name: 'impactHit', at: 27, volume: 0.75 },
          { name: 'tickMicro', at: 44 },
          { name: 'popUi', at: 52 },
          { name: 'popUi', at: 60, rate: 0.88 },
          { name: 'sparkleShine', at: 62, volume: 0.7 },
        ]}
      />
    </AbsoluteFill>
  );
};
