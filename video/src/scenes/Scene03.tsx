import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Layer } from "../components/Layer";
import { smoothPath } from "../components/Charts";
import { useProgress, useSpringIn } from "../components/anim";
import { COLORS, FONT, SPRING, brl, hexA } from "../config/theme";
import { COPY } from "../config/copy";
import type { SceneConfig } from "../config/scenes";
import { SceneShell } from "./shell";

const S = COPY.s3;

const CH = { x: 70, y: 1226, w: 950, h: 560 };

/** Cena 3 — "Você até faz dinheiro, mas não enxerga o lucro real." */
export const Scene03: FC<{ cfg: SceneConfig }> = ({ cfg }) => (
  <SceneShell cfg={cfg}>
    <AbsoluteFill>
      <Layer
        x={116}
        y={520}
        w={846}
        enter={{ delay: 1, y: 70, scale: 0.9, blur: 10, config: SPRING.pop }}
      >
        <Box bg={COLORS.pale} color={COLORS.greenInk} size={112} pad="46px 40px">
          {S.lines[0].text}
        </Box>
      </Layer>

      <Layer
        x={104}
        y={790}
        w={870}
        enter={{ delay: 26, y: 80, scale: 0.88, blur: 12, config: SPRING.pop }}
      >
        <Box bg={COLORS.greenInk} color={COLORS.greenBright} size={118} pad="46px 40px" glow>
          {S.lines[1].text}
        </Box>
      </Layer>

      <Layer
        x={104}
        y={1064}
        w={870}
        enter={{ delay: 44, y: 70, scale: 0.9, blur: 10, config: SPRING.pop }}
      >
        <Box bg={COLORS.pale} color={COLORS.greenInk} size={60} pad="40px 34px">
          {S.lines[2].text}
        </Box>
      </Layer>

      <Layer x={CH.x} y={CH.y} enter={{ fade: false }}>
        <GrowthChart />
      </Layer>
    </AbsoluteFill>
  </SceneShell>
);

const Box: FC<{
  bg: string;
  color: string;
  size: number;
  pad: string;
  glow?: boolean;
  children: string;
}> = ({ bg, color, size, pad, glow = false, children }) => (
  <div
    style={{
      background: bg,
      color,
      borderRadius: 34,
      padding: pad,
      fontFamily: FONT.family,
      fontWeight: FONT.black,
      fontSize: size,
      letterSpacing: -size * 0.035,
      lineHeight: 1,
      textAlign: "center",
      boxShadow: glow ? `0 26px 60px ${hexA(COLORS.greenInk, 0.34)}` : "none",
    }}
  >
    {children}
  </div>
);

/** Curva de crescimento desenhada da esquerda para a direita, com rótulos que aparecem em cada ponto. */
const GrowthChart: FC = () => {
  const draw = useProgress(62, 78);
  const values = S.chart.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padTop = 120;
  const usable = CH.h - padTop - 60;
  const pts = values.map((v, i) => ({
    x: 68 + (i / (values.length - 1)) * (CH.w - 176),
    y: padTop + usable - ((v - min) / (max - min)) * usable,
  }));
  const d = smoothPath(pts, 0.4);
  const last = pts[pts.length - 1];

  return (
    <div style={{ position: "relative", width: CH.w, height: CH.h }}>
      <svg width={CH.w} height={CH.h} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="s3-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hexA(COLORS.green, 0.22)} />
            <stop offset="100%" stopColor={hexA(COLORS.green, 0)} />
          </linearGradient>
          <clipPath id="s3-clip">
            <rect x={-40} y={-140} width={(CH.w + 80) * draw} height={CH.h + 200} />
          </clipPath>
        </defs>
        <path d={`${d} L ${last.x} ${CH.h} L 0 ${CH.h} Z`} fill="url(#s3-fill)" clipPath="url(#s3-clip)" />
        <path
          d={d}
          fill="none"
          stroke={COLORS.green}
          strokeWidth={7}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        {/* seta final */}
        <g
          opacity={interpolate(draw, [0.9, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          transform={`translate(${last.x + 26} ${last.y - 34})`}
        >
          <path
            d="M -18 26 L 22 -14 M 22 -14 H 2 M 22 -14 V 6"
            stroke={COLORS.green}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
        {pts.map((p, i) => (
          <Dot key={i} x={p.x} y={p.y} delay={64 + i * 10} />
        ))}
      </svg>

      {S.chart.map((c, i) => (
        <PointLabel
          key={c.label}
          x={pts[i].x}
          y={pts[i].y}
          label={c.label}
          value={c.value}
          delay={64 + i * 10}
          /* o último rótulo desloca para a esquerda para não bater na seta */
          shift={i === S.chart.length - 1 ? -82 : -50}
        />
      ))}
    </div>
  );
};

const Dot: FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const p = useSpringIn(delay, SPRING.pop);
  return <circle cx={x} cy={y} r={11 * p} fill={COLORS.green} />;
};

const PointLabel: FC<{
  x: number;
  y: number;
  label: string;
  value: number;
  delay: number;
  shift: number;
}> = ({ x, y, label, value, delay, shift }) => {
  const p = useSpringIn(delay + 2, SPRING.snappy);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - 112,
        transform: `translate(${shift}%, ${interpolate(p, [0, 1], [16, 0]).toFixed(1)}px)`,
        opacity: p,
        textAlign: "center",
        fontFamily: FONT.family,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ fontSize: 27, fontWeight: FONT.bold, color: COLORS.green }}>{label}</div>
      <div style={{ fontSize: 29, fontWeight: FONT.bold, color: COLORS.greenInk, marginTop: 3 }}>
        R$ {brl(value, 0)}
      </div>
    </div>
  );
};
