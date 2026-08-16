/**
 * Tipografia animada.
 *
 * Todo texto entra por máscara (overflow hidden + deslocamento interno),
 * que é o recurso clássico de After Effects para revelar linha por linha,
 * combinado com stagger por palavra/caractere.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { DISPLAY } from "../lib/fonts";
import { EASE, map, spr, stagger, tween, wobble } from "../lib/anim";

type LineProps = {
  children: React.ReactNode;
  delay?: number;
  /** Duração da revelação em frames. */
  duration?: number;
  size?: number;
  weight?: number;
  color?: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
  /** Direção de entrada da máscara. */
  from?: "bottom" | "top";
  style?: React.CSSProperties;
};

/** Uma linha revelada por máscara. */
export const MaskLine: React.FC<LineProps> = ({
  children,
  delay = 0,
  duration = 26,
  size = 90,
  weight = 900,
  color = COLORS.white,
  align = "left",
  lineHeight = 0.98,
  letterSpacing = -0.02,
  from = "bottom",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = tween(frame, delay, delay + duration, { ease: EASE.outExpo });
  const dir = from === "bottom" ? 1 : -1;
  return (
    <div
      style={{
        overflow: "hidden",
        display: "block",
        textAlign: align,
        // folga vertical para descendentes (ç, ã) não serem cortados
        padding: `${size * 0.14}px 0 ${size * 0.16}px`,
        margin: `${-size * 0.14}px 0 ${-size * 0.16}px`,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: weight,
          fontSize: size,
          lineHeight,
          letterSpacing: `${letterSpacing}em`,
          color,
          transform: `translateY(${map(1 - p, 0, dir * 118)}%)`,
          opacity: p > 0.02 ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

type KineticProps = {
  text: string;
  delay?: number;
  step?: number;
  size?: number;
  weight?: number;
  color?: string;
  highlight?: string;
  /** Palavras (em maiúsculas) que recebem a cor de destaque. */
  highlightWords?: string[];
  align?: "left" | "center" | "right";
  mode?: "word" | "char";
  style?: React.CSSProperties;
};

/** Texto que entra palavra a palavra (ou letra a letra) com spring. */
export const KineticText: React.FC<KineticProps> = ({
  text,
  delay = 0,
  step = 3,
  size = 76,
  weight = 900,
  color = COLORS.white,
  highlight = COLORS.neonHot,
  highlightWords = [],
  align = "left",
  mode = "word",
  style,
}) => {
  const frame = useCurrentFrame();
  const units = mode === "word" ? text.split(" ") : text.split("");
  const hl = highlightWords.map((w) => w.toUpperCase());

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: mode === "word" ? `0 ${size * 0.24}px` : 0,
        justifyContent:
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        fontFamily: DISPLAY,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.0,
        letterSpacing: "-0.02em",
        ...style,
      }}
    >
      {units.map((u, i) => {
        const d = stagger(i, step, delay);
        const s = spr(frame, d, "punch");
        const isHl = hl.includes(u.replace(/[.,]/g, "").toUpperCase());
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${map(1 - s, 0, 46)}px) scale(${map(s, 0.86, 1)})`,
              opacity: s,
              color: isHl ? highlight : color,
              textShadow: isHl ? `0 0 ${size * 0.4}px ${highlight}88` : undefined,
              whiteSpace: "pre",
            }}
          >
            {u}
          </span>
        );
      })}
    </div>
  );
};

/** Rótulo pequeno em caixa alta, com traço que cresce ao lado. */
export const Kicker: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
  size?: number;
}> = ({ children, delay = 0, color = COLORS.neonHot, size = 22 }) => {
  const frame = useCurrentFrame();
  const p = tween(frame, delay, delay + 20, { ease: EASE.outExpo });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: p }}>
      <div
        style={{
          width: map(p, 0, 46),
          height: 3,
          borderRadius: 2,
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
      <span
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: "0.22em",
          color,
          transform: `translateX(${map(1 - p, 0, -14)}px)`,
        }}
      >
        {children}
      </span>
    </div>
  );
};

/**
 * Palavra com peso extra: entra escalando de cima com leve overshoot,
 * ganha glow e um flash de impacto no frame de chegada.
 */
export const ImpactWord: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  glowColor?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  size = 150,
  color = COLORS.white,
  glowColor = COLORS.neon,
  style,
}) => {
  const frame = useCurrentFrame();
  const s = spr(frame, delay, "punch");
  const flash = Math.max(0, 1 - Math.abs(frame - (delay + 8)) / 7);
  const settle = wobble(frame - delay, 3, 0.22, Math.max(0, 1 - (frame - delay) / 34) * 1.6);

  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.92,
        letterSpacing: "-0.035em",
        color,
        transform: `scale(${map(s, 1.65, 1)}) rotate(${settle * 0.35}deg)`,
        opacity: Math.min(1, s * 2.2),
        textShadow: `0 0 ${size * 0.22 * (0.35 + flash)}px ${glowColor}, 0 0 ${
          size * 0.6 * flash
        }px ${glowColor}aa`,
        filter: flash > 0.6 ? `brightness(${1 + flash * 0.5})` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Texto que sai da tela em disparada (usado no "MENOS"). */
export const ExitWord: React.FC<{
  children: React.ReactNode;
  at: number;
  duration?: number;
  direction?: "left" | "right";
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  at,
  duration = 16,
  direction = "left",
  size = 130,
  color = COLORS.white,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = tween(frame, at, at + duration, { ease: EASE.inQuart });
  const dist = direction === "left" ? -1500 : 1500;
  // rastro de motion blur proporcional à velocidade de saída
  const blur = p > 0 && p < 1 ? Math.min(26, p * 40) : 0;
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: "-0.03em",
        color,
        transform: `translateX(${p * dist}px) skewX(${p * -14}deg)`,
        filter: blur ? `blur(${blur}px)` : undefined,
        opacity: 1 - p * 0.35,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
