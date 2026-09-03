import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BgLight, MiniChart } from '../components/Bg';
import { Flash, LightSweep } from '../components/Fx';
import { KineticLine } from '../components/Kinetic';
import { LogoHeader } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { tween } from '../components/anim';
import { COLORS } from '../config/theme';
import { COPY } from '../config/timeline';

/**
 * Cena 06 (texto) — "Quanto entrou? / Quanto saiu? / Quanto sobrou?"
 * Referência: FD6718AA-85B5-45CD-926E-4A5547E35EA5.png
 *
 * As três perguntas entram em cascata, cada par com sua batida.
 */
export const S06Quanto: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const H = 176;
  const STEP = 26; // distância entre as perguntas

  const charts = [
    { left: 34, top: 690 },
    { right: 96, top: 1080 },
    { right: 88, top: 1640 },
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
          progress={tween(frame, [8 + i * STEP, 34 + i * STEP], [0, 1])}
        />
      ))}

      <Scene total={total} zoom={0.075} driftY={-30} punches={[4, 30, 56]}>
        <LogoHeader delay={0} size={78} />

        <Stack top={420} gap={92}>
          {COPY.s06.pairs.map((p, i) => (
            <div key={p.b}>
              <KineticLine
                size={H}
                step={5}
                dur={13}
                delay={4 + i * STEP}
                rise={0.46}
                words={[{ t: p.a, tone: 'ink' }]}
              />
              <KineticLine
                size={H}
                step={5}
                dur={13}
                delay={11 + i * STEP}
                rise={0.46}
                style={{ marginLeft: 42 }}
                words={[{ t: p.b, tone: 'green' }]}
              />
            </div>
          ))}
        </Stack>
      </Scene>

      <LightSweep delay={62} dur={36} />
      <Flash at={0} dur={6} max={0.3} />
      <Flash at={4 + 2 * STEP} dur={8} max={0.3} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.75 },
          { name: 'whooshShort', at: 4 },
          { name: 'popUi', at: 11 },
          { name: 'whooshShort', at: 4 + STEP, rate: 1.07 },
          { name: 'popUi', at: 11 + STEP, rate: 1.07 },
          { name: 'whooshShort', at: 4 + 2 * STEP, rate: 0.92 },
          { name: 'popUi', at: 11 + 2 * STEP, rate: 0.92 },
          { name: 'impactHit', at: 11 + 2 * STEP, volume: 0.85 },
          { name: 'subBoom', at: 11 + 2 * STEP, volume: 0.6 },
          { name: 'tickMicro', at: 40 },
          { name: 'tickMicro', at: 66, rate: 1.1 },
          { name: 'sparkleShine', at: 74, volume: 0.6 },
        ]}
      />
    </AbsoluteFill>
  );
};
