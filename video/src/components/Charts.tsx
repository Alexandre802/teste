import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, EASE } from '../config/theme';
import { prog, tween } from './anim';

export type Pt = [number, number];

/** Catmull-Rom -> cubic bezier, para curvas suaves como nas artes. */
export const smoothPath = (pts: Pt[], tension = 0.42): string => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};

export const polyPath = (pts: Pt[]): string =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

/**
 * Grafico de linha que se desenha, com area preenchida, nos que
 * aparecem em stagger e rotulos por baixo.
 */
export const LineChart: React.FC<{
  points: Pt[];
  width: number;
  height: number;
  delay?: number;
  dur?: number;
  color?: string;
  areaFrom?: string;
  strokeWidth?: number;
  smooth?: boolean;
  nodes?: boolean;
  nodeRadius?: number;
  dashFrom?: number;
  baseline?: number;
  glow?: boolean;
  style?: React.CSSProperties;
  id?: string;
}> = ({
  points,
  width,
  height,
  delay = 0,
  dur = 50,
  color = COLORS.green,
  areaFrom = 'rgba(1,146,102,0.20)',
  strokeWidth = 6,
  smooth = true,
  nodes = true,
  nodeRadius = 12,
  dashFrom,
  baseline,
  glow = false,
  style,
  id = 'lc',
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.inOut);
  const base = baseline ?? height;

  const solidPts = dashFrom === undefined ? points : points.slice(0, dashFrom + 1);
  const dashPts = dashFrom === undefined ? [] : points.slice(dashFrom);

  const mk = smooth ? smoothPath : polyPath;
  const dSolid = mk(solidPts);
  const dDash = dashPts.length > 1 ? mk(dashPts) : '';
  const L = 6000;

  const solidShare = dashFrom === undefined ? 1 : 0.68;
  const pSolid = Math.min(1, p / solidShare);
  const pDash = Math.max(0, (p - solidShare) / (1 - solidShare));

  const area = `${dSolid} L ${solidPts[solidPts.length - 1][0]} ${base} L ${solidPts[0][0]} ${base} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', overflow: 'visible', ...style }}
    >
      <defs>
        <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={areaFrom} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="0" y="-60" width={width * pSolid} height={height + 120} />
        </clipPath>
        {glow && (
          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        <path d={area} fill={`url(#${id}-area)`} />
      </g>

      <path
        d={dSolid}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={L}
        strokeDashoffset={L * (1 - pSolid)}
        filter={glow ? `url(#${id}-glow)` : undefined}
      />

      {dDash && (
        <path
          d={dDash}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${strokeWidth * 2.6} ${strokeWidth * 2.2}`}
          opacity={pDash}
          style={{ strokeDashoffset: -frame * 0.6 }}
        />
      )}

      {nodes &&
        points.map((pt, i) => {
          const share = i / Math.max(1, points.length - 1);
          const local = tween(p, [share * 0.96, share * 0.96 + 0.08], [0, 1], EASE.back);
          const isFuture = dashFrom !== undefined && i > dashFrom;
          return (
            <circle
              key={i}
              cx={pt[0]}
              cy={pt[1]}
              r={nodeRadius * local}
              fill={isFuture ? COLORS.white : color}
              stroke={color}
              strokeWidth={isFuture ? 5 : 0}
            />
          );
        })}
    </svg>
  );
};

/** Barras que crescem a partir da base, com stagger. */
export const GrowBars: React.FC<{
  values: number[];
  width: number;
  height: number;
  delay?: number;
  step?: number;
  gap?: number;
  radius?: number;
  colorTop?: string;
  colorBottom?: string;
  style?: React.CSSProperties;
}> = ({
  values,
  width,
  height,
  delay = 0,
  step = 5,
  gap = 18,
  radius = 16,
  colorTop = COLORS.greenNeon,
  colorBottom = COLORS.green,
  style,
}) => {
  const frame = useCurrentFrame();
  const max = Math.max(...values);
  const bw = (width - gap * (values.length - 1)) / values.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', ...style }}>
      <defs>
        <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorTop} />
          <stop offset="100%" stopColor={colorBottom} />
        </linearGradient>
      </defs>
      {values.map((v, i) => {
        const p = prog(frame, delay + i * step, 26, EASE.out);
        const h = (v / max) * height * p;
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={height - h}
            width={bw}
            height={h}
            rx={radius}
            fill="url(#gb)"
          />
        );
      })}
    </svg>
  );
};

/**
 * Seta curva luminosa da cena "Acompanhe por periodo".
 * Traco + halo + ponta que aparece no fim do desenho.
 */
export const GlowArrow: React.FC<{
  width: number;
  height: number;
  /** A curva passa exatamente por estes pontos (os nós dos meses). */
  points: Pt[];
  /** Ponta da seta, além do último nó. */
  tip: Pt;
  tipAngle?: number;
  delay?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ width, height, points, tip, tipAngle = -58, delay = 0, dur = 60, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.inOut);
  const d = smoothPath([...points, tip], 0.4);
  const L = 4200;
  const head = tween(frame, [delay + dur * 0.86, delay + dur + 8], [0, 1], EASE.back);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', overflow: 'visible', ...style }}>
      <defs>
        <linearGradient id="ga" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#7BFFD6" />
          <stop offset="45%" stopColor={COLORS.greenNeon} />
          <stop offset="100%" stopColor="#04794F" />
        </linearGradient>
        <filter id="gaGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="26" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#gaGlow)" opacity={0.55}>
        <path
          d={d}
          fill="none"
          stroke="url(#ga)"
          strokeWidth={62}
          strokeLinecap="round"
          strokeDasharray={L}
          strokeDashoffset={L * (1 - p)}
        />
      </g>
      <path
        d={d}
        fill="none"
        stroke="url(#ga)"
        strokeWidth={34}
        strokeLinecap="round"
        strokeDasharray={L}
        strokeDashoffset={L * (1 - p)}
      />
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={L}
        strokeDashoffset={L * (1 - p)}
        opacity={0.5}
      />
      <g
        transform={`translate(${tip[0]} ${tip[1]}) rotate(${tipAngle}) scale(${head})`}
        opacity={head}
      >
        <path d="M 0 -52 L 44 38 L 0 18 L -44 38 Z" fill="url(#ga)" />
      </g>
    </svg>
  );
};

/** Barras 3D extrudadas (cena "Tudo em um so lugar"). */
export const IsoBars: React.FC<{
  values: number[];
  width: number;
  height: number;
  delay?: number;
  step?: number;
  gap?: number;
  depth?: number;
  style?: React.CSSProperties;
  opacity?: number;
}> = ({
  values,
  width,
  height,
  delay = 0,
  step = 4,
  gap = 26,
  depth = 26,
  style,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const max = Math.max(...values);
  const bw = (width - gap * (values.length - 1)) / values.length;
  return (
    <svg width={width + depth} height={height + depth} viewBox={`0 0 ${width + depth} ${height + depth}`} style={{ position: 'absolute', overflow: 'visible', opacity, ...style }}>
      <defs>
        <linearGradient id="ib-face" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#8FE9C4" />
          <stop offset="100%" stopColor="#3FCF98" />
        </linearGradient>
        <linearGradient id="ib-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2FB683" />
          <stop offset="100%" stopColor="#1D8F65" />
        </linearGradient>
      </defs>
      {values.map((v, i) => {
        const p = prog(frame, delay + i * step, 30, EASE.out);
        const h = (v / max) * height * p;
        const x = i * (bw + gap);
        const y = height - h + depth;
        if (h < 2) return null;
        return (
          <g key={i}>
            {/* topo */}
            <path
              d={`M ${x} ${y} L ${x + depth} ${y - depth} L ${x + bw + depth} ${y - depth} L ${x + bw} ${y} Z`}
              fill="#B7F2D9"
            />
            {/* lateral */}
            <path
              d={`M ${x + bw} ${y} L ${x + bw + depth} ${y - depth} L ${x + bw + depth} ${y - depth + h} L ${x + bw} ${y + h} Z`}
              fill="url(#ib-side)"
            />
            {/* frente */}
            <rect x={x} y={y} width={bw} height={h} rx={10} fill="url(#ib-face)" />
          </g>
        );
      })}
    </svg>
  );
};

/** Seta 3D em zigue-zague (cena "Tudo em um so lugar"). */
export const IsoArrow: React.FC<{
  width: number;
  height: number;
  delay?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ width, height, delay = 0, dur = 46, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.out);
  const pts: Pt[] = [
    [0, height * 0.86],
    [width * 0.2, height * 0.62],
    [width * 0.36, height * 0.72],
    [width * 0.58, height * 0.4],
    [width * 0.74, height * 0.5],
    [width * 0.95, height * 0.1],
  ];
  const d = polyPath(pts);
  const L = 3200;
  const head = tween(frame, [delay + dur * 0.85, delay + dur + 10], [0, 1], EASE.back);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', overflow: 'visible', ...style }}>
      <defs>
        <linearGradient id="ia-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#5FD9A9" />
          <stop offset="100%" stopColor="#12A870" />
        </linearGradient>
      </defs>
      {/* extrusao */}
      <path
        d={d}
        fill="none"
        stroke="#1C8A61"
        strokeWidth={30}
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeDasharray={L}
        strokeDashoffset={L * (1 - p)}
        transform="translate(9, 11)"
      />
      <path
        d={d}
        fill="none"
        stroke="url(#ia-g)"
        strokeWidth={30}
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeDasharray={L}
        strokeDashoffset={L * (1 - p)}
      />
      <g transform={`translate(${width * 0.95} ${height * 0.1}) rotate(-32) scale(${head})`} opacity={head}>
        <path d="M 0 -54 L 46 40 L 0 20 L -46 40 Z" fill="#1C8A61" transform="translate(9,11)" />
        <path d="M 0 -54 L 46 40 L 0 20 L -46 40 Z" fill="url(#ia-g)" />
      </g>
    </svg>
  );
};
