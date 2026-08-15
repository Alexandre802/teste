import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { LightSweep, Sparks } from '../components/Fx';
import { Logo } from '../components/Logo';
import { PlateScene } from '../components/Plate';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { prog, tween } from '../components/anim';
import { COLORS, EASE, FONTS } from '../config/theme';

/** Nós da curva, em coordenadas de 1080x1920. */
const NODES = [
  { x: 78, y: 1478, v: 'R$ 4.120' },
  { x: 250, y: 1388, v: 'R$ 6.480' },
  { x: 402, y: 1327, v: 'R$ 8.950' },
  { x: 586, y: 1246, v: 'R$ 12.300' },
  { x: 764, y: 1114, v: 'R$ 18.700' },
  { x: 918, y: 1010, v: 'R$ 24.900' },
];

const ARROW_AT = 20;
const ARROW_DUR = 150; // a linha sobe devagar, ao longo de quase toda a cena

/** Momento em que a varredura da linha alcança cada nó. */
const nodeAt = (x: number) => ARROW_AT + ARROW_DUR * (x / 1080);

/** Resultado de cada mês, surgindo conforme a linha passa pelo nó. */
const MonthValues: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {NODES.map((n, i) => {
        const d = nodeAt(n.x) + 4;
        const p = prog(frame, d, 16, EASE.out);
        const pop = tween(frame, [d, d + 20], [0.72, 1], EASE.back);
        if (p <= 0) return null;
        return (
          <div
            key={n.v}
            style={{
              position: 'absolute',
              left: n.x,
              top: n.y - 92,
              transform: `translateX(-50%) translateY(${(1 - p) * 22}px) scale(${pop})`,
              opacity: p,
              padding: '10px 20px',
              borderRadius: 999,
              background: '#FFFFFF',
              boxShadow: '0 10px 26px rgba(9,32,27,0.14)',
              fontFamily: FONTS.ui,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: '-0.02em',
              color: i >= 4 ? COLORS.green : COLORS.inkSoft,
              whiteSpace: 'nowrap',
            }}
          >
            {n.v}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Brilho que corre sobre a linha enquanto ela sobe. */
const ArrowTravel: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, ARROW_AT, ARROW_DUR, EASE.inOut);
  const L = 2000;
  const d =
    'M -90 1560 C 120 1500, 300 1420, 420 1330 C 600 1200, 760 1120, 1000 860';
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
      <defs>
        <filter id="atg" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="rgba(235,255,248,0.95)"
        strokeWidth={30}
        strokeLinecap="round"
        filter="url(#atg)"
        strokeDasharray={`150 ${L}`}
        strokeDashoffset={L * 0.08 - p * (L + 300)}
        opacity={p > 0.01 && p < 0.99 ? 0.9 : 0}
      />
    </svg>
  );
};

/**
 * Cena 4 (40,6s–46,4s) — "Acompanhe por periodo".
 * Arte: 5E1A6311-5E30-42B3-8096-D854D854D4DD.png
 *
 * A linha sobe devagar da esquerda para a direita; a cada no que ela
 * alcanca surge o resultado daquele mes, sempre melhor que o anterior.
 * O brilho acompanha a ponta da linha.
 */
export const S10Periodo: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill>
    <Scene total={total} zoom={0.05} driftX={-14} driftY={-12} handheld={2.4} punches={[36, 176]}>
      <PlateScene
        scene="periodo"
        layers={[
          { id: 'chipTop', delay: 12, from: 'right', distance: 130, spring: 'pop', float: 4, sweepAt: 54 },
          { id: 'tab0', delay: 24, from: 'scale', spring: 'pop', blur: 10 },
          { id: 'tab1', delay: 30, from: 'scale', spring: 'pop', blur: 10 },
          { id: 'tab2', delay: 36, from: 'scale', spring: 'pop', blur: 10, glow: 'rgba(3,80,54,0.45)' },
          { id: 'tab3', delay: 42, from: 'scale', spring: 'pop', blur: 10 },
          { id: 'tab4', delay: 48, from: 'scale', spring: 'pop', blur: 10 },

          // a linha se desenha devagar
          { id: 'arrow', delay: ARROW_AT, from: 'none', wipe: 'right', wipeDur: ARROW_DUR, blur: 0 },

          // os meses aparecem quando a linha passa por eles
          ...NODES.map((n, i) => ({
            id: ['mJan', 'mFev', 'mMar', 'mAbr', 'mMai', 'mJun'][i],
            delay: Math.round(nodeAt(n.x)),
            from: 'up' as const,
            distance: 20,
            blur: 6,
          })),

          { id: 'chipBottom', delay: 196, from: 'left', distance: 130, spring: 'pop', float: 4, phase: 2, sweepAt: 224 },
        ]}
      >
        <Logo
          size={98}
          color={COLORS.greenDeep}
          delay={0}
          style={{ position: 'absolute', left: 56, top: 194 }}
        />
      </PlateScene>

      <ArrowTravel />
      <MonthValues />
      <Sparks count={18} delay={176} origin={[960, 940]} spread={260} rise={210} color={COLORS.greenNeon} seed="per" />
    </Scene>

    <LightSweep delay={26} dur={38} />

    <SfxTrack
      cues={[
        { name: 'whooshTransition', at: 0, volume: 0.78 },
        { name: 'popSoft', at: 12 },
        { name: 'popUi', at: 24 },
        { name: 'popUi', at: 30, rate: 1.05 },
        { name: 'tapButton', at: 36, volume: 1.15 },
        { name: 'clickDigital', at: 38 },
        { name: 'popUi', at: 42, rate: 1.15 },
        { name: 'popUi', at: 48, rate: 1.2 },
        { name: 'riserShort', at: 24, volume: 0.42 },
        { name: 'whooshTransition', at: ARROW_AT, volume: 0.6, rate: 0.86 },
        ...NODES.map((n, i) => ({
          name: 'notificationPop' as const,
          at: Math.round(nodeAt(n.x)) + 4,
          volume: 0.5 + i * 0.06,
          rate: 0.94 + i * 0.05,
        })),
        { name: 'sparkleShine', at: 176 },
        { name: 'impactHit', at: 178, volume: 0.7 },
        { name: 'popSoft', at: 196, rate: 0.95 },
      ]}
    />
  </AbsoluteFill>
);
