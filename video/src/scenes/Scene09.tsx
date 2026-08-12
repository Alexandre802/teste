import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Backdrop, CardClip } from '../components/Backdrop';
import { Logo } from '../components/Logo';
import { Headline } from '../components/Text';
import { Sfx, SfxSeries } from '../components/Sfx';
import { COLORS, FONT } from '../theme';
import { float, iv, p, pulse, s, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';

const T = TEXTS.s09;
const INSET: [number, number] = [50, 58];

/** Marcações de hora ao redor de um relógio. */
const Ticks: React.FC<{
  cx: number;
  cy: number;
  r: number;
  count?: number;
  delay: number;
  frame: number;
  length?: number;
  width?: number;
  color?: string;
}> = ({ cx, cy, r, count = 12, delay, frame, length = 18, width = 7, color = COLORS.primarySoft }) => (
  <>
    {Array.from({ length: count }).map((_, i) => {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      const g = s(frame, { delay: delay + i * 1.6, config: SPRING.pop });
      const x1 = cx + Math.cos(a) * r;
      const y1 = cy + Math.sin(a) * r;
      const x2 = cx + Math.cos(a) * (r - length * g);
      const y2 = cy + Math.sin(a) * (r - length * g);
      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          opacity={g}
        />
      );
    })}
  </>
);

/** Relógio pequeno com ponteiros que giram. */
const SmallClock: React.FC<{
  cx: number;
  cy: number;
  r: number;
  delay: number;
  frame: number;
  speed?: number;
  ring?: boolean;
}> = ({ cx, cy, r, delay, frame, speed = 1, ring = false }) => {
  const g = s(frame, { delay, config: SPRING.bouncy });
  const t = Math.max(0, frame - delay);
  const minute = t * 4.2 * speed;
  const hour = t * 0.9 * speed;
  const drift = float(frame, 6, 140, delay * 4);
  return (
    <g transform={`translate(0 ${drift.toFixed(2)}) scale(${g.toFixed(3)})`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <circle cx={cx} cy={cy} r={r} fill="#F5F4FE" stroke={COLORS.primary} strokeWidth={r * 0.13} />
      <Ticks
        cx={cx}
        cy={cy}
        r={r * 0.78}
        delay={delay + 4}
        frame={frame}
        length={r * 0.16}
        width={r * 0.06}
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(((hour - 90) * Math.PI) / 180) * r * 0.42}
        y2={cy + Math.sin(((hour - 90) * Math.PI) / 180) * r * 0.42}
        stroke={COLORS.primaryText}
        strokeWidth={r * 0.1}
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(((minute - 90) * Math.PI) / 180) * r * 0.62}
        y2={cy + Math.sin(((minute - 90) * Math.PI) / 180) * r * 0.62}
        stroke={COLORS.primaryText}
        strokeWidth={r * 0.085}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r * 0.07} fill={COLORS.primaryText} />

      {ring ? (
        <g opacity={iv(frame, [delay + 10, delay + 24], [0, 1])}>
          <path
            d={`M ${cx - r * 1.25} ${cy} A ${r * 1.25} ${r * 1.25} 0 1 1 ${cx + r * 1.1} ${cy + r * 0.6}`}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={r * 0.12}
            strokeLinecap="round"
            transform={`rotate(${(frame - delay) * 0.8} ${cx} ${cy})`}
          />
        </g>
      ) : null}
    </g>
  );
};

export const Scene09: React.FC = () => {
  const frame = useCurrentFrame();
  const CX = 524;
  const CY = 1246;
  const R = 186;

  const ringDraw = p(frame, 56, 108);
  const ringLen = 2 * Math.PI * R;
  const arrowIn = s(frame, { delay: 100, config: SPRING.bouncy });
  const labelIn = s(frame, { delay: 84, config: SPRING.bouncy });
  const labelBeat = pulse(frame, 108, 0.12, 26) + pulse(frame, 200, 0.06, 20);
  const orbitRot = frame * 0.32;
  const orbitIn = iv(frame, [40, 70], [0, 1]);
  const bigDrift = float(frame, 8, 170);

  return (
    <Backdrop
      inset={INSET}
      blobs={[
        { x: 1040, y: 60, r: 210, color: COLORS.primarySoft, delay: 0, drift: 8 },
        { x: 20, y: 1520, r: 240, color: COLORS.primarySoft, delay: 4, drift: 12 },
        { x: 1050, y: 1840, r: 150, color: COLORS.primary, delay: 8, drift: 8 },
      ]}
      fans={[{ x: 930, y: 380, size: 148, color: COLORS.peach, rotate: 170, delay: 14 }]}
      strokes={[{ x: 44, y: 1500, size: 88, color: COLORS.peachSoft, rotate: 200, delay: 18 }]}
    >
      <CardClip inset={INSET}>
        <div
          style={{
            position: 'absolute',
            top: 138,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Logo size={86} delay={2} fontSize={72} gap={20} />
        </div>

        <div style={{ position: 'absolute', top: 430, left: 50, right: 50 }}>
          <Headline
            lines={T.lines}
            fontSize={82}
            lineHeight={1.18}
            align="center"
            delay={12}
            stagger={3.4}
            lineStagger={8}
          />
        </div>

        {/* Sistema de relógios */}
        <svg
          style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920 }}
          viewBox="0 0 1080 1920"
        >
          {/* Órbita tracejada girando */}
          <g opacity={orbitIn} transform={`rotate(${orbitRot} ${CX} ${CY})`}>
            <ellipse
              cx={CX}
              cy={CY}
              rx={352}
              ry={318}
              fill="none"
              stroke={COLORS.lavenderDeep}
              strokeWidth={9}
              strokeDasharray="24 26"
              strokeLinecap="round"
            />
          </g>

          <g transform={`translate(0 ${bigDrift.toFixed(2)})`}>
            {/* Anel principal que se desenha */}
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={COLORS.primary}
              strokeWidth={36}
              strokeLinecap="round"
              strokeDasharray={`${ringLen * 0.86} ${ringLen}`}
              strokeDashoffset={ringLen * 0.86 * (1 - ringDraw)}
              transform={`rotate(30.4 ${CX} ${CY})`}
              opacity={0.95}
            />
            {/* Ponta de seta do anel */}
            <g
              transform={`translate(${(CX + R * Math.cos((-20 * Math.PI) / 180)).toFixed(1)} ${(CY + R * Math.sin((-20 * Math.PI) / 180)).toFixed(1)}) rotate(70) scale(${arrowIn.toFixed(3)})`}
            >
              <path d="M -42 -40 L 44 0 L -42 40 Z" fill={COLORS.primary} />
            </g>

            <circle cx={CX} cy={CY} r={R - 30} fill="#FBFAFE" opacity={0.95} />
            <Ticks cx={CX} cy={CY} r={R - 42} delay={64} frame={frame} length={26} width={9} />
          </g>

          <SmallClock cx={246} cy={1016} r={104} delay={40} frame={frame} speed={1.15} />
          <SmallClock cx={866} cy={1452} r={100} delay={122} frame={frame} speed={0.85} ring />
        </svg>

        {/* Rótulo 24h */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: CY - 66 + bigDrift,
            textAlign: 'center',
            fontFamily: FONT.family,
            fontWeight: FONT.black,
            fontSize: 114,
            color: COLORS.primaryText,
            letterSpacing: '-0.05em',
            transform: `scale(${(labelIn * (1 + labelBeat)).toFixed(4)})`,
          }}
        >
          {T.ringLabel}
        </div>
      </CardClip>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="pop_ui" at={4} />
      <Sfx name="whoosh_short" at={12} />
      <Sfx name="whoosh_short" at={26} gain={0.9} />
      <Sfx name="whoosh_short" at={40} gain={0.85} />
      <Sfx name="soft_pop" at={40} />
      <Sfx name="reverse_whoosh" at={44} gain={0.6} />
      <Sfx name="whoosh_transition" at={56} gain={0.55} />
      <SfxSeries name="tick" from={64} count={12} every={1.6} gain={0.45} />
      <Sfx name="pop_ui" at={84} />
      <Sfx name="impact" at={100} gain={0.7} />
      <Sfx name="bass_hit" at={100} gain={0.5} />
      <Sfx name="sparkle" at={106} gain={0.7} />
      <Sfx name="soft_pop" at={122} />
      <Sfx name="digital_click" at={130} gain={0.7} />
      <SfxSeries name="tick" from={150} count={8} every={18} gain={0.28} />
      <Sfx name="sub_boom" at={230} gain={0.4} />
    </Backdrop>
  );
};
