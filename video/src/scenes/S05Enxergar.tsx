import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BgLight, MiniChart } from '../components/Bg';
import { Flash, LightSweep } from '../components/Fx';
import { LogoHeader } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { Line } from '../components/Type';
import { prog, tween } from '../components/anim';
import { COLORS, FONTS } from '../config/theme';

/**
 * Cena 05 — "Mas não consegue ENXERGAR quanto realmente está ganhando."
 * Referência: 9D589EAF-16DD-4878-B6B9-040DE283ED67.png
 * "enxergar" é a palavra-herói: entra maior, com desfoque que resolve.
 */
export const S05Enxergar: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const A = 144;
  const heroP = prog(frame, 22, 34);

  return (
    <AbsoluteFill>
      <BgLight tone="warm" charts={false} />

      <MiniChart
        points={[
          [0, 150],
          [92, 96],
          [178, 60],
          [268, 8],
        ]}
        width={280}
        height={160}
        style={{ right: 30, top: 470 }}
        color={COLORS.greenPale}
        progress={tween(frame, [8, 58], [0, 1])}
      />
      <MiniChart
        points={[
          [0, 40],
          [70, 6],
        ]}
        width={80}
        height={50}
        style={{ left: -10, top: 990 }}
        color={COLORS.greenPale}
        progress={tween(frame, [18, 44], [0, 1])}
      />

      <Scene total={total} zoom={0.05} driftY={-16}>
        <LogoHeader delay={0} size={78} />

        <Stack top={580}>
          <Line
            size={A}
            tone="ink"
            family={FONTS.display}
            weight={400}
            tracking="-0.004em"
            lineHeight={0.92}
            delay={4}
          >
            Mas não
          </Line>
          <Line
            size={A}
            tone="ink"
            family={FONTS.display}
            weight={400}
            tracking="-0.004em"
            lineHeight={0.92}
            delay={12}
          >
            consegue
          </Line>

          {/* palavra-herói: escala + desfoque que "foca" */}
          <div
            style={{
              transform: `scale(${0.86 + heroP * 0.14})`,
              transformOrigin: 'left center',
              filter: `blur(${(1 - heroP) * 26}px)`,
              opacity: prog(frame, 22, 14),
              marginTop: -6,
              marginBottom: -4,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: A * 1.62,
                lineHeight: 0.92,
                letterSpacing: '-0.01em',
                color: COLORS.greenTeal,
              }}
            >
              enxergar
            </div>
          </div>

          <Line
            size={A * 0.62}
            tone="ink"
            family={FONTS.display}
            weight={400}
            tracking="-0.004em"
            lineHeight={0.95}
            delay={44}
          >
            quanto realmente
          </Line>
          <Line
            size={A}
            tone="teal"
            family={FONTS.display}
            weight={400}
            tracking="-0.004em"
            lineHeight={0.95}
            delay={52}
          >
            está ganhando.
          </Line>
        </Stack>
      </Scene>

      <Flash at={22} dur={9} max={0.42} />
      <LightSweep delay={56} dur={36} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.7 },
          { name: 'swipeFast', at: 4 },
          { name: 'swipeFast', at: 12, rate: 1.08 },
          { name: 'reverseWhoosh', at: 8, volume: 0.7 },
          { name: 'impactHit', at: 22, volume: 0.95 },
          { name: 'subBoom', at: 22, volume: 0.7 },
          { name: 'popUi', at: 44 },
          { name: 'whooshShort', at: 52, rate: 0.92 },
          { name: 'sparkleShine', at: 58, volume: 0.6 },
        ]}
      />
    </AbsoluteFill>
  );
};
