import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BgLight, MiniChart } from '../components/Bg';
import { Flash, LightSweep } from '../components/Fx';
import { KineticBlock, KineticWord } from '../components/Kinetic';
import { LogoHeader } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { tween } from '../components/anim';
import { COLORS, FONTS } from '../config/theme';

/**
 * Cena 05 (texto) — "Mas não consegue ENXERGAR quanto realmente está ganhando."
 * Referência: 9D589EAF-16DD-4878-B6B9-040DE283ED67.png
 * "enxergar" é a palavra-herói: entra maior e mais tarde, com desfoque forte.
 */
export const S05Enxergar: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const A = 148;
  const HERO = 22;

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
        progress={tween(frame, [4, 46], [0, 1])}
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
        progress={tween(frame, [14, 40], [0, 1])}
      />

      <Scene total={total} zoom={0.08} driftY={-18}>
        <LogoHeader delay={0} size={78} />

        <Stack top={556}>
          <KineticBlock
            size={A}
            family={FONTS.display}
            weight={400}
            tracking="-0.004em"
            lineHeight={0.92}
            step={5}
            dur={13}
            delay={2}
            rise={0.5}
            lines={[
              [
                { t: 'Mas', tone: 'ink' },
                { t: 'não', tone: 'ink' },
              ],
              [{ t: 'consegue', tone: 'ink' }],
            ]}
          />

          {/* palavra-herói */}
          <div style={{ marginTop: -4, marginBottom: -2 }}>
            <KineticWord
              word={{ t: 'enxergar', tone: 'teal' }}
              size={A * 1.62}
              delay={HERO}
              dur={22}
              family={FONTS.display}
              weight={400}
              tracking="-0.012em"
              lineHeight={0.92}
              rise={0.3}
              zoom={0.42}
              blur={48}
            />
          </div>

          <KineticBlock
            size={A}
            family={FONTS.display}
            weight={400}
            tracking="-0.004em"
            lineHeight={0.95}
            step={5}
            dur={13}
            delay={HERO + 26}
            rise={0.5}
            lines={[
              [
                { t: 'quanto', tone: 'ink', scale: 0.62 },
                { t: 'realmente', tone: 'ink', scale: 0.62 },
              ],
              [
                { t: 'está', tone: 'teal' },
                { t: 'ganhando.', tone: 'teal' },
              ],
            ]}
          />
        </Stack>
      </Scene>

      <Flash at={HERO} dur={9} max={0.45} />
      <LightSweep delay={HERO + 30} dur={34} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.72 },
          { name: 'swipeFast', at: 2 },
          { name: 'popUi', at: 7 },
          { name: 'swipeFast', at: 12, rate: 1.08 },
          { name: 'reverseWhoosh', at: 10, volume: 0.75 },
          { name: 'impactHit', at: HERO, volume: 1 },
          { name: 'subBoom', at: HERO, volume: 0.75 },
          { name: 'sparkleShine', at: HERO + 8, volume: 0.7 },
          { name: 'popUi', at: HERO + 26 },
          { name: 'popUi', at: HERO + 31, rate: 1.08 },
          { name: 'whooshShort', at: HERO + 36, rate: 0.92 },
          { name: 'popUi', at: HERO + 41, rate: 0.96 },
          { name: 'bassHit', at: HERO + 41, volume: 0.6 },
        ]}
      />
    </AbsoluteFill>
  );
};
