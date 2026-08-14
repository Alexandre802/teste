import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgLight, MiniChart } from '../components/Bg';
import { Flash, LightSweep, Sparks } from '../components/Fx';
import { LogoMark } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { Line } from '../components/Type';
import { prog, springAt, tween } from '../components/anim';
import { COLORS, FONTS, SPRINGS } from '../config/theme';

/**
 * Cena 08 — "Foi pensando nisso que nasceu a Monttra".
 * Referência: 81318C44-29D0-4790-A4CC-9E2FCDBAB988.png
 * Fecha o bloco de dor e abre o bloco de produto.
 */
export const S08Nasceu: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const H = 128;

  const brandS = springAt(frame, fps, 46, SPRINGS.snappy);
  const brandP = prog(frame, 46, 18);

  return (
    <AbsoluteFill>
      <BgLight tone="warm" charts={false} />

      <MiniChart
        points={[
          [0, 130],
          [86, 60],
          [162, 84],
          [240, 16],
        ]}
        width={250}
        height={140}
        style={{ right: 66, top: 500 }}
        color={COLORS.greenPale}
        progress={tween(frame, [6, 52], [0, 1])}
      />
      <MiniChart
        points={[
          [0, 96],
          [80, 44],
          [150, 62],
          [220, 8],
        ]}
        width={230}
        height={104}
        style={{ left: 40, top: 1490 }}
        color={COLORS.greenPale}
        progress={tween(frame, [18, 64], [0, 1])}
      />

      <Scene total={total} zoom={0.055} driftY={-14}>
        <Stack top={560}>
          <Line size={H} tone="ink" weight={800} tracking="-0.04em" delay={4}>
            Foi
          </Line>
          <Line size={H} tone="ink" weight={800} tracking="-0.04em" delay={11}>
            pensando
          </Line>
          <Line size={H} tone="ink" weight={800} tracking="-0.04em" delay={18}>
            nisso
          </Line>

          <div style={{ height: 18 }} />

          <Line
            size={H * 0.72}
            tone="ink"
            weight={800}
            tracking="-0.035em"
            delay={30}
          >
            que nasceu a
          </Line>

          <div style={{ height: 24 }} />

          {/* marca: símbolo + wordmark entram juntos */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              opacity: brandP,
              transform: `translateY(${(1 - brandS) * 60}px) scale(${0.88 + brandS * 0.12})`,
            }}
          >
            <LogoMark size={132} delay={48} glow />
            <div
              style={{
                fontFamily: FONTS.sans,
                fontWeight: 800,
                fontSize: H * 1.3,
                letterSpacing: '-0.045em',
                color: COLORS.green,
                lineHeight: 0.9,
                clipPath: `inset(0 ${(1 - prog(frame, 54, 26)) * 100}% 0 0)`,
              }}
            >
              Monttra
            </div>
          </div>
        </Stack>
      </Scene>

      <Sparks
        count={26}
        delay={50}
        origin={[430, 1420]}
        spread={420}
        rise={260}
        color={COLORS.greenNeon}
        seed="nasc"
      />
      <Flash at={48} dur={10} max={0.5} />
      <LightSweep delay={54} dur={40} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.7 },
          { name: 'whooshShort', at: 4 },
          { name: 'whooshShort', at: 11, rate: 1.05 },
          { name: 'whooshShort', at: 18, rate: 0.95 },
          { name: 'popUi', at: 30 },
          { name: 'riserShort', at: 12, volume: 0.55 },
          { name: 'logoSting', at: 46, volume: 0.9 },
          { name: 'sparkleShine', at: 52 },
          { name: 'subBoom', at: 46, volume: 0.6 },
        ]}
      />
    </AbsoluteFill>
  );
};
