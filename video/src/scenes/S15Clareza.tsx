import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BgLight, MiniChart } from '../components/Bg';
import { Flash, LightSweep } from '../components/Fx';
import { Beat, KineticBlock } from '../components/Kinetic';
import { LogoHeader } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { tween } from '../components/anim';
import { COLORS } from '../config/theme';

/**
 * Cena de texto — o fecho do argumento, antes da chamada final.
 * Narracao: "Porque nao basta ganhar dinheiro. Voce precisa saber quanto
 * ganhou, quanto gastou e ter clareza para planejar os proximos passos."
 *
 * Tres batidas, acompanhando as tres ideias da fala.
 */
export const S15Clareza: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const B1 = 118;
  const B2 = 250;

  return (
    <AbsoluteFill>
      <BgLight tone="warm" charts={false} />

      <MiniChart
        points={[
          [0, 118],
          [76, 62],
          [148, 88],
          [226, 10],
        ]}
        width={240}
        height={130}
        style={{ right: 48, top: 470 }}
        color={COLORS.greenPale}
        progress={tween(frame, [4, 48], [0, 1])}
      />
      <MiniChart
        points={[
          [0, 90],
          [66, 44],
          [128, 60],
          [190, 6],
        ]}
        width={200}
        height={100}
        style={{ left: 52, top: 1520 }}
        color={COLORS.greenPale}
        progress={tween(frame, [B2 + 10, B2 + 54], [0, 1])}
      />

      <Scene total={total} zoom={0.09} driftX={12} driftY={-26} punches={[4, B1, B2]}>
        <LogoHeader delay={0} size={78} />

        <Beat from={0} len={B1}>
          <Stack top={640}>
            <KineticBlock
              size={132}
              step={5}
              dur={14}
              delay={4}
              lines={[
                [{ t: 'Porque', tone: 'ink' }, { t: 'não', tone: 'ink' }],
                [{ t: 'basta', tone: 'ink' }],
                [{ t: 'ganhar', tone: 'green' }, { t: 'dinheiro.', tone: 'green' }],
              ]}
            />
          </Stack>
        </Beat>

        <Beat from={B1} len={B2 - B1}>
          <Stack top={620}>
            <KineticBlock
              size={124}
              step={5}
              dur={14}
              delay={2}
              lines={[
                [{ t: 'Você', tone: 'ink' }, { t: 'precisa', tone: 'ink' }],
                [{ t: 'saber', tone: 'ink' }],
                [{ t: 'quanto', tone: 'green' }, { t: 'ganhou,', tone: 'green' }],
                [{ t: 'quanto', tone: 'green' }, { t: 'gastou', tone: 'green' }],
              ]}
            />
          </Stack>
        </Beat>

        <Beat from={B2} len={total - B2} hold>
          <Stack top={640}>
            <KineticBlock
              size={128}
              step={5}
              dur={14}
              delay={2}
              lines={[
                [{ t: 'e', tone: 'ink' }, { t: 'ter', tone: 'ink' }],
                [{ t: 'clareza', tone: 'green' }],
                [{ t: 'para', tone: 'ink', scale: 0.72 }, { t: 'planejar', tone: 'ink', scale: 0.72 }],
                [{ t: 'os', tone: 'green' }, { t: 'próximos', tone: 'green' }],
                [{ t: 'passos.', tone: 'green' }],
              ]}
            />
          </Stack>
        </Beat>
      </Scene>

      <LightSweep delay={30} dur={34} />
      <LightSweep delay={B2 + 16} dur={36} />
      <Flash at={0} dur={6} max={0.32} />
      <Flash at={B1} dur={6} max={0.28} />
      <Flash at={B2} dur={6} max={0.28} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.75 },
          { name: 'whooshShort', at: 4 },
          { name: 'popUi', at: 9 },
          { name: 'popUi', at: 14, rate: 1.08 },
          { name: 'impactHit', at: 19, volume: 0.75 },
          { name: 'swipeFast', at: B1 - 4 },
          { name: 'whooshShort', at: B1, rate: 1.06 },
          { name: 'popUi', at: B1 + 7 },
          { name: 'popUi', at: B1 + 14, rate: 1.1 },
          { name: 'tickMicro', at: B1 + 22 },
          { name: 'swipeFast', at: B2 - 4, rate: 0.94 },
          { name: 'whooshShort', at: B2, rate: 0.94 },
          { name: 'popUi', at: B2 + 8 },
          { name: 'popUi', at: B2 + 16, rate: 1.08 },
          { name: 'bassHit', at: B2 + 24, volume: 0.7 },
          { name: 'sparkleShine', at: B2 + 30, volume: 0.6 },
        ]}
      />
    </AbsoluteFill>
  );
};
