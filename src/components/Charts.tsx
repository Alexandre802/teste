/**
 * Gráficos do dashboard — todos aceitam um `progress` (0→1) para desenhar/crescer.
 */
import React from "react";
import { C, FW } from "../config/theme";
import { fontFamily } from "../lib/fonts";

const catmullPath = (pts: [number, number][]) => {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};

const toPoints = (values: number[], w: number, h: number, pad = 2): [number, number][] => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => [
    (i / (values.length - 1)) * w,
    pad + (1 - (v - min) / span) * (h - pad * 2),
  ]);
};

// ---------------------------------------------------------------------------
// sparkline (Consultas realizadas)
// ---------------------------------------------------------------------------
export const Sparkline: React.FC<{
  values?: number[];
  width?: number;
  height?: number;
  progress?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
}> = ({
  values = [8, 14, 10, 19, 15, 24, 18, 28, 22, 34, 30, 42],
  width = 220,
  height = 62,
  progress = 1,
  color = C.blue,
  fill = true,
  strokeWidth = 3,
}) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const pts = toPoints(values, width, height, 4);
  const d = catmullPath(pts);
  const len = width * 1.7;
  const headX = width * progress;
  const headY = pts.reduce(
    (best, p) => (Math.abs(p[0] - headX) < Math.abs(best[0] - headX) ? p : best),
    pts[0],
  )[1];
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`sf-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.42} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <clipPath id={`sc-${id}`}>
          <rect x="0" y="-20" width={width * progress} height={height + 40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#sc-${id})`}>
        {fill && (
          <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill={`url(#sf-${id})`} />
        )}
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - Math.min(1, progress * 1.05))}
        />
      </g>
      {progress > 0.04 && progress < 0.999 && (
        <circle cx={headX} cy={headY} r={4} fill={C.white} stroke={color} strokeWidth={2.5} />
      )}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// barras (Taxa de sucesso)
// ---------------------------------------------------------------------------
export const MiniBars: React.FC<{
  values?: number[];
  width?: number;
  height?: number;
  progress?: number;
  color?: string;
  gap?: number;
}> = ({
  values = [0.18, 0.26, 0.3, 0.42, 0.36, 0.5, 0.58, 0.52, 0.68, 0.78, 0.9, 1],
  width = 220,
  height = 62,
  progress = 1,
  color = C.blue,
  gap = 5,
}) => {
  const bw = (width - gap * (values.length - 1)) / values.length;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {values.map((v, i) => {
        // cada barra entra em sequência (stagger interno)
        const local = Math.max(0, Math.min(1, progress * values.length - i * 0.72));
        const h = v * height * local;
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={height - h}
            width={bw}
            height={h}
            rx={Math.min(3, bw / 2)}
            fill={i >= values.length - 3 ? C.blueSoft : color}
            opacity={0.55 + 0.45 * local}
          />
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// linha de tendência com seta (Tempo médio)
// ---------------------------------------------------------------------------
export const TrendLine: React.FC<{
  width?: number;
  height?: number;
  progress?: number;
  color?: string;
}> = ({ width = 220, height = 62, progress = 1, color = C.green }) => {
  const pts: [number, number][] = [
    [0, 46],
    [34, 40],
    [66, 47],
    [98, 30],
    [130, 36],
    [162, 20],
    [196, 10],
  ];
  const scaled = pts.map(([x, y]) => [
    (x / 196) * (width - 18),
    (y / 52) * (height - 12) + 4,
  ]) as [number, number][];
  const d = catmullPath(scaled);
  const len = width * 1.8;
  const tip = scaled[scaled.length - 1];
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - progress)}
      />
      <g
        opacity={progress > 0.9 ? (progress - 0.9) / 0.1 : 0}
        transform={`translate(${tip[0]} ${tip[1]})`}
      >
        <path
          d="M -11 6 L 0 -4 L 11 6"
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="rotate(28)"
        />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------
// área — Consultas nos últimos 7 dias
// ---------------------------------------------------------------------------
export const AreaChart: React.FC<{
  values?: number[];
  width?: number;
  height?: number;
  progress?: number;
  labels?: string[];
  labelSize?: number;
}> = ({
  values = [22, 34, 66, 40, 58, 76, 44, 70, 96],
  width = 470,
  height = 190,
  progress = 1,
  labels,
  labelSize = 19,
}) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const chartH = labels ? height - 34 : height;
  const pts = toPoints(values, width, chartH, 10);
  const d = catmullPath(pts);
  const len = width * 2;
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`af-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.blue} stopOpacity={0.52} />
          <stop offset="0.7" stopColor={C.blue} stopOpacity={0.08} />
          <stop offset="1" stopColor={C.blue} stopOpacity={0} />
        </linearGradient>
        <clipPath id={`ac-${id}`}>
          <rect x="-4" y="-30" width={(width + 8) * progress} height={height + 60} />
        </clipPath>
      </defs>
      <g clipPath={`url(#ac-${id})`}>
        <path d={`${d} L ${width} ${chartH} L 0 ${chartH} Z`} fill={`url(#af-${id})`} />
        <path
          d={d}
          fill="none"
          stroke={C.blueSoft}
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - Math.min(1, progress * 1.03))}
        />
      </g>
      {labels && (
        <g>
          {labels.map((l, i) => {
            const x = (i / (labels.length - 1)) * (width - 40) + 8;
            const on = progress > (i / labels.length) * 0.9 + 0.05;
            return (
              <text
                key={l}
                x={x}
                y={height - 6}
                fill="rgba(190,205,235,0.6)"
                fontFamily={fontFamily}
                fontSize={labelSize}
                fontWeight={FW.regular}
                opacity={on ? 1 : 0}
              >
                {l}
              </text>
            );
          })}
        </g>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// donut + legenda
// ---------------------------------------------------------------------------
export const Donut: React.FC<{
  data: { label: string; color: string; value: number }[];
  size?: number;
  thickness?: number;
  progress?: number;
  center?: React.ReactNode;
}> = ({ data, size = 168, thickness = 30, progress = 1, center }) => {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((a, b) => a + b.value, 0);
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={thickness}
        />
        {data.map((d) => {
          const frac = d.value / total;
          const start = acc;
          acc += frac;
          const shown = Math.max(0, Math.min(frac, progress - start));
          if (shown <= 0) return null;
          return (
            <circle
              key={d.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeLinecap="butt"
              strokeDasharray={`${shown * circ} ${circ}`}
              strokeDashoffset={-start * circ}
            />
          );
        })}
      </svg>
      {center && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {center}
        </div>
      )}
    </div>
  );
};

export const DonutLegend: React.FC<{
  data: { label: string; color: string }[];
  fontSize?: number;
  progress?: number;
}> = ({ data, fontSize = 21, progress = 1 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: fontSize * 0.55 }}>
    {data.map((d, i) => {
      const on = Math.max(0, Math.min(1, progress * data.length - i));
      return (
        <div
          key={d.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            opacity: on,
            transform: `translateX(${(1 - on) * 14}px)`,
          }}
        >
          <div
            style={{
              width: fontSize * 0.62,
              height: fontSize * 0.62,
              borderRadius: 4,
              background: d.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily,
              fontSize,
              fontWeight: FW.regular,
              color: "rgba(214,226,250,0.9)",
              whiteSpace: "nowrap",
            }}
          >
            {d.label}
          </span>
        </div>
      );
    })}
  </div>
);
