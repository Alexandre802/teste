import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Layer } from "../components/Layer";
import { Logo } from "../components/Logo";
import { NumberText } from "../components/Text";
import { smoothPath } from "../components/Charts";
import { useProgress, useSpringIn } from "../components/anim";
import { COLORS, FONT, SPRING, hexA } from "../config/theme";
import { COPY } from "../config/copy";
import type { SceneConfig } from "../config/scenes";
import { SceneShell } from "./shell";

const S = COPY.s5;

const CHART = { x: 0, y: 1040, w: 1080, h: 800 };
const DRAW_START = 88;
const DRAW_LEN = 92;

/** Cena 5 — "Foi pensando nisso que nasceu a Monttra." (cena escura) */
export const Scene05: FC<{ cfg: SceneConfig }> = ({ cfg }) => (
  <SceneShell cfg={cfg} dark>
    <AbsoluteFill>
      <Layer x={72} y={84} enter={{ delay: 0, x: -70 }}>
        <Logo size={60} delay={1} onDark />
      </Layer>

      {/* blocos da frase */}
      <Layer x={140} y={268} w={800} enter={{ delay: 2, x: -110, scale: 0.92, blur: 8, config: SPRING.pop }}>
        <PhraseBox size={104}>{S.lines[0]}</PhraseBox>
      </Layer>
      <Layer x={228} y={418} w={716} enter={{ delay: 32, x: 120, scale: 0.92, blur: 8, config: SPRING.pop }}>
        <PhraseBox size={104}>{S.lines[1]}</PhraseBox>
      </Layer>
      <Layer x={244} y={572} w={664} enter={{ delay: 46, x: -110, scale: 0.92, blur: 8, config: SPRING.pop }}>
        <PhraseBox size={104}>{S.lines[2]}</PhraseBox>
      </Layer>
      <Layer x={228} y={730} w={700} enter={{ delay: 60, y: 60, scale: 0.84, blur: 12, config: SPRING.bouncy }}>
        <PhraseBox size={118} brand>
          {S.lines[3]}
        </PhraseBox>
      </Layer>

      {/* subtítulo em duas pílulas */}
      <Layer x={214} y={946} w={660} enter={{ delay: 76, y: 30 }}>
        <PhraseBox size={38} soft>
          {S.sub[0]}
        </PhraseBox>
      </Layer>
      <Layer x={300} y={1022} w={490} enter={{ delay: 84, y: 30 }}>
        <PhraseBox size={38} soft>
          {S.sub[1]}
        </PhraseBox>
      </Layer>

      <PerformanceChart />
    </AbsoluteFill>
  </SceneShell>
);

const PhraseBox: FC<{ children: string; size: number; brand?: boolean; soft?: boolean }> = ({
  children,
  size,
  brand = false,
  soft = false,
}) => (
  <div
    style={{
      background: brand
        ? `linear-gradient(150deg, ${COLORS.greenDeep}, #0B7A4E 60%, #075E3C)`
        : "rgba(255,255,255,0.05)",
      border: `1px solid ${brand ? hexA(COLORS.neon, 0.4) : "rgba(255,255,255,0.09)"}`,
      borderRadius: soft ? 20 : 26,
      padding: soft ? "12px 26px" : `${size * 0.2}px ${size * 0.28}px`,
      textAlign: "center",
      fontFamily: FONT.family,
      fontWeight: soft ? FONT.medium : FONT.black,
      fontSize: size,
      letterSpacing: soft ? 0 : -size * 0.03,
      lineHeight: 1.06,
      color: COLORS.onDark,
      backdropFilter: "blur(10px)",
      boxShadow: brand ? `0 26px 70px ${hexA(COLORS.neon, 0.3)}` : "0 18px 40px rgba(0,0,0,0.45)",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

/** Curva de performance com glow, rótulos de mês e badges por período. */
const PerformanceChart: FC = () => {
  const draw = useProgress(DRAW_START, DRAW_LEN);
  const months = S.points.map((p) => p.value);

  // pontos intermediários criam a ondulação entre os meses
  const series: number[] = [];
  months.forEach((v, i) => {
    series.push(v);
    if (i < months.length - 1) series.push(Math.min(v, months[i + 1]) * 0.93);
  });

  const min = Math.min(...series) - 6;
  const max = Math.max(...series) + 5;
  const padX = 96;
  const pts = series.map((v, i) => ({
    x: padX + (i / (series.length - 1)) * (CHART.w - padX * 2),
    y: CHART.h - 96 - ((v - min) / (max - min)) * (CHART.h - 230),
  }));
  const monthPts = pts.filter((_, i) => i % 2 === 0);
  const d = smoothPath(pts, 0.38);
  const last = pts[pts.length - 1];

  return (
    <div style={{ position: "absolute", left: CHART.x, top: CHART.y, width: CHART.w, height: CHART.h }}>
      <svg width={CHART.w} height={CHART.h} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="s5-stroke" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#0BD07E" />
            <stop offset="55%" stopColor={COLORS.neonSoft} />
            <stop offset="100%" stopColor="#D8FFEE" />
          </linearGradient>
          <linearGradient id="s5-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hexA(COLORS.neon, 0.34)} />
            <stop offset="100%" stopColor={hexA(COLORS.neon, 0)} />
          </linearGradient>
          <filter id="s5-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="s5-clip">
            <rect x={-40} y={-200} width={(CHART.w + 80) * draw} height={CHART.h + 400} />
          </clipPath>
        </defs>

        {/* grades verticais */}
        {monthPts.map((p, i) => (
          <line
            key={i}
            x1={p.x}
            x2={p.x}
            y1={0}
            y2={CHART.h - 86}
            stroke={hexA(COLORS.neon, 0.08)}
            strokeWidth={1.5}
          />
        ))}

        <path d={`${d} L ${last.x} ${CHART.h - 86} L ${pts[0].x} ${CHART.h - 86} Z`} fill="url(#s5-fill)" clipPath="url(#s5-clip)" />
        <path
          d={d}
          fill="none"
          stroke="url(#s5-stroke)"
          strokeWidth={9}
          strokeLinecap="round"
          filter="url(#s5-glow)"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />

        {/* seta final */}
        <g
          opacity={interpolate(draw, [0.92, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          transform={`translate(${last.x + 20} ${last.y - 30})`}
          filter="url(#s5-glow)"
        >
          <path
            d="M -16 24 L 20 -12 M 20 -12 H 2 M 20 -12 V 6"
            stroke="#D8FFEE"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {monthPts.map((p, i) => (
          <MonthDot key={i} x={p.x} y={p.y} delay={DRAW_START + (i / monthPts.length) * DRAW_LEN} />
        ))}

        {monthPts.map((p, i) => (
          <text
            key={`lab-${i}`}
            x={p.x}
            y={CHART.h - 46}
            textAnchor="middle"
            fontFamily={FONT.family}
            fontSize={26}
            fontWeight={FONT.semi}
            fill={hexA(COLORS.onDarkMuted, 0.75)}
            opacity={interpolate(draw, [i / monthPts.length, i / monthPts.length + 0.12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          >
            {S.points[i].label}
          </text>
        ))}
      </svg>

      {/* badges de período */}
      {S.badgeAt.map((idx, n) => (
        <Badge
          key={idx}
          x={monthPts[idx].x}
          y={monthPts[idx].y}
          label={S.points[idx].label}
          value={S.points[idx].value}
          delay={104 + n * 24}
        />
      ))}

      {/* badge de performance acumulada */}
      <TotalBadge />
    </div>
  );
};

const MonthDot: FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const p = useSpringIn(delay, SPRING.pop);
  return (
    <>
      <circle cx={x} cy={y} r={20 * p} fill={hexA(COLORS.neon, 0.25)} />
      <circle cx={x} cy={y} r={9 * p} fill="#EAFFF5" />
    </>
  );
};

const Badge: FC<{ x: number; y: number; label: string; value: number; delay: number }> = ({
  x,
  y,
  label,
  value,
  delay,
}) => {
  const p = useSpringIn(delay, SPRING.pop);
  // mantém o badge inteiro dentro da tela mesmo nos pontos das pontas
  const left = Math.min(Math.max(x, 108), CHART.w - 108);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: y - 138,
        transform: `translate(-50%, ${interpolate(p, [0, 1], [26, 0]).toFixed(1)}px) scale(${(0.8 + 0.2 * p).toFixed(3)})`,
        opacity: p,
        background: "rgba(6,20,15,0.82)",
        border: `1px solid ${hexA(COLORS.neon, 0.35)}`,
        borderRadius: 18,
        padding: "14px 22px",
        textAlign: "center",
        backdropFilter: "blur(8px)",
        boxShadow: `0 12px 30px ${hexA(COLORS.neon, 0.16)}`,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ fontFamily: FONT.family, fontSize: 24, fontWeight: FONT.semi, color: COLORS.onDarkMuted }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT.family, fontSize: 34, fontWeight: FONT.bold, color: COLORS.neon, marginTop: 2 }}>
        <NumberText value={value} decimals={1} suffix="%" delay={delay + 2} duration={22} signed />
      </div>
    </div>
  );
};

const TotalBadge: FC = () => {
  const p = useSpringIn(172, SPRING.bouncy);
  return (
    <div
      style={{
        position: "absolute",
        right: 54,
        top: 470,
        transform: `scale(${(0.78 + 0.22 * p).toFixed(3)})`,
        opacity: p,
        background: "rgba(6,20,15,0.9)",
        border: `1px solid ${hexA(COLORS.neon, 0.4)}`,
        borderRadius: 24,
        padding: "22px 30px",
        textAlign: "center",
        backdropFilter: "blur(10px)",
        boxShadow: `0 20px 50px ${hexA(COLORS.neon, 0.22)}`,
      }}
    >
      {S.total.label.map((l) => (
        <div
          key={l}
          style={{
            fontFamily: FONT.family,
            fontSize: 24,
            fontWeight: FONT.semi,
            letterSpacing: 1.2,
            color: COLORS.onDarkMuted,
          }}
        >
          {l}
        </div>
      ))}
      <div style={{ fontFamily: FONT.family, fontSize: 56, fontWeight: FONT.black, color: COLORS.neon, marginTop: 8 }}>
        <NumberText value={S.total.value} decimals={1} suffix="%" delay={174} duration={26} signed />
      </div>
      <div
        style={{
          fontFamily: FONT.family,
          fontSize: 22,
          fontWeight: FONT.medium,
          letterSpacing: 1.4,
          color: COLORS.onDarkMuted,
          marginTop: 6,
        }}
      >
        {S.total.note}
      </div>
    </div>
  );
};
