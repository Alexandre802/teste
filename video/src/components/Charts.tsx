import type { CSSProperties, FC } from "react";
import { Easing, interpolate } from "remotion";
import { COLORS, FONT, hexA } from "../config/theme";
import { useProgress, useSpringIn } from "./anim";
import { SPRING } from "../config/theme";

type Pt = { x: number; y: number };

/** Curva suave (Catmull-Rom convertida em Bézier) — o traço ondulado das refs. */
export const smoothPath = (pts: Pt[], tension = 0.42): string => {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) * tension) / 3;
    const c1y = p1.y + ((p2.y - p0.y) * tension) / 3;
    const c2x = p2.x - ((p3.x - p1.x) * tension) / 3;
    const c2y = p2.y - ((p3.y - p1.y) * tension) / 3;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
};

const toPoints = (values: number[], w: number, h: number, padY = 0.12): Pt[] => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const top = h * padY;
  const usable = h - top * 2;
  return values.map((v, i) => ({
    x: (i / (values.length - 1 || 1)) * w,
    y: top + usable - ((v - min) / span) * usable,
  }));
};

/** Minigráfico de linha com desenho progressivo e ponto final. */
export const Sparkline: FC<{
  id: string;
  values: number[];
  width: number;
  height: number;
  color?: string;
  delay?: number;
  duration?: number;
  strokeWidth?: number;
  area?: boolean;
  endDot?: boolean;
  style?: CSSProperties;
}> = ({
  id,
  values,
  width,
  height,
  color = COLORS.green,
  delay = 0,
  duration = 30,
  strokeWidth = 4,
  area = true,
  endDot = true,
  style,
}) => {
  const p = useProgress(delay, duration, Easing.inOut(Easing.cubic));
  const pts = toPoints(values, width, height);
  const line = smoothPath(pts);
  const last = pts[pts.length - 1];
  const dot = useSpringIn(delay + duration - 4, SPRING.pop);

  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hexA(color, 0.3)} />
          <stop offset="100%" stopColor={hexA(color, 0)} />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <rect x={0} y={-height} width={width * p} height={height * 3} />
        </clipPath>
      </defs>
      {area ? (
        <path
          d={`${line} L ${width} ${height} L 0 ${height} Z`}
          fill={`url(#spark-${id})`}
          clipPath={`url(#clip-${id})`}
        />
      ) : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
      {endDot && p > 0.94 ? (
        <circle cx={last.x} cy={last.y} r={strokeWidth * 1.5 * dot} fill={color} />
      ) : null}
    </svg>
  );
};

/** Barras verticais pequenas que crescem em stagger. */
export const MiniBars: FC<{
  values: number[];
  width: number;
  height: number;
  color?: string;
  fadeFirst?: boolean;
  delay?: number;
  step?: number;
  gap?: number;
  radius?: number;
}> = ({
  values,
  width,
  height,
  color = COLORS.green,
  fadeFirst = true,
  delay = 0,
  step = 2,
  gap = 0.28,
  radius = 4,
}) => {
  const max = Math.max(...values) || 1;
  const n = values.length;
  const bw = width / (n + (n - 1) * gap);
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {values.map((v, i) => (
        <MiniBar
          key={i}
          x={i * bw * (1 + gap)}
          w={bw}
          h={(v / max) * height}
          height={height}
          color={color}
          opacity={fadeFirst ? 0.28 + (i / (n - 1 || 1)) * 0.72 : 1}
          delay={delay + i * step}
          radius={radius}
        />
      ))}
    </svg>
  );
};

const MiniBar: FC<{
  x: number;
  w: number;
  h: number;
  height: number;
  color: string;
  opacity: number;
  delay: number;
  radius: number;
}> = ({ x, w, h, height, color, opacity, delay, radius }) => {
  const p = useSpringIn(delay, SPRING.pop);
  const bh = Math.max(0.001, h * p);
  return <rect x={x} y={height - bh} width={w} height={bh} rx={radius} fill={color} opacity={opacity} />;
};

/** Barras agrupadas com valores negativos (Fluxo financeiro). */
export const GroupedBars: FC<{
  series: number[][];
  labels: readonly string[];
  colors: string[];
  width: number;
  height: number;
  delay?: number;
  step?: number;
  yTicks?: number[];
  labelSize?: number;
}> = ({ series, labels, colors, width, height, delay = 0, step = 3, yTicks = [], labelSize = 20 }) => {
  // os ticks entram no cálculo da escala: senão os rótulos do eixo caem fora do gráfico
  const all = [...series.flat(), ...yTicks];
  const max = Math.max(...all, 0);
  const min = Math.min(...all, 0);
  const span = max - min || 1;
  const padL = yTicks.length ? 62 : 0;
  const plotW = width - padL;
  const plotH = height - 34;
  const zeroY = (max / span) * plotH;
  const groups = labels.length;
  const gw = plotW / groups;
  const barW = (gw * 0.62) / series.length;

  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      {yTicks.map((t) => {
        const y = ((max - t) / span) * plotH;
        return (
          <g key={t}>
            <line x1={padL} x2={width} y1={y} y2={y} stroke={COLORS.line} strokeWidth={1.5} />
            <text
              x={padL - 12}
              y={y + 6}
              textAnchor="end"
              fontFamily={FONT.family}
              fontSize={labelSize * 0.85}
              fontWeight={FONT.medium}
              fill={COLORS.mutedSoft}
            >
              {t === 0 ? "0" : `${t}k`}
            </text>
          </g>
        );
      })}
      {labels.map((lab, g) => (
        <g key={lab}>
          {series.map((s, si) => {
            const v = s[g];
            const barH = (Math.abs(v) / span) * plotH;
            const x = padL + g * gw + gw * 0.19 + si * barW;
            return (
              <FlowBar
                key={si}
                x={x}
                w={barW * 0.82}
                h={barH}
                y={v >= 0 ? zeroY - barH : zeroY}
                up={v >= 0}
                color={colors[si]}
                delay={delay + g * step + si * 1.5}
              />
            );
          })}
          <text
            x={padL + g * gw + gw / 2}
            y={plotH + 26}
            textAnchor="middle"
            fontFamily={FONT.family}
            fontSize={labelSize}
            fontWeight={FONT.medium}
            fill={COLORS.muted}
          >
            {lab}
          </text>
        </g>
      ))}
    </svg>
  );
};

const FlowBar: FC<{
  x: number;
  w: number;
  h: number;
  y: number;
  up: boolean;
  color: string;
  delay: number;
}> = ({ x, w, h, y, up, color, delay }) => {
  const p = useSpringIn(delay, SPRING.pop);
  const bh = Math.max(0.001, h * p);
  return <rect x={x} y={up ? y + h - bh : y} width={w} height={bh} rx={3} fill={color} />;
};

/** Rosca de distribuição, desenhada fatia a fatia. */
export const Donut: FC<{
  slices: readonly { label: string; pct: number }[];
  size: number;
  thickness?: number;
  colors: string[];
  delay?: number;
  duration?: number;
}> = ({ slices, size, thickness = 34, colors, delay = 0, duration = 40 }) => {
  const p = useProgress(delay, duration, Easing.out(Easing.cubic));
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>
      {slices.map((s, i) => {
        const start = acc;
        acc += s.pct / 100;
        const shown = Math.max(0, Math.min(s.pct / 100, p - start));
        return (
          <circle
            key={s.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={colors[i]}
            strokeWidth={thickness}
            strokeDasharray={`${shown * circ} ${circ}`}
            strokeDashoffset={-start * circ}
          />
        );
      })}
    </svg>
  );
};

/** Anel de progresso com trilha (Meta mensal 62%). */
export const Ring: FC<{
  size: number;
  pct: number;
  thickness?: number;
  color?: string;
  track?: string;
  delay?: number;
  duration?: number;
}> = ({
  size,
  pct,
  thickness = 22,
  color = COLORS.green,
  track = COLORS.pale,
  delay = 0,
  duration = 42,
}) => {
  const p = useProgress(delay, duration, Easing.out(Easing.cubic));
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={thickness} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - (pct / 100) * p)}
      />
    </svg>
  );
};

/** Barra de progresso linear. */
export const ProgressBar: FC<{
  pct: number;
  width: number;
  height?: number;
  color?: string;
  track?: string;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
}> = ({
  pct,
  width,
  height = 14,
  color = COLORS.green,
  track = COLORS.bgSoft,
  delay = 0,
  duration = 32,
  style,
}) => {
  const p = useProgress(delay, duration, Easing.out(Easing.cubic));
  return (
    <div style={{ width, height, borderRadius: height, background: track, overflow: "hidden", ...style }}>
      <div
        style={{
          width: `${(pct / 100) * p * 100}%`,
          height: "100%",
          borderRadius: height,
          background: `linear-gradient(90deg, ${COLORS.greenDeep}, ${color})`,
        }}
      />
    </div>
  );
};

/** Caminho pontilhado decorativo que se desenha (as setas curvas das refs). */
export const DashedPath: FC<{
  d: string;
  width: number;
  height: number;
  color?: string;
  delay?: number;
  duration?: number;
  strokeWidth?: number;
  arrow?: boolean;
  id?: string;
  style?: CSSProperties;
}> = ({
  d,
  width,
  height,
  color = COLORS.pale,
  delay = 0,
  duration = 34,
  strokeWidth = 3,
  arrow = false,
  id = "dp",
  style,
}) => {
  const p = useProgress(delay, duration, Easing.inOut(Easing.quad));
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible", ...style }}>
      {arrow ? (
        <defs>
          <marker
            id={`arrow-${id}`}
            markerWidth="7"
            markerHeight="7"
            refX="5"
            refY="3.5"
            orient="auto"
          >
            <path d="M0 0 L7 3.5 L0 7 z" fill={color} />
          </marker>
        </defs>
      ) : null}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="10 12"
        pathLength={1}
        style={{ strokeDashoffset: 0, opacity: p > 0 ? 1 : 0 }}
        markerEnd={arrow && p > 0.92 ? `url(#arrow-${id})` : undefined}
        clipPath={`url(#dpclip-${id})`}
      />
      <defs>
        <clipPath id={`dpclip-${id}`}>
          <rect x={-20} y={-20} width={(width + 40) * p} height={height + 40} />
        </clipPath>
      </defs>
    </svg>
  );
};

/** Linha do tempo com pontos que acendem em sequência. */
export const Timeline: FC<{
  points: readonly string[];
  active: number;
  width: number;
  delay?: number;
  step?: number;
}> = ({ points, active, width, delay = 0, step = 4 }) => {
  const gap = width / (points.length - 1);
  return (
    <div style={{ position: "relative", width, height: 78 }}>
      <div
        style={{
          position: "absolute",
          top: 17,
          left: 0,
          width,
          height: 3,
          borderTop: `3px dashed ${COLORS.pale}`,
        }}
      />
      {points.map((p, i) => (
        <TimelineDot
          key={p}
          label={p}
          x={i * gap}
          isActive={i === active}
          isPast={i < active}
          delay={delay + i * step}
        />
      ))}
    </div>
  );
};

const TimelineDot: FC<{
  label: string;
  x: number;
  isActive: boolean;
  isPast: boolean;
  delay: number;
}> = ({ label, x, isActive, isPast, delay }) => {
  const p = useSpringIn(delay, SPRING.pop);
  const size = isActive ? 34 : 22;
  const color = isActive ? COLORS.green : isPast ? COLORS.greenBright : COLORS.pale;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 18,
        transform: `translate(-50%, -50%) scale(${p.toFixed(3)})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 99,
          background: isActive ? COLORS.white : color,
          border: isActive ? `5px solid ${COLORS.green}` : "none",
          boxShadow: isActive ? `0 0 0 6px ${hexA(COLORS.green, 0.12)}` : "none",
        }}
      />
      <div
        style={{
          fontFamily: FONT.family,
          fontSize: 19,
          fontWeight: isActive ? FONT.bold : FONT.medium,
          color: isActive ? COLORS.ink : COLORS.muted,
          whiteSpace: "nowrap",
          opacity: interpolate(p, [0, 1], [0, 1]),
        }}
      >
        {label}
      </div>
    </div>
  );
};
