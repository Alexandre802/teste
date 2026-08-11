import React from "react";
import { BADGE_GRADIENT, C, FW, SHADOW } from "../config/theme";
import { fontFamily } from "../lib/fonts";
import { Icon, IconName } from "./Icons";

// ---------------------------------------------------------------------------
// cards
// ---------------------------------------------------------------------------

/** Card de vidro das telas escuras. */
export const GlassCard: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  radius?: number;
  strong?: boolean;
  glow?: number;
}> = ({ children, style, radius = 26, strong = false, glow = 0 }) => (
  <div
    style={{
      position: "relative",
      borderRadius: radius,
      background: strong
        ? "linear-gradient(150deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05) 55%, rgba(255,255,255,0.02))"
        : "linear-gradient(150deg, rgba(255,255,255,0.075), rgba(255,255,255,0.028) 60%, rgba(255,255,255,0.012))",
      border: `1.6px solid ${strong ? C.glassStrokeStrong : C.glassStroke}`,
      boxShadow: `${SHADOW.glassDark}${glow > 0 ? `, 0 0 ${34 * glow}px rgba(27,92,255,${0.45 * glow})` : ""}`,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      overflow: "hidden",
      ...style,
    }}
  >
    {/* brilho superior do vidro */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: radius,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%)",
        pointerEvents: "none",
      }}
    />
    {children}
  </div>
);

/** Card branco (telas claras e cards destacados). */
export const WhiteCard: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  radius?: number;
  soft?: boolean;
}> = ({ children, style, radius = 24, soft = false }) => (
  <div
    style={{
      position: "relative",
      borderRadius: radius,
      background: C.white,
      boxShadow: soft ? SHADOW.cardLightSoft : SHADOW.cardLight,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Painel escuro sólido (dashboard, atividade recente). */
export const DarkPanel: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  radius?: number;
}> = ({ children, style, radius = 26 }) => (
  <div
    style={{
      position: "relative",
      borderRadius: radius,
      background: "linear-gradient(165deg, #0C1220 0%, #070A12 60%, #05070E 100%)",
      border: `1.5px solid rgba(96,132,220,0.20)`,
      boxShadow: "0 26px 70px rgba(0,0,0,0.6)",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// ícones em círculo
// ---------------------------------------------------------------------------

/** Círculo azul "glossy" com ícone (badge flutuante). */
export const BadgeCircle: React.FC<{
  icon: IconName;
  size?: number;
  iconSize?: number;
  style?: React.CSSProperties;
  glow?: number;
}> = ({ icon, size = 96, iconSize, style, glow = 1 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: BADGE_GRADIENT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `${SHADOW.badge}, 0 0 ${44 * glow}px rgba(27,92,255,${0.5 * glow})`,
      border: "1px solid rgba(255,255,255,0.28)",
      ...style,
    }}
  >
    <Icon name={icon} size={iconSize ?? size * 0.44} color={C.white} strokeWidth={2.3} />
  </div>
);

/** Círculo de ícone dentro dos cards (azul cheio ou "well" claro). */
export const IconCircle: React.FC<{
  icon: IconName;
  size?: number;
  variant?: "blue" | "well" | "whiteOnBlue";
  style?: React.CSSProperties;
  iconColor?: string;
  iconSize?: number;
}> = ({ icon, size = 66, variant = "blue", style, iconColor, iconSize }) => {
  const bg =
    variant === "blue"
      ? BADGE_GRADIENT
      : variant === "well"
        ? C.iconWell
        : C.white;
  const col = iconColor ?? (variant === "blue" ? C.white : C.blue);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow:
          variant === "blue"
            ? "0 8px 22px rgba(11,58,209,0.42), inset 0 1.5px 4px rgba(255,255,255,0.4)"
            : "none",
        ...style,
      }}
    >
      <Icon name={icon} size={iconSize ?? size * 0.5} color={col} strokeWidth={2.1} />
    </div>
  );
};

/** Selo de check azul (canto dos cards). */
export const CheckSeal: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 42,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: BADGE_GRADIENT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 6px 18px rgba(11,58,209,0.5)",
      border: "1px solid rgba(255,255,255,0.3)",
      ...style,
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
      <path
        d="M5.5 12.5 10 17l8.5-9.5"
        stroke="#fff"
        strokeWidth={2.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// ---------------------------------------------------------------------------
// skeleton / textos falsos
// ---------------------------------------------------------------------------

export const SkeletonLine: React.FC<{
  width: number | string;
  height?: number;
  color?: string;
  radius?: number;
  style?: React.CSSProperties;
}> = ({ width, height = 12, color = C.skeleton, radius, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius ?? height / 2,
      background: color,
      ...style,
    }}
  />
);

// ---------------------------------------------------------------------------
// chips e campos
// ---------------------------------------------------------------------------

/** Chip flutuante com ícone + label (ex.: "Consultas rápidas"). */
export const Chip: React.FC<{
  label: string;
  icon?: IconName;
  variant?: "dark" | "glass" | "light";
  style?: React.CSSProperties;
  fontSize?: number;
  iconColor?: string;
  check?: boolean;
  lines?: number;
}> = ({
  label,
  icon,
  variant = "dark",
  style,
  fontSize = 26,
  iconColor,
  check = false,
  lines = 0,
}) => {
  const light = variant === "light";
  const bg =
    variant === "dark"
      ? "linear-gradient(160deg, #141A28 0%, #0B0F1A 100%)"
      : variant === "glass"
        ? "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))"
        : "linear-gradient(160deg, #FFFFFF 0%, #F1F3F7 100%)";
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: `${lines ? 20 : 17}px ${lines ? 24 : 26}px`,
        borderRadius: 20,
        background: bg,
        border: `1.4px solid ${light ? "rgba(16,24,40,0.06)" : C.glassStroke}`,
        boxShadow: light ? SHADOW.cardLight : SHADOW.glassDark,
        backdropFilter: variant === "glass" ? "blur(12px)" : undefined,
        WebkitBackdropFilter: variant === "glass" ? "blur(12px)" : undefined,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon && (
          <Icon
            name={icon}
            size={fontSize * 1.08}
            color={iconColor ?? C.blue}
            strokeWidth={2.2}
          />
        )}
        <span
          style={{
            fontFamily,
            fontWeight: FW.medium,
            fontSize,
            color: light ? C.ink : C.white,
            lineHeight: 1.15,
            whiteSpace: "pre-line",
          }}
        >
          {label}
        </span>
      </div>
      {lines > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {Array.from({ length: lines }).map((_, i) => (
            <SkeletonLine
              key={i}
              width={i === lines - 1 ? "62%" : "100%"}
              height={11}
              color={light ? C.skeletonLight : C.skeletonDim}
            />
          ))}
        </div>
      )}
      {check && <CheckSeal size={38} style={{ position: "absolute", right: -12, top: -12 }} />}
    </div>
  );
};

/** Campo de busca (usado com efeito de digitação). */
export const SearchField: React.FC<{
  text: string;
  variant?: "light" | "darkGlass" | "dark";
  width?: number;
  fontSize?: number;
  style?: React.CSSProperties;
  caret?: boolean;
  height?: number;
}> = ({ text, variant = "light", width = 520, fontSize = 30, style, caret = false, height }) => {
  const light = variant === "light";
  const h = height ?? fontSize * 2.55;
  return (
    <div
      style={{
        width,
        height: h,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.62,
        padding: `0 ${fontSize * 0.95}px`,
        background: light
          ? "linear-gradient(180deg,#FFFFFF 0%, #F4F6FA 100%)"
          : variant === "darkGlass"
            ? "linear-gradient(160deg, rgba(18,32,72,0.85), rgba(9,14,30,0.9))"
            : "linear-gradient(160deg,#121A2C,#080C16)",
        border: `1.6px solid ${light ? "rgba(16,24,40,0.07)" : "rgba(60,110,255,0.55)"}`,
        boxShadow: light
          ? SHADOW.cardLight
          : "0 18px 44px rgba(0,0,0,0.5), 0 0 26px rgba(27,92,255,0.22)",
        ...style,
      }}
    >
      <Icon
        name="search"
        size={fontSize * 1.05}
        color={light ? C.gray : "rgba(190,215,255,0.9)"}
        strokeWidth={2.3}
      />
      <span
        style={{
          fontFamily,
          fontWeight: FW.regular,
          fontSize,
          color: light ? C.grayLight : "rgba(198,218,255,0.75)",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {text}
        {caret && (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: fontSize * 0.95,
              background: C.blue,
              marginLeft: 3,
              transform: "translateY(2px)",
            }}
          />
        )}
      </span>
    </div>
  );
};

/** Botão CTA azul (link final). */
export const CtaButton: React.FC<{
  label: string;
  width?: number;
  fontSize?: number;
  style?: React.CSSProperties;
  shine?: number;
}> = ({ label, width = 690, fontSize = 38, style, shine = 0 }) => (
  <div
    style={{
      width,
      padding: `${fontSize * 0.72}px 0`,
      borderRadius: 999,
      background: "linear-gradient(180deg, #2E6BFF 0%, #1B5CFF 55%, #124BE0 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 22px 56px rgba(27,92,255,0.45), inset 0 2px 6px rgba(255,255,255,0.35)",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}
  >
    <span
      style={{
        fontFamily,
        fontWeight: FW.semibold,
        fontSize,
        color: C.white,
        letterSpacing: -0.3,
      }}
    >
      {label}
    </span>
    {shine > 0 && shine < 1 && (
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 220,
          left: `${-25 + shine * 130}%`,
          background:
            "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0) 100%)",
          transform: "skewX(-18deg)",
        }}
      />
    )}
  </div>
);
