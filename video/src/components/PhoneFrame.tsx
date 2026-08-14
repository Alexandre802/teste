import type { CSSProperties, FC, ReactNode } from "react";
import { COLORS, FONT, hexA } from "../config/theme";

/**
 * Mockup de iPhone construído em CSS (nada de bitmap), para que a tela seja
 * um container React normal e todos os elementos internos possam animar.
 */
export const PhoneFrame: FC<{
  width: number;
  children?: ReactNode;
  dark?: boolean;
  style?: CSSProperties;
  statusTime?: string;
  glow?: boolean;
}> = ({ width, children, dark = false, style, statusTime = "9:41", glow = false }) => {
  const height = width * 2.06;
  const bezel = width * 0.031;
  const radius = width * 0.135;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        padding: bezel,
        boxSizing: "border-box",
        background: dark
          ? "linear-gradient(158deg, #4A4F4D 0%, #161A19 26%, #0A0C0B 55%, #2C3230 100%)"
          : "linear-gradient(158deg, #55595A 0%, #1A1D1E 24%, #0E1011 56%, #3A4042 100%)",
        boxShadow: glow
          ? `0 40px 90px rgba(0,0,0,0.6), 0 0 90px ${hexA(COLORS.neon, 0.28)}`
          : "0 40px 90px rgba(11,42,32,0.28), 0 8px 24px rgba(11,42,32,0.16)",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: radius - bezel * 0.75,
          background: dark ? "#050908" : COLORS.white,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* barra de status */}
        <div
          style={{
            height: width * 0.115,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${width * 0.075}px`,
            fontFamily: FONT.family,
            fontWeight: FONT.bold,
            fontSize: width * 0.045,
            color: dark ? COLORS.white : COLORS.ink,
            position: "relative",
            zIndex: 3,
          }}
        >
          <span>{statusTime}</span>
          <StatusIcons size={width * 0.045} color={dark ? COLORS.white : COLORS.ink} />
        </div>

        {/* ilha dinâmica */}
        <div
          style={{
            position: "absolute",
            top: width * 0.028,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.31,
            height: width * 0.082,
            borderRadius: 999,
            background: "#07100D",
            zIndex: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: width * 0.022,
          }}
        >
          <div
            style={{
              width: width * 0.036,
              height: width * 0.036,
              borderRadius: 999,
              background: "#12201B",
              boxShadow: `inset 0 0 0 2px ${hexA("#3A5F52", 0.5)}`,
            }}
          />
        </div>

        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
      </div>
    </div>
  );
};

const StatusIcons: FC<{ size: number; color: string }> = ({ size, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.4 }}>
    {/* sinal */}
    <svg width={size * 1.25} height={size} viewBox="0 0 20 14">
      {[3, 6, 9, 12].map((h, i) => (
        <rect key={i} x={i * 5} y={14 - h} width={3.4} height={h} rx={1.1} fill={color} />
      ))}
    </svg>
    {/* wifi */}
    <svg width={size * 1.2} height={size} viewBox="0 0 20 14">
      <path
        d="M2 5.2a12 12 0 0 1 16 0M5 8.4a7.6 7.6 0 0 1 10 0M10 12.2h.02"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
    {/* bateria */}
    <svg width={size * 1.6} height={size} viewBox="0 0 26 13">
      <rect x="0.7" y="0.7" width="21" height="11.6" rx="3.4" stroke={color} strokeWidth="1.3" fill="none" opacity="0.55" />
      <rect x="2.4" y="2.4" width="17.6" height="8.2" rx="2.2" fill={color} />
      <path d="M23.4 4.6v3.8a2.2 2.2 0 0 0 0-3.8Z" fill={color} opacity="0.6" />
    </svg>
  </div>
);
