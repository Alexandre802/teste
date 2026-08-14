import type { CSSProperties, FC, ReactNode } from "react";
import { COLORS, FONT, RADIUS, SHADOW, hexA } from "../config/theme";
import { Icon, type IconName } from "./Icons";

/** Cartão branco (ou escuro) — a base visual de quase toda cena. */
export const Card: FC<{
  children?: ReactNode;
  style?: CSSProperties;
  variant?: "light" | "deep" | "onDark" | "pale";
  radius?: number;
  pad?: number;
  shadow?: string;
}> = ({ children, style, variant = "light", radius = RADIUS.lg, pad = 28, shadow }) => {
  const skin: Record<string, CSSProperties> = {
    light: { background: COLORS.white, boxShadow: shadow ?? SHADOW.card },
    pale: { background: COLORS.paler, boxShadow: shadow ?? "none" },
    deep: { background: COLORS.greenInk, boxShadow: shadow ?? SHADOW.cardStrong },
    onDark: {
      background: COLORS.darkCard,
      border: `1px solid ${COLORS.darkCardLine}`,
      backdropFilter: "blur(14px)",
      boxShadow: shadow ?? SHADOW.onDark,
    },
  };
  return (
    <div
      style={{
        borderRadius: radius,
        padding: pad,
        boxSizing: "border-box",
        fontFamily: FONT.family,
        ...skin[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Quadrado arredondado com ícone — usado em todos os cards da referência. */
export const IconTile: FC<{
  name: IconName;
  size?: number;
  tone?: "mint" | "deep" | "pale" | "white" | "neon" | "red";
  radius?: number;
  iconSize?: number;
  style?: CSSProperties;
}> = ({ name, size = 62, tone = "mint", radius, iconSize, style }) => {
  const tones: Record<string, { bg: string; fg: string }> = {
    mint: { bg: COLORS.pale, fg: COLORS.green },
    pale: { bg: COLORS.palest, fg: COLORS.greenDeep },
    deep: { bg: COLORS.greenInk, fg: COLORS.mint },
    white: { bg: COLORS.white, fg: COLORS.green },
    neon: { bg: hexA(COLORS.neon, 0.16), fg: COLORS.neon },
    red: { bg: "#FBE7E6", fg: COLORS.red },
  };
  const t = tones[tone];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? size * 0.31,
        background: t.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      <Icon name={name} size={iconSize ?? size * 0.5} color={t.fg} />
    </div>
  );
};

/** Pílula de filtro ("30 dias ⌄", "Últimos 30 dias"). */
export const Pill: FC<{
  label: string;
  icon?: IconName;
  chevron?: boolean;
  style?: CSSProperties;
  fontSize?: number;
}> = ({ label, icon, chevron = true, style, fontSize = 22 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: `${fontSize * 0.5}px ${fontSize * 0.8}px`,
      borderRadius: RADIUS.pill,
      border: `1.5px solid ${COLORS.line}`,
      background: COLORS.white,
      fontFamily: FONT.family,
      fontWeight: FONT.medium,
      fontSize,
      color: COLORS.inkSoft,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {icon ? <Icon name={icon} size={fontSize * 0.95} color={COLORS.muted} /> : null}
    {label}
    {chevron ? <Icon name="chevronDown" size={fontSize * 0.9} color={COLORS.muted} /> : null}
  </div>
);

/** Rótulo pequeno em cinza. */
export const Label: FC<{
  children: ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  style?: CSSProperties;
}> = ({ children, size = 22, color = COLORS.muted, weight = FONT.medium, style }) => (
  <div
    style={{
      fontFamily: FONT.family,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.25,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Valor monetário/numérico em destaque. */
export const Value: FC<{
  children: ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  style?: CSSProperties;
}> = ({ children, size = 38, color = COLORS.green, weight = FONT.bold, style }) => (
  <div
    style={{
      fontFamily: FONT.family,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.12,
      letterSpacing: -size * 0.02,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Marcador circular de check (marcos, confirmações). */
export const CheckDot: FC<{ size?: number; done?: boolean; progress?: number }> = ({
  size = 66,
  done = true,
  progress = 1,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: done ? COLORS.green : COLORS.pale,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${0.6 + 0.4 * progress})`,
      opacity: Math.min(1, progress * 1.6),
      boxShadow: done ? `0 8px 20px ${hexA(COLORS.green, 0.28)}` : "none",
    }}
  >
    <Icon
      name={done ? "check" : "flag"}
      size={size * 0.46}
      color={done ? COLORS.white : COLORS.greenDeep}
      width={2.6}
    />
  </div>
);
