import React from "react";
import { BRAND } from "../config/copy";
import { C, FW, SHADOW } from "../config/theme";
import { fontFamily } from "../lib/fonts";

/** Ícone hexagonal da marca (cubo com fita branca). */
export const LogoMark: React.FC<{
  size?: number;
  style?: React.CSSProperties;
  glow?: number;
  mono?: string;
}> = ({ size = 64, style, glow = 0.55, mono }) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      width={size}
      height={size * 1.06}
      viewBox="0 0 100 106"
      style={{ display: "block", overflow: "visible", ...style }}
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="8" y1="4" x2="92" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5AAcFF" />
          <stop offset="0.38" stopColor="#2E6BFF" />
          <stop offset="0.68" stopColor="#1B5CFF" />
          <stop offset="1" stopColor="#0A34C4" />
        </linearGradient>
        <linearGradient id={`f-${id}`} x1="20" y1="20" x2="80" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DCE8FF" />
        </linearGradient>
        <filter id={`b-${id}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {glow > 0 && (
        <path
          d="M50 2 92 26v54L50 104 8 80V26z"
          fill={C.blue}
          opacity={glow * 0.55}
          filter={`url(#b-${id})`}
        />
      )}

      {/* hexágono */}
      <path
        d="M50 3.6 90.5 27v52L50 102.4 9.5 79V27z"
        fill={mono ?? `url(#g-${id})`}
        stroke={mono ? "none" : "rgba(255,255,255,0.22)"}
        strokeWidth={1.4}
      />
      {/* faceta superior mais clara */}
      {!mono && (
        <path d="M50 3.6 90.5 27 50 50.6 9.5 27z" fill="#FFFFFF" opacity={0.16} />
      )}

      {/* fita branca (C dobrado) */}
      <path
        d="M63.5 34.5 40.2 47.9c-4 2.3-4 8 0 10.3l10.4 6-11.6 6.7c-3.4 2-7.7-.5-7.7-4.4V45.9c0-2.6 1.4-5 3.6-6.3l17.2-9.9c2.2-1.3 5-1.3 7.2 0z"
        fill={mono ? "rgba(255,255,255,0.55)" : `url(#f-${id})`}
        opacity={1}
      />
      <path
        d="M67.6 40.9c3.4-2 7.7.5 7.7 4.4v20.6c0 2.6-1.4 5-3.6 6.3l-17.2 9.9c-2.2 1.3-5 1.3-7.2 0l-11.2-6.5 23.3-13.4c4-2.3 4-8 0-10.3l-10.4-6z"
        fill={mono ? "#FFFFFF" : `url(#f-${id})`}
        opacity={mono ? 1 : 0.92}
      />
    </svg>
  );
};

/** Logo completo: ícone + wordmark "ConsulTech". */
export const Logo: React.FC<{
  size?: number;
  dark?: boolean;
  style?: React.CSSProperties;
  markStyle?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
  gap?: number;
}> = ({ size = 62, dark = false, style, markStyle, wordStyle, gap = 16 }) => (
  <div style={{ display: "flex", alignItems: "center", gap, ...style }}>
    <LogoMark size={size} style={markStyle} glow={dark ? 0.25 : 0.5} />
    <div
      style={{
        fontFamily,
        fontWeight: FW.bold,
        fontSize: size * 0.8,
        letterSpacing: -1.6,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...wordStyle,
      }}
    >
      <span style={{ color: dark ? C.ink : C.white }}>{BRAND.name1}</span>
      <span style={{ color: C.blue }}>{BRAND.name2}</span>
    </div>
  </div>
);

/** Pílula "5/8" do canto superior direito. */
export const PageBadge: React.FC<{
  label: string;
  dark?: boolean;
  style?: React.CSSProperties;
  size?: number;
}> = ({ label, dark = false, style, size = 1 }) => (
  <div
    style={{
      fontFamily,
      fontWeight: FW.medium,
      fontSize: 34 * size,
      color: dark ? C.ink : C.white,
      border: `2px solid ${dark ? "rgba(27,92,255,0.55)" : "rgba(120,160,255,0.55)"}`,
      background: dark ? C.white : "rgba(11,30,80,0.35)",
      borderRadius: 999,
      padding: `${13 * size}px ${34 * size}px`,
      lineHeight: 1,
      boxShadow: dark ? SHADOW.cardLightSoft : "0 0 26px rgba(27,92,255,0.25)",
      ...style,
    }}
  >
    {label}
  </div>
);

/** Header padrão das telas (logo à esquerda, paginação à direita). */
export const SlideHeader: React.FC<{
  badge: string;
  dark?: boolean;
  logoStyle?: React.CSSProperties;
  badgeStyle?: React.CSSProperties;
  logoSize?: number;
}> = ({ badge, dark = false, logoStyle, badgeStyle, logoSize = 70 }) => (
  <>
    <div style={{ position: "absolute", left: 56, top: 78, ...logoStyle }}>
      <Logo size={logoSize} dark={dark} />
    </div>
    <div style={{ position: "absolute", right: 62, top: 86, ...badgeStyle }}>
      <PageBadge label={badge} dark={dark} />
    </div>
  </>
);

/** Mini-logo usado dentro do painel de dashboard. */
export const DashboardLogo: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <LogoMark size={size} glow={0.18} />
    <div
      style={{
        fontFamily,
        fontWeight: FW.bold,
        fontSize: size * 0.78,
        letterSpacing: -0.6,
        lineHeight: 1,
      }}
    >
      <span style={{ color: C.white }}>{BRAND.name1}</span>
      <span style={{ color: C.blueSoft }}>{BRAND.name2}</span>
    </div>
  </div>
);
