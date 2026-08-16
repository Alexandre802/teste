/**
 * Cartão reconstruído em camadas independentes (corpo, chip, contactless,
 * nome, logo, bandeira, brilho especular). Nada aqui é bitmap — cada peça
 * pode ser animada isoladamente e escala sem perder nitidez em 1080x1920.
 *
 * Cores e proporções vieram das referências 5FD796DB e 637A3CA6.
 */
import React, { useId } from "react";
import { COLORS } from "../config/theme";
import { BODY } from "../lib/fonts";

export type CardVariant = "purple" | "dark" | "silver" | "rose" | "night";

const FACES: Record<CardVariant, { from: string; via: string; to: string; ink: string }> = {
  purple: { from: COLORS.cardTop, via: COLORS.cardMid, to: COLORS.cardBottom, ink: "#FFFFFF" },
  dark: { from: COLORS.darkCardTop, via: "#2A0759", to: COLORS.darkCardBottom, ink: "#FFFFFF" },
  night: { from: "#2B1055", via: "#190636", to: "#0B0120", ink: "#FFFFFF" },
  silver: { from: COLORS.silverTop, via: "#C9C6DA", to: COLORS.silverBottom, ink: "#3A2A55" },
  rose: { from: COLORS.roseTop, via: "#D9A8DE", to: COLORS.roseBottom, ink: "#4A1C5C" },
};

export const NuLogo: React.FC<{ size?: number; color?: string; opacity?: number }> = ({
  size = 64,
  color = "#FFFFFF",
  opacity = 1,
}) => (
  <svg
    width={size}
    height={size * 0.52}
    viewBox="0 0 120 62"
    fill="none"
    style={{ opacity, overflow: "visible" }}
  >
    {/* n */}
    <path
      d="M10 56 V30 A16 16 0 0 1 42 30 V56"
      stroke={color}
      strokeWidth={12}
      strokeLinecap="round"
      fill="none"
    />
    {/* u */}
    <path
      d="M64 22 V44 A16 16 0 0 0 96 44 V22"
      stroke={color}
      strokeWidth={12}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const Chip: React.FC<{ w?: number }> = ({ w = 58 }) => {
  const id = useId();
  return (
    <svg width={w} height={w * 0.78} viewBox="0 0 58 45" fill="none">
      <defs>
        <linearGradient id={`chip-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E9E9F2" />
          <stop offset="45%" stopColor="#B9B9C9" />
          <stop offset="100%" stopColor="#8E8EA3" />
        </linearGradient>
      </defs>
      <rect width="58" height="45" rx="7" fill={`url(#chip-${id})`} />
      <g stroke="#6F6F85" strokeWidth="1.6" opacity="0.75">
        <path d="M0 15 H16 M42 15 H58 M0 30 H16 M42 30 H58" />
        <rect x="16" y="7" width="26" height="31" rx="4" fill="none" />
        <path d="M29 0 V7 M29 38 V45" />
      </g>
    </svg>
  );
};

const Contactless: React.FC<{ size?: number; color?: string }> = ({
  size = 34,
  color = "#FFFFFF",
}) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
    <g stroke={color} strokeWidth="3.2" strokeLinecap="round" opacity="0.92">
      <path d="M9 8 A14 14 0 0 1 9 26" />
      <path d="M16 5 A19 19 0 0 1 16 29" />
      <path d="M23 2 A24 24 0 0 1 23 32" />
    </g>
  </svg>
);

export const Mastercard: React.FC<{ size?: number }> = ({ size = 76 }) => {
  const id = useId();
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 60 38" fill="none">
      <defs>
        <clipPath id={`mcL-${id}`}>
          <circle cx="22" cy="19" r="17" />
        </clipPath>
      </defs>
      <circle cx="22" cy="19" r="17" fill={COLORS.mcRed} />
      <circle cx="38" cy="19" r="17" fill={COLORS.mcOrange} />
      <circle cx="38" cy="19" r="17" fill="#FF5F00" clipPath={`url(#mcL-${id})`} />
    </svg>
  );
};

export type NuCardProps = {
  variant?: CardVariant;
  width?: number;
  /** Nome gravado no cartão. `null` esconde a linha. */
  name?: string | null;
  showMastercard?: boolean;
  showChip?: boolean;
  showContactless?: boolean;
  /** 0→1 desloca o brilho especular pela superfície. */
  shine?: number;
  /** Intensidade do brilho roxo ao redor do cartão. */
  glow?: number;
  /** Layout do topo: chip à esquerda (padrão) ou bandeira à esquerda. */
  topLeft?: "chip" | "brand";
  style?: React.CSSProperties;
};

export const NuCard: React.FC<NuCardProps> = ({
  variant = "purple",
  width = 420,
  name = "Gabriela Lima",
  showMastercard = true,
  showChip = true,
  showContactless = true,
  shine = 0,
  glow = 0.5,
  topLeft = "chip",
  style,
}) => {
  const face = FACES[variant];
  const height = width * 1.585; // proporção retrato dos cartões de referência
  const pad = width * 0.088;
  const isLight = variant === "silver" || variant === "rose";

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: width * 0.082,
        background: `linear-gradient(152deg, ${face.from} 0%, ${face.via} 52%, ${face.to} 100%)`,
        boxShadow: [
          `0 ${width * 0.06}px ${width * 0.14}px rgba(0,0,0,0.55)`,
          `0 ${width * 0.015}px ${width * 0.04}px rgba(0,0,0,0.4)`,
          glow > 0
            ? `0 0 ${width * 0.3 * glow}px rgba(170,75,233,${0.55 * glow})`
            : "",
          "inset 0 1px 0 rgba(255,255,255,0.25)",
          "inset 0 0 0 1px rgba(255,255,255,0.09)",
        ]
          .filter(Boolean)
          .join(", "),
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: pad,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {/* textura sutil de superfície — evita o gradiente chapado */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)",
          pointerEvents: "none",
        }}
      />
      {/* brilho especular que varre o cartão */}
      <div
        style={{
          position: "absolute",
          top: "-40%",
          left: `${-60 + shine * 190}%`,
          width: "45%",
          height: "180%",
          background:
            "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.42) 45%, rgba(255,255,255,0) 100%)",
          transform: "rotate(14deg)",
          filter: "blur(14px)",
          opacity: shine > 0 && shine < 1 ? 1 : 0,
          pointerEvents: "none",
        }}
      />

      {/* topo: chip + contactless (ou bandeira, conforme a referência) */}
      <div style={{ display: "flex", alignItems: "center", gap: pad * 0.5, zIndex: 2 }}>
        {topLeft === "brand" ? (
          <>
            {showMastercard ? <Mastercard size={width * 0.2} /> : null}
            {showChip ? <Chip w={width * 0.125} /> : null}
          </>
        ) : (
          <>
            {showChip ? <Chip w={width * 0.14} /> : null}
            {showContactless ? (
              <Contactless size={width * 0.082} color={isLight ? "#5B4A72" : "#FFFFFF"} />
            ) : null}
          </>
        )}
      </div>

      {/* base: nome, logo e bandeira */}
      <div style={{ zIndex: 2 }}>
        {name ? (
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 400,
              fontSize: width * 0.058,
              letterSpacing: width * 0.002,
              color: isLight ? face.ink : "rgba(255,255,255,0.94)",
              marginBottom: pad * 0.75,
              textShadow: isLight ? "none" : "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {name}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <NuLogo size={width * 0.3} color={isLight ? face.ink : "#FFFFFF"} />
          {topLeft === "chip" && showMastercard ? (
            <Mastercard size={width * 0.185} />
          ) : null}
        </div>
      </div>
    </div>
  );
};
