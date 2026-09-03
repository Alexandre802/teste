import type { CSSProperties, FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT, SPRING, brl } from "../config/theme";
import { useCountUp, useSpringIn } from "./anim";

/** Número que conta progressivamente, no formato brasileiro. */
export const NumberText: FC<{
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
  signed?: boolean;
}> = ({ value, decimals = 2, prefix = "", suffix = "", delay = 0, duration = 34, style, signed = false }) => {
  const v = useCountUp(value, delay, duration);
  const sign = signed && value > 0 ? "+" : v < 0 ? "-" : "";
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {sign}
      {prefix}
      {brl(Math.abs(v), decimals)}
      {suffix}
    </span>
  );
};

/** Simulação de digitação em campo de formulário. */
export const TypeWriter: FC<{
  text: string;
  delay?: number;
  framesPerChar?: number;
  caret?: boolean;
  style?: CSSProperties;
}> = ({ text, delay = 0, framesPerChar = 1.6, caret = true, style }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - delay;
  const shown = Math.max(0, Math.min(text.length, Math.floor(elapsed / framesPerChar)));
  const typing = elapsed >= 0 && shown < text.length;
  const blink = caret && (typing || (elapsed >= 0 && shown === text.length && elapsed % 30 < 15));
  return (
    <span style={style}>
      {text.slice(0, shown)}
      {blink ? (
        <span
          style={{
            display: "inline-block",
            width: 2.5,
            height: "1.05em",
            background: COLORS.green,
            verticalAlign: "-0.16em",
            marginLeft: 2,
          }}
        />
      ) : null}
    </span>
  );
};

export type HeadlineLine = { text: string; tone: string };

const TONES: Record<string, string> = {
  ink: COLORS.ink,
  green: COLORS.green,
  white: COLORS.onDark,
  neon: COLORS.neon,
  muted: COLORS.muted,
};

/**
 * Headline em linhas, cada uma revelada por máscara (sobe de baixo) com
 * stagger. A última linha ganha um "pop" extra de escala.
 */
export const Headline: FC<{
  lines: readonly HeadlineLine[];
  size: number;
  delay?: number;
  step?: number;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  style?: CSSProperties;
  accentPop?: boolean;
}> = ({ lines, size, delay = 0, step = 5, align = "left", lineHeight = 0.98, style, accentPop = true }) => (
  <div
    style={{
      fontFamily: FONT.family,
      fontWeight: FONT.black,
      fontSize: size,
      letterSpacing: -size * 0.035,
      lineHeight,
      textAlign: align,
      ...style,
    }}
  >
    {lines.map((l, i) => (
      <MaskLine
        key={i}
        line={l}
        size={size}
        delay={delay + i * step}
        pop={accentPop && i === lines.length - 1}
        lineHeight={lineHeight}
        align={align}
      />
    ))}
  </div>
);

const MaskLine: FC<{
  line: HeadlineLine;
  size: number;
  delay: number;
  pop: boolean;
  lineHeight: number;
  align: "left" | "center" | "right";
}> = ({ line, size, delay, pop, lineHeight, align }) => {
  const p = useSpringIn(delay, pop ? SPRING.pop : SPRING.smooth);
  const y = interpolate(p, [0, 1], [size * lineHeight * 1.05, 0]);
  const scale = pop ? interpolate(p, [0, 1], [0.86, 1]) : 1;
  return (
    <div style={{ overflow: "hidden", paddingBottom: size * 0.06, marginBottom: -size * 0.06 }}>
      <div
        style={{
          transform: `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(4)})`,
          transformOrigin: `${align === "center" ? "center" : align} bottom`,
          color: TONES[line.tone] ?? COLORS.ink,
          whiteSpace: "pre",
        }}
      >
        {line.text}
      </div>
    </div>
  );
};

/** Linha de subtítulo com palavras separadas por bullet. */
export const BulletLine: FC<{
  items: readonly string[];
  size?: number;
  color?: string;
  dotColor?: string;
  delay?: number;
  step?: number;
  weight?: number;
  style?: CSSProperties;
}> = ({
  items,
  size = 34,
  color = COLORS.inkSoft,
  dotColor = COLORS.green,
  delay = 0,
  step = 3,
  weight = FONT.medium,
  style,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: size * 0.5,
      fontFamily: FONT.family,
      fontSize: size,
      fontWeight: weight,
      color,
      flexWrap: "wrap",
      ...style,
    }}
  >
    {items.map((it, i) => (
      <BulletItem key={it} text={it} index={i} delay={delay + i * step} size={size} dotColor={dotColor} />
    ))}
  </div>
);

const BulletItem: FC<{
  text: string;
  index: number;
  delay: number;
  size: number;
  dotColor: string;
}> = ({ text, index, delay, size, dotColor }) => {
  const p = useSpringIn(delay, SPRING.snappy);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.5, opacity: p }}>
      {index > 0 ? (
        <span
          style={{
            width: size * 0.17,
            height: size * 0.17,
            borderRadius: 99,
            background: dotColor,
            transform: `scale(${p})`,
          }}
        />
      ) : null}
      <span style={{ transform: `translateY(${interpolate(p, [0, 1], [12, 0]).toFixed(2)}px)` }}>
        {text}
      </span>
    </div>
  );
};
