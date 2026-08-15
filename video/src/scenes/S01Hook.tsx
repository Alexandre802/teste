import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BgLight } from '../components/Bg';
import { Flash, LightSweep, SpeedLines } from '../components/Fx';
import { KineticBlock } from '../components/Kinetic';
import { LogoHeader } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { prog, tween } from '../components/anim';
import { COLORS, EASE } from '../config/theme';

/** Traços curtos que aparecem nos cantos da arte original. */
export const Dashes: React.FC<{
  x?: number;
  y: number;
  right?: number;
  delay: number;
  flip?: boolean;
}> = ({ x, y, right, delay, flip = false }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, right, top: y }}>
      {[0, 1, 2].map((i) => {
        const p = prog(frame, delay + i * 4, 14);
        const w = [130, 96, 66][i];
        return (
          <div
            key={i}
            style={{
              height: 3,
              width: w,
              marginBottom: 13,
              marginLeft: flip ? 'auto' : 0,
              borderRadius: 3,
              background: COLORS.greenPale,
              transform: `scaleX(${p})`,
              transformOrigin: flip ? 'right center' : 'left center',
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Cena 01 (texto) — "Método não dá resultado. / Mas sabe por quê?"
 * Referência: 55933092-0842-4F02-90AE-197EE4CCC18A.png
 *
 * O bloco é construído em duas ondas de palavras, mas nada sai de cena:
 * o quadro final reproduz a arte exatamente como ela é.
 */
export const S01Hook: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const SUB = 64; // quando a pergunta começa a encaixar

  // o bloco assenta para cima quando a segunda onda chega
  const settle = tween(frame, [SUB - 6, SUB + 18], [0, 1], EASE.out);

  return (
    <AbsoluteFill>
      <BgLight tone="warm" charts={false} />
      <SpeedLines delay={0} dur={20} count={26} />

      <Scene total={total} zoom={0.085} driftY={-24} punches={[3, 64]}>
        <LogoHeader delay={0} size={78} />

        <Dashes x={86} y={470} delay={6} />
        <Dashes right={92} y={1268} delay={SUB + 8} flip />

        <Stack top={618} style={{ transform: `translateY(${-settle * 46}px)` }}>
          <KineticBlock
            size={152}
            step={5}
            dur={14}
            delay={3}
            lines={[
              [{ t: 'Método', tone: 'green' }],
              [{ t: 'não', tone: 'ink' }, { t: 'dá', tone: 'ink' }],
              [{ t: 'resultado.', tone: 'ink' }],
            ]}
          />

          <div style={{ height: 56 }} />

          <KineticBlock
            size={104}
            step={5}
            dur={14}
            delay={SUB}
            lines={[
              [{ t: 'Mas', tone: 'ink' }, { t: 'sabe', tone: 'ink' }],
              [{ t: 'por', tone: 'green' }, { t: 'quê?', tone: 'green' }],
            ]}
          />
        </Stack>
      </Scene>

      <LightSweep delay={22} dur={30} />
      <LightSweep delay={SUB + 16} dur={30} />
      <Flash at={0} dur={6} max={0.4} />

      <SfxTrack
        cues={[
          { name: 'reverseWhoosh', at: 0 },
          { name: 'bassHit', at: 3, volume: 0.9 },
          { name: 'whooshShort', at: 3 },
          { name: 'popUi', at: 8 },
          { name: 'popUi', at: 13, rate: 1.1 },
          { name: 'impactHit', at: 18, volume: 0.8 },
          { name: 'tickMicro', at: 38 },
          { name: 'swipeFast', at: SUB - 4 },
          { name: 'popUi', at: SUB },
          { name: 'popUi', at: SUB + 5, rate: 1.08 },
          { name: 'popUi', at: SUB + 10, rate: 1.14 },
          { name: 'notificationPop', at: SUB + 15 },
          { name: 'sparkleShine', at: SUB + 20, volume: 0.7 },
        ]}
      />
    </AbsoluteFill>
  );
};
