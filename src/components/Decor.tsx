/**
 * Elementos decorativos das telas (asterisco, swooshes, anéis, grids de pontos,
 * setas curvas, ampulheta, brilhos). Cada um é uma camada independente e
 * animável.
 */
import React from "react";
import { C } from "../config/theme";

/** Asterisco/estrela azul do canto inferior esquerdo das telas escuras. */
export const Asterisk: React.FC<{
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  arms?: number;
}> = ({ size = 320, color = C.blue, style, arms = 6 }) => {
  const paths = Array.from({ length: arms }).map((_, i) => {
    const a = (i / arms) * Math.PI * 2;
    const w = 0.26;
    const pts = [
      [Math.cos(a) * 0.5, Math.sin(a) * 0.5],
      [Math.cos(a + w) * 0.14, Math.sin(a + w) * 0.14],
      [Math.cos(a + Math.PI - w) * 0.14, Math.sin(a + Math.PI - w) * 0.14],
      [Math.cos(a + Math.PI) * 0.5, Math.sin(a + Math.PI) * 0.5],
      [Math.cos(a + Math.PI + w) * 0.14, Math.sin(a + Math.PI + w) * 0.14],
      [Math.cos(a - w) * 0.14, Math.sin(a - w) * 0.14],
    ]
      .map(([x, y]) => `${(x + 0.5) * 100},${(y + 0.5) * 100}`)
      .join(" ");
    return <polygon key={i} points={pts} fill={color} />;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", ...style }}>
      {paths}
    </svg>
  );
};

/** Faixa azul curva (swoosh) que atravessa o fundo. */
export const Swoosh: React.FC<{
  width?: number;
  height?: number;
  color?: string;
  thickness?: number;
  style?: React.CSSProperties;
  opacity?: number;
  progress?: number;
  flip?: boolean;
}> = ({
  width = 900,
  height = 900,
  color = C.blue,
  thickness = 120,
  style,
  opacity = 1,
  progress = 1,
  flip = false,
}) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const d = flip
    ? "M -80 860 C 250 760, 430 520, 396 210 C 380 90, 340 30, 300 -30"
    : "M 940 -40 C 700 220, 520 380, 520 640 C 520 820, 620 940, 720 1020";
  const len = 2400;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 900 900"
      style={{ display: "block", overflow: "visible", opacity, ...style }}
    >
      <defs>
        <linearGradient id={`sw-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.15} />
          <stop offset="0.5" stopColor={color} stopOpacity={1} />
          <stop offset="1" stopColor={color} stopOpacity={0.35} />
        </linearGradient>
      </defs>
      <path
        d={d}
        stroke={`url(#sw-${id})`}
        strokeWidth={thickness}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - progress)}
      />
    </svg>
  );
};

/** Anel/círculo azul cheio parcialmente visível (canto inferior esquerdo 5/8). */
export const BlueRing: React.FC<{
  size?: number;
  thickness?: number;
  color?: string;
  style?: React.CSSProperties;
  progress?: number;
  opacity?: number;
}> = ({ size = 520, thickness = 90, color = C.blueDeep, style, progress = 1, opacity = 1 }) => {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      style={{ display: "block", transform: "rotate(-90deg)", opacity, ...style }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={`${circ * progress} ${circ}`}
      />
    </svg>
  );
};

/** Grid de pontos suaves (tela clara). */
export const DottedGrid: React.FC<{
  cols?: number;
  rows?: number;
  gap?: number;
  dot?: number;
  color?: string;
  style?: React.CSSProperties;
  opacity?: number;
}> = ({ cols = 5, rows = 5, gap = 22, dot = 5, color = "#C3CCDD", style, opacity = 1 }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${gap}px)`,
      gridTemplateRows: `repeat(${rows}, ${gap}px)`,
      opacity,
      ...style,
    }}
  >
    {Array.from({ length: cols * rows }).map((_, i) => (
      <div
        key={i}
        style={{ width: dot, height: dot, borderRadius: "50%", background: color }}
      />
    ))}
  </div>
);

/** Arcos finos de fundo (tela clara 8/8). */
export const ArcLines: React.FC<{
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  progress?: number;
}> = ({ size = 1200, color = "rgba(27,92,255,0.16)", style, progress = 1 }) => {
  const circ = 2 * Math.PI * 560;
  return (
    <svg width={size} height={size} viewBox="0 0 1200 1200" style={{ display: "block", ...style }}>
      <circle
        cx="600"
        cy="600"
        r="560"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray={`${circ * progress} ${circ}`}
        transform="rotate(-90 600 600)"
      />
      <circle
        cx="600"
        cy="600"
        r="440"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.7}
        strokeDasharray={`${2 * Math.PI * 440 * progress} ${2 * Math.PI * 440}`}
        transform="rotate(-90 600 600)"
      />
    </svg>
  );
};

/** Mancha de brilho (glow) radial. */
export const GlowBlob: React.FC<{
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  opacity?: number;
}> = ({ size = 700, color = "rgba(27,92,255,0.30)", style, opacity = 1 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, rgba(27,92,255,0) 68%)`,
      opacity,
      filter: "blur(10px)",
      ...style,
    }}
  />
);

/** Seta curva azul (aponta para elementos). */
export const CurvedArrow: React.FC<{
  width?: number;
  height?: number;
  color?: string;
  progress?: number;
  style?: React.CSSProperties;
  thickness?: number;
  variant?: "downRight" | "upRight" | "up";
}> = ({
  width = 240,
  height = 200,
  color = C.blue,
  progress = 1,
  style,
  thickness = 6,
  variant = "downRight",
}) => {
  const paths = {
    downRight: "M 12 18 C 120 22, 196 70, 206 158",
    upRight: "M 16 182 C 60 96, 140 42, 214 26",
    up: "M 18 186 C 30 96, 96 40, 196 24",
  } as const;
  const heads = {
    downRight: { x: 206, y: 168, rot: 96 },
    upRight: { x: 216, y: 24, rot: -28 },
    up: { x: 198, y: 22, rot: -32 },
  } as const;
  const d = paths[variant];
  const h = heads[variant];
  const len = 420;
  const headOn = progress > 0.86 ? (progress - 0.86) / 0.14 : 0;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 230 200"
      style={{ display: "block", overflow: "visible", ...style }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - progress)}
      />
      <g
        transform={`translate(${h.x} ${h.y}) rotate(${h.rot}) scale(${0.6 + 0.4 * headOn})`}
        opacity={headOn}
      >
        <path
          d="M -16 -14 L 0 0 L -16 14"
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

/** Relógio outline azul (tela 2/8). */
export const ClockOutline: React.FC<{
  size?: number;
  color?: string;
  progress?: number;
  handAngle?: number;
  style?: React.CSSProperties;
}> = ({ size = 460, color = C.blue, progress = 1, handAngle = 0, style }) => {
  const circ = 2 * Math.PI * 46;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block", overflow: "visible", ...style }}
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeDasharray={`${circ * progress} ${circ}`}
        transform="rotate(-90 50 50)"
      />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const on = progress > i / 12;
        return (
          <line
            key={i}
            x1={50 + Math.cos(a) * 40}
            y1={50 + Math.sin(a) * 40}
            x2={50 + Math.cos(a) * (i % 3 === 0 ? 33 : 36)}
            y2={50 + Math.sin(a) * (i % 3 === 0 ? 33 : 36)}
            stroke={color}
            strokeWidth={i % 3 === 0 ? 2.2 : 1.4}
            strokeLinecap="round"
            opacity={on ? 1 : 0}
          />
        );
      })}
      <g transform={`rotate(${handAngle} 50 50)`} opacity={progress > 0.5 ? 1 : 0}>
        <line x1="50" y1="50" x2="50" y2="22" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      </g>
      <g transform={`rotate(${handAngle * 12 + 90} 50 50)`} opacity={progress > 0.5 ? 1 : 0}>
        <line x1="50" y1="50" x2="50" y2="30" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      </g>
      <circle cx="50" cy="50" r="2.4" fill={color} opacity={progress > 0.5 ? 1 : 0} />
    </svg>
  );
};

/** Badge triangular arredondado com raio (canto inferior 3/8). */
export const BoltTriangle: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 118,
  style,
}) => (
  <svg
    width={size}
    height={size * 0.92}
    viewBox="0 0 120 110"
    style={{ display: "block", overflow: "visible", ...style }}
  >
    <defs>
      <linearGradient id="bt" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3E77FF" />
        <stop offset="1" stopColor="#0B3AD1" />
      </linearGradient>
    </defs>
    <path
      d="M60 8 C66 8 71 11 74 16 L112 82 C118 93 110 106 97 106 H23 C10 106 2 93 8 82 L46 16 C49 11 54 8 60 8 Z"
      fill="url(#bt)"
      stroke="rgba(255,255,255,0.25)"
      strokeWidth={1.5}
    />
    <path d="M66 38 L48 66 h11 l-3 18 18 -27 H60 z" fill="#fff" />
  </svg>
);

/** Ampulheta de vidro (tela 3/8) reconstruída em vetor + areia animável. */
export const Hourglass: React.FC<{
  width?: number;
  /** 0 = areia toda em cima, 1 = toda embaixo */
  fall?: number;
  style?: React.CSSProperties;
  glow?: number;
}> = ({ width = 560, fall = 0.4, style, glow = 1 }) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const topFill = 1 - fall;
  return (
    <svg
      width={width}
      height={width * 1.62}
      viewBox="0 0 340 550"
      style={{ display: "block", overflow: "visible", ...style }}
    >
      <defs>
        <linearGradient id={`glass-${id}`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#EAF1FF" stopOpacity="0.30" />
          <stop offset="0.28" stopColor="#8FB6FF" stopOpacity="0.13" />
          <stop offset="0.55" stopColor="#12203C" stopOpacity="0.30" />
          <stop offset="1" stopColor="#9CC0FF" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={`cap-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A3550" />
          <stop offset="0.45" stopColor="#0E1526" />
          <stop offset="1" stopColor="#1B2740" />
        </linearGradient>
        <linearGradient id={`sand-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCE5F7" />
          <stop offset="1" stopColor="#93A8CC" />
        </linearGradient>
        <linearGradient id={`spec-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`bulbTop-${id}`}>
          <path d="M62 66 H278 C278 150 210 236 170 262 C130 236 62 150 62 66 Z" />
        </clipPath>
        <clipPath id={`bulbBottom-${id}`}>
          <path d="M170 288 C210 314 278 400 278 484 H62 C62 400 130 314 170 288 Z" />
        </clipPath>
        <filter id={`hg-${id}`} x="-40%" y="-25%" width="180%" height="150%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>

      {glow > 0 && (
        <ellipse
          cx="170"
          cy="275"
          rx="150"
          ry="250"
          fill={C.blue}
          opacity={0.3 * glow}
          filter={`url(#hg-${id})`}
        />
      )}

      {/* areia no bulbo superior */}
      <g clipPath={`url(#bulbTop-${id})`}>
        <rect
          x="52"
          y={66 + (1 - topFill) * 196}
          width="236"
          height={260}
          fill={`url(#sand-${id})`}
          opacity={0.8}
        />
        {/* cone de escoamento */}
        <path
          d={`M 62 ${66 + (1 - topFill) * 196} L 170 ${118 + (1 - topFill) * 196} L 278 ${66 + (1 - topFill) * 196} Z`}
          fill="#050810"
          opacity={0.55}
        />
      </g>

      {/* areia no bulbo inferior */}
      <g clipPath={`url(#bulbBottom-${id})`}>
        <rect
          x="52"
          y={484 - fall * 172}
          width="236"
          height={200}
          fill={`url(#sand-${id})`}
          opacity={0.82}
        />
        <path
          d={`M 92 ${484 - fall * 172} Q 170 ${454 - fall * 172} 248 ${484 - fall * 172} Z`}
          fill={`url(#sand-${id})`}
          opacity={0.82}
        />
      </g>

      {/* fio de areia caindo */}
      {fall > 0.02 && fall < 0.98 && (
        <rect x="167" y="250" width="6" height={236 - fall * 168} fill="#E8EEFC" opacity={0.85} rx="3" />
      )}

      {/* vidro */}
      <path
        d="M62 66 H278 C278 150 210 236 170 275 C210 314 278 400 278 484 H62 C62 400 130 314 170 275 C130 236 62 150 62 66 Z"
        fill={`url(#glass-${id})`}
        stroke="rgba(214,232,255,0.55)"
        strokeWidth="3"
      />
      {/* reflexo */}
      <path
        d="M96 76 C96 150 140 220 164 258"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M240 470 C240 404 206 336 180 300"
        stroke="rgba(255,255,255,0.30)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* tampas */}
      <rect x="34" y="26" width="272" height="44" rx="18" fill={`url(#cap-${id})`} stroke="rgba(190,214,255,0.35)" strokeWidth="2" />
      <rect x="34" y="480" width="272" height="46" rx="18" fill={`url(#cap-${id})`} stroke="rgba(190,214,255,0.35)" strokeWidth="2" />
      <rect x="46" y="32" width="248" height="7" rx="4" fill={`url(#spec-${id})`} />
      <rect x="46" y="486" width="248" height="7" rx="4" fill={`url(#spec-${id})`} />
    </svg>
  );
};
