"use client";

import { Player } from "@remotion/player";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type SalesChartPoint = {
  day: string;
  value: number;
};

export type PaymentChartPoint = {
  name: string;
  color: string;
  value: number;
};

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const compactBrl = (value: number) => {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(".", ",")}k`;
  return `R$ ${Math.round(value)}`;
};

type Point = { x: number; y: number };

const smoothPath = (points: Point[]) => {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const middleX = (current.x + next.x) / 2;
    path += ` C ${middleX} ${current.y}, ${middleX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
};

function SalesLineComposition({ data }: { data: SalesChartPoint[] }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const left = 74;
  const right = 24;
  const top = 28;
  const bottom = 48;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const baseline = top + chartHeight;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const roundedMax = Math.max(100, Math.ceil(maxValue / 100) * 100);

  const rise = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 78, mass: 0.85 },
  });
  const reveal = interpolate(frame, [5, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const realPoints = data.map((item, index) => {
    const x = left + (chartWidth * index) / Math.max(1, data.length - 1);
    const targetY = baseline - (item.value / roundedMax) * chartHeight;
    const y = baseline - (baseline - targetY) * rise;
    return { x, y };
  });

  const linePath = smoothPath(realPoints);
  const areaPath = `${linePath} L ${left + chartWidth} ${baseline} L ${left} ${baseline} Z`;
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) => roundedMax * ratio);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const last = data[data.length - 1]?.value ?? 0;
  const previous = data[data.length - 2]?.value ?? last;
  const variation = previous > 0 ? ((last - previous) / previous) * 100 : last > 0 ? 100 : 0;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,247,243,.55) 100%)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="salesLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff8a3d" />
            <stop offset="58%" stopColor="#ff5a1f" />
            <stop offset="100%" stopColor="#e7470d" />
          </linearGradient>
          <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5a1f" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#ff5a1f" stopOpacity="0" />
          </linearGradient>
          <filter id="lineShadow" x="-20%" y="-30%" width="140%" height="170%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#ff5a1f" floodOpacity="0.22" />
          </filter>
          <clipPath id="lineReveal">
            <rect x={left - 6} y={top - 12} width={(chartWidth + 18) * reveal} height={chartHeight + 28} rx="12" />
          </clipPath>
        </defs>

        {gridValues.map((value) => {
          const y = baseline - (value / roundedMax) * chartHeight;
          return (
            <g key={value}>
              <line x1={left} x2={left + chartWidth} y1={y} y2={y} stroke="#eceff2" strokeWidth="1" />
              <text x={left - 12} y={y + 4} textAnchor="end" fill="#8a8f98" fontSize="12" fontWeight="600">
                {compactBrl(value)}
              </text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const x = left + (chartWidth * index) / Math.max(1, data.length - 1);
          return (
            <text key={item.day} x={x} y={height - 15} textAnchor="middle" fill="#7a7f87" fontSize="12" fontWeight="600">
              {item.day}
            </text>
          );
        })}

        <g clipPath="url(#lineReveal)">
          <path d={areaPath} fill="url(#salesArea)" opacity={0.96} />
          <path
            d={linePath}
            fill="none"
            stroke="url(#salesLine)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lineShadow)"
          />

          {realPoints.map((point, index) => {
            const threshold = index / Math.max(1, realPoints.length - 1);
            const visible = interpolate(reveal, [threshold - 0.04, threshold + 0.04], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <g key={`${point.x}-${index}`} opacity={visible}>
                <circle cx={point.x} cy={point.y} r="8" fill="#fff" stroke="#ff5a1f" strokeWidth="3" />
                <circle cx={point.x} cy={point.y} r="3" fill="#ff5a1f" />
              </g>
            );
          })}
        </g>

        <g opacity={interpolate(frame, [18, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
          <rect x={width - 210} y={14} width="184" height="50" rx="14" fill="#fff" stroke="#f1f1f1" />
          <text x={width - 194} y={34} fill="#8a8f98" fontSize="11" fontWeight="700">TOTAL • 7 DIAS</text>
          <text x={width - 194} y={53} fill="#111827" fontSize="16" fontWeight="800">{brl(total)}</text>
          <text x={width - 43} y={53} textAnchor="end" fill={variation >= 0 ? "#15803d" : "#dc2626"} fontSize="12" fontWeight="800">
            {variation >= 0 ? "+" : ""}{variation.toFixed(1).replace(".", ",")}%
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
}

function PaymentDonutComposition({ data }: { data: PaymentChartPoint[] }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.28;
  const strokeWidth = Math.min(width, height) * 0.105;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const safeTotal = total || 1;

  const entrance = spring({
    frame,
    fps,
    config: { damping: 17, stiffness: 82, mass: 0.85 },
  });
  const scale = interpolate(entrance, [0, 1], [0.88, 1]);

  let offset = 0;

  return (
    <AbsoluteFill style={{ fontFamily: "Arial, Helvetica, sans-serif", backgroundColor: "transparent" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="donutShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#111827" floodOpacity="0.10" />
          </filter>
        </defs>

        <g transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`} filter="url(#donutShadow)">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f3f5" strokeWidth={strokeWidth} />

          {data.map((item, index) => {
            const ratio = item.value / safeTotal;
            const fullArc = circumference * ratio;
            const segmentProgress = spring({
              frame: Math.max(0, frame - index * 5),
              fps,
              config: { damping: 18, stiffness: 90, mass: 0.75 },
            });
            const gap = total > 0 ? 4 : 0;
            const arc = Math.max(0, fullArc * segmentProgress - gap);
            const dashOffset = -offset;
            offset += fullArc;

            return (
              <circle
                key={item.name}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${arc} ${Math.max(0, circumference - arc)}`}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
          })}
        </g>

        <circle cx={cx} cy={cy} r={radius - strokeWidth * 0.7} fill="#fff" />
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#8a8f98" fontSize="13" fontWeight="700">
          RECEBIDO
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#111827" fontSize="19" fontWeight="900">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          }).format(total / 100)}
        </text>
      </svg>
    </AbsoluteFill>
  );
}

export function ProfessionalSalesChart({ data }: { data: SalesChartPoint[] }) {
  return (
    <Player
      component={SalesLineComposition}
      inputProps={{ data }}
      durationInFrames={110}
      compositionWidth={900}
      compositionHeight={300}
      fps={30}
      autoPlay
      controls={false}
      loop={false}
      style={{ width: "100%", height: "100%", borderRadius: 16, overflow: "hidden" }}
    />
  );
}

export function ProfessionalPaymentDonut({ data }: { data: PaymentChartPoint[] }) {
  return (
    <Player
      component={PaymentDonutComposition}
      inputProps={{ data }}
      durationInFrames={100}
      compositionWidth={320}
      compositionHeight={320}
      fps={30}
      autoPlay
      controls={false}
      loop={false}
      style={{ width: "100%", height: "100%", borderRadius: 999, overflow: "hidden" }}
    />
  );
}
