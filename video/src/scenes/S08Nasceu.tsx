import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgLight, MiniChart } from '../components/Bg';
import { Flash, LightSweep, Sparks } from '../components/Fx';
import { KineticBlock } from '../components/Kinetic';
import { LogoHeader } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { prog, springAt, tween } from '../components/anim';
import { COLORS, EASE, FONTS, SPRINGS } from '../config/theme';

/**
 * Cena 08 (texto) — "Foi pensando nisso que nasceu a Monttra".
 * Referência: 81318C44-29D0-4790-A4CC-9E2FCDBAB988.png
 * Fecha o argumento e entrega a marca.
 */
export const S08Nasceu: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const H = 158;
  const BRAND = 34;

  const brandS = springAt(frame, fps, BRAND, SPRINGS.snappy);
  const brandP = prog(frame, BRAND, 12);
  const wipe = tween(frame, [BRAND + 6, BRAND + 30], [0, 1], EASE.out);

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
        progress={tween(frame, [3, 42], [0, 1])}
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
        progress={tween(frame, [14, 54], [0, 1])}
      />

      <Scene total={total} zoom={0.075} driftY={-16} punches={[2, 34]}>
        <LogoHeader delay={0} size={78} />

        <Stack top={500}>
          <KineticBlock
            size={H}
            step={5}
            dur={13}
            delay={2}
            rise={0.46}
            lines={[
              [{ t: 'Foi', tone: 'ink' }],
              [{ t: 'pensando', tone: 'ink' }],
              [{ t: 'nisso', tone: 'ink' }],
            ]}
          />

          <div style={{ height: 16 }} />

          <KineticBlock
            size={H * 0.72}
            step={5}
            dur={13}
            delay={24}
            rise={0.46}
            lines={[
              [
                { t: 'que', tone: 'ink' },
                { t: 'nasceu', tone: 'ink' },
                { t: 'a', tone: 'ink' },
              ],
            ]}
          />

          <div style={{ height: 22 }} />

          {/* a marca fecha a cena — como na arte, só o wordmark em verde */}
          <div
            style={{
              opacity: brandP,
              transform: `translateY(${(1 - brandS) * 80}px) scale(${0.84 + brandS * 0.16})`,
              transformOrigin: 'left center',
            }}
          >
            <div
              style={{
                fontFamily: FONTS.sans,
                fontWeight: 800,
                fontSize: H * 1.28,
                letterSpacing: '-0.045em',
                color: COLORS.green,
                lineHeight: 0.9,
                clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`,
              }}
            >
              Monttra
            </div>
          </div>
        </Stack>
      </Scene>

      <Sparks
        count={30}
        delay={BRAND + 4}
        origin={[430, 1400]}
        spread={460}
        rise={280}
        color={COLORS.greenNeon}
        seed="nasc"
      />
      <Flash at={BRAND} dur={10} max={0.5} />
      <LightSweep delay={BRAND + 10} dur={36} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.72 },
          { name: 'whooshShort', at: 2 },
          { name: 'popUi', at: 7 },
          { name: 'popUi', at: 12, rate: 1.06 },
          { name: 'riserShort', at: 8, volume: 0.55 },
          { name: 'swipeFast', at: 24 },
          { name: 'tickMicro', at: 29 },
          { name: 'tickMicro', at: 34, rate: 1.14 },
          { name: 'logoSting', at: BRAND, volume: 0.95 },
          { name: 'subBoom', at: BRAND, volume: 0.65 },
          { name: 'sparkleShine', at: BRAND + 8 },
          { name: 'successChime', at: BRAND + 14, volume: 0.6 },
        ]}
      />
    </AbsoluteFill>
  );
};
