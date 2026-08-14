import type { CSSProperties, FC } from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../config/theme";
import { useSpringIn } from "./anim";
import { SPRING } from "../config/theme";

const BARS = [
  { h: 0.62, o: 1 },
  { h: 1.0, o: 1 },
  { h: 0.46, o: 0.55 },
  { h: 0.82, o: 0.85 },
];

/** Marca da Monttra: 4 barras em degradê + wordmark. */
export const Logo: FC<{
  size?: number;
  color?: string;
  delay?: number;
  showWordmark?: boolean;
  style?: CSSProperties;
  onDark?: boolean;
}> = ({ size = 62, color, delay = 0, showWordmark = true, style, onDark = false }) => {
  const ink = color ?? (onDark ? COLORS.onDark : COLORS.ink);
  const markW = size * 0.98;
  const gid = onDark ? "logo-grad-dark" : "logo-grad-light";

  const word = useSpringIn(delay + 5, SPRING.smooth);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.3, ...style }}>
      <svg width={markW} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={onDark ? COLORS.neonSoft : COLORS.mint} />
            <stop offset="55%" stopColor={onDark ? COLORS.neon : COLORS.green} />
            <stop offset="100%" stopColor={onDark ? "#0B8F5A" : COLORS.greenDeep} />
          </linearGradient>
        </defs>
        {BARS.map((b, i) => (
          <LogoBar key={i} index={i} h={b.h} o={b.o} gid={gid} delay={delay} />
        ))}
      </svg>

      {showWordmark ? (
        <span
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.black,
            fontSize: size * 0.86,
            letterSpacing: -size * 0.028,
            color: ink,
            opacity: word,
            transform: `translateX(${interpolate(word, [0, 1], [-size * 0.28, 0]).toFixed(2)}px)`,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Monttra
        </span>
      ) : null}
    </div>
  );
};

const LogoBar: FC<{ index: number; h: number; o: number; gid: string; delay: number }> = ({
  index,
  h,
  o,
  gid,
  delay,
}) => {
  const p = useSpringIn(delay + index * 3, SPRING.pop);
  const w = 20;
  const gap = 6.5;
  const x = index * (w + gap);
  const full = 92;
  const height = full * h * p;
  const y = 96 - height;
  return (
    <rect x={x} y={y} width={w} height={Math.max(0.001, height)} rx={5.5} fill={`url(#${gid})`} opacity={o} />
  );
};
