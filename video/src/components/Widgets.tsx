/**
 * Widgets de dados: contador, gráfico que se desenha, escudo com check
 * e o pódio de neon. Todos animam por partes, nunca como imagem única.
 */
import React, { useId } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { BODY, DISPLAY } from "../lib/fonts";
import { EASE, map, spr, tween } from "../lib/anim";

/* ── contador progressivo ─────────────────────────────────────────── */

const brl = (n: number, decimals: number) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const Counter: React.FC<{
  from?: number;
  to: number;
  at?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  size?: number;
  color?: string;
  glow?: string;
  style?: React.CSSProperties;
}> = ({
  from = 0,
  to,
  at = 0,
  duration = 55,
  decimals = 2,
  prefix = "R$ ",
  suffix = "",
  size = 96,
  color = COLORS.white,
  glow,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = tween(frame, at, at + duration, { ease: EASE.outExpo });
  const value = map(p, from, to);
  // pequeno "pulo" a cada avanço, para o número não parecer estático
  const kick = 1 + Math.max(0, 1 - (frame - at) / 8) * 0.12;

  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: "-0.03em",
        color,
        fontVariantNumeric: "tabular-nums",
        transform: `scale(${p > 0 ? kick : 0.9})`,
        opacity: p > 0 ? 1 : 0,
        textShadow: glow ? `0 0 ${size * 0.35}px ${glow}` : undefined,
        ...style,
      }}
    >
      {prefix}
      {brl(value, decimals)}
      {suffix}
    </div>
  );
};

/* ── gráfico que cresce ───────────────────────────────────────────── */

export const GrowthChart: React.FC<{
  width: number;
  height: number;
  at?: number;
  duration?: number;
  color?: string;
  /** Série normalizada 0→1. */
  points?: number[];
  showBars?: boolean;
}> = ({
  width,
  height,
  at = 0,
  duration = 60,
  color = COLORS.neonHot,
  points = [0.06, 0.14, 0.11, 0.26, 0.34, 0.3, 0.48, 0.62, 0.58, 0.78, 0.92, 1],
  showBars = true,
}) => {
  const frame = useCurrentFrame();
  const id = useId();
  const p = tween(frame, at, at + duration, { ease: EASE.outQuint });

  const padX = width * 0.04;
  const padY = height * 0.1;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const coords = points.map((v, i) => ({
    x: padX + (innerW * i) / (points.length - 1),
    y: padY + innerH * (1 - v),
  }));

  // curva suave por catmull-rom aproximado
  const line = coords.reduce((d, c, i, arr) => {
    if (i === 0) return `M ${c.x} ${c.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + c.x) / 2;
    return `${d} C ${cx} ${prev.y}, ${cx} ${c.y}, ${c.x} ${c.y}`;
  }, "");

  const pathLen = innerW * 1.35;
  const headIdx = Math.min(points.length - 1, Math.floor(p * (points.length - 1)));
  const head = coords[headIdx];

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.42" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`reveal-${id}`}>
          <rect x="0" y="0" width={padX + innerW * p} height={height} />
        </clipPath>
        <filter id={`glow-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* grade */}
      {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
        <line
          key={i}
          x1={padX}
          x2={padX + innerW}
          y1={padY + innerH * g}
          y2={padY + innerH * g}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1.5"
          strokeDasharray="6 10"
          opacity={tween(frame, at - 8 + i * 3, at + 8 + i * 3)}
        />
      ))}

      {/* barras */}
      {showBars &&
        coords.map((c, i) => {
          const bp = spr(frame, at + i * 2.2, "snappy");
          const h = (padY + innerH - c.y) * bp;
          return (
            <rect
              key={i}
              x={c.x - innerW / (points.length * 3.4)}
              y={padY + innerH - h}
              width={(innerW / points.length) * 0.5}
              height={Math.max(0, h)}
              rx={innerW / (points.length * 6)}
              fill={color}
              opacity={0.16}
            />
          );
        })}

      <g clipPath={`url(#reveal-${id})`}>
        <path
          d={`${line} L ${coords[coords.length - 1].x} ${padY + innerH} L ${padX} ${
            padY + innerH
          } Z`}
          fill={`url(#fill-${id})`}
        />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={height * 0.022}
          strokeLinecap="round"
          strokeDasharray={pathLen}
          strokeDashoffset={pathLen * (1 - p)}
          filter={`url(#glow-${id})`}
        />
      </g>

      {/* ponto que corre na ponta da linha */}
      {p > 0.02 && p < 1.001 ? (
        <circle
          cx={interpolate(p, [0, 1], [coords[0].x, coords[coords.length - 1].x])}
          cy={head.y}
          r={height * 0.028}
          fill={COLORS.white}
          filter={`url(#glow-${id})`}
        />
      ) : null}
    </svg>
  );
};

/* ── escudo + check ───────────────────────────────────────────────── */

export const ShieldCheck: React.FC<{
  size?: number;
  at?: number;
  color?: string;
  accent?: string;
}> = ({ size = 420, at = 0, color = COLORS.neonHot, accent = COLORS.success }) => {
  const frame = useCurrentFrame();
  const id = useId();

  // o contorno se desenha, o corpo preenche depois, o check bate por último
  const draw = tween(frame, at, at + 30, { ease: EASE.outQuint });
  const fill = tween(frame, at + 18, at + 40, { ease: EASE.outExpo });
  const check = spr(frame, at + 34, "punch");
  const ring = tween(frame, at + 34, at + 60, { ease: EASE.outExpo });

  const outline = 620;
  const checkLen = 120;

  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 200 224" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sh-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#B968FF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#4B0F8F" stopOpacity="0.22" />
        </linearGradient>
        <filter id={`shg-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* anel de impacto */}
      {ring > 0 && ring < 1 ? (
        <circle
          cx="100"
          cy="112"
          r={60 + ring * 90}
          fill="none"
          stroke={accent}
          strokeWidth={5 * (1 - ring)}
          opacity={0.7 * (1 - ring)}
        />
      ) : null}

      <path
        d="M100 12 22 46v58c0 44 33 80 78 92 45-12 78-48 78-92V46z"
        fill={`url(#sh-${id})`}
        opacity={fill}
      />
      <path
        d="M100 12 22 46v58c0 44 33 80 78 92 45-12 78-48 78-92V46z"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeDasharray={outline}
        strokeDashoffset={outline * (1 - draw)}
        filter={`url(#shg-${id})`}
      />
      <path
        d="M66 110l24 25 47-52"
        fill="none"
        stroke={accent}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={checkLen}
        strokeDashoffset={checkLen * (1 - Math.min(1, check))}
        filter={`url(#shg-${id})`}
        style={{ transform: `scale(${map(Math.min(1, check), 1.1, 1)})`, transformOrigin: "100px 112px" }}
      />
    </svg>
  );
};

/* ── pódio de neon (referência CE32367F) ──────────────────────────── */

export const NeonPodium: React.FC<{
  width: number;
  at?: number;
  color?: string;
}> = ({ width, at = 0, color = COLORS.neonHot }) => {
  const frame = useCurrentFrame();
  const rise = spr(frame, at, "heavy");
  const h = width * 0.3;
  return (
    <div
      style={{
        position: "relative",
        width,
        height: h,
        transform: `scale(${map(rise, 0.7, 1)})`,
        opacity: rise,
      }}
    >
      {[0, 1, 2].map((i) => {
        const w = width * (1 - i * 0.13);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (width - w) / 2,
              top: h * 0.42 - i * h * 0.19,
              width: w,
              height: w * 0.2,
              borderRadius: "50%",
              background: `linear-gradient(180deg, #3B1E68 0%, #22103F 100%)`,
              boxShadow: `0 0 ${width * 0.05}px rgba(199,125,255,0.45), inset 0 ${
                width * 0.008
              }px 0 rgba(255,255,255,0.25)`,
              border: `${Math.max(2, width * 0.006)}px solid ${color}`,
              filter: `drop-shadow(0 0 ${width * 0.03}px ${color}aa)`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Anel de neon fino, usado como órbita. */
export const NeonRing: React.FC<{
  size: number;
  tiltDeg?: number;
  rotate?: number;
  color?: string;
  opacity?: number;
  thickness?: number;
}> = ({ size, tiltDeg = 74, rotate = 0, color = COLORS.neonHot, opacity = 0.8, thickness = 3 }) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      width: size,
      height: size,
      marginLeft: -size / 2,
      marginTop: -size / 2,
      borderRadius: "50%",
      border: `${thickness}px solid ${color}`,
      opacity,
      transform: `rotateX(${tiltDeg}deg) rotateZ(${rotate}deg)`,
      transformStyle: "preserve-3d",
      boxShadow: `0 0 ${size * 0.06}px ${color}, inset 0 0 ${size * 0.05}px ${color}`,
      pointerEvents: "none",
    }}
  />
);
