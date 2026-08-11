/**
 * Marcas das fontes de dados que aparecem nos cards da tela 2/8.
 * São reconstruções simplificadas (wordmark + cor), no mesmo papel visual
 * que ocupam na referência.
 */
import React from "react";
import { FW } from "../config/theme";
import { fontFamily } from "../lib/fonts";

export type BureauName = "spc" | "serasa" | "boavista" | "receita";

const Word: React.FC<{
  children: React.ReactNode;
  size: number;
  weight?: number;
  color?: string;
  spacing?: number;
  style?: React.CSSProperties;
}> = ({ children, size, weight = FW.bold, color = "#2B3340", spacing = -0.5, style }) => (
  <span
    style={{
      fontFamily,
      fontWeight: weight,
      fontSize: size,
      color,
      letterSpacing: spacing,
      lineHeight: 1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

export const BureauLogo: React.FC<{ name: BureauName; scale?: number }> = ({
  name,
  scale = 1,
}) => {
  const s = (n: number) => n * scale;

  if (name === "spc") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: s(8) }}>
        <svg width={s(34)} height={s(30)} viewBox="0 0 34 30">
          <path d="M2 20 C10 6, 22 2, 32 4 L32 12 C22 11, 13 15, 6 25 Z" fill="#F2C230" />
          <path d="M2 24 C10 12, 22 7, 32 9 L32 16 C22 15, 13 19, 6 28 Z" fill="#3FA9F5" />
          <path d="M2 27 C10 17, 22 12, 32 14 L32 20 C23 19, 14 22, 7 29 Z" fill="#7DC242" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: s(2) }}>
          <Word size={s(27)} weight={FW.extrabold} color="#1F2A3A">
            SPC
          </Word>
          <Word size={s(10)} weight={FW.medium} color="#5B6474" spacing={s(3.4)}>
            BRASIL
          </Word>
        </div>
      </div>
    );
  }

  if (name === "serasa") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: s(7) }}>
        <svg width={s(24)} height={s(26)} viewBox="0 0 24 26">
          {[
            [3, 4, "#E5007D"],
            [10, 4, "#8B1D8E"],
            [3, 12, "#8B1D8E"],
            [10, 12, "#E5007D"],
            [3, 20, "#E5007D"],
          ].map(([x, y, c], i) => (
            <rect key={i} x={x as number} y={y as number} width="6" height="5.4" rx="1.4" fill={c as string} />
          ))}
        </svg>
        <Word size={s(30)} weight={FW.medium} color="#2B3340" spacing={s(-0.8)}>
          serasa
        </Word>
      </div>
    );
  }

  if (name === "boavista") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: s(4) }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <Word size={s(29)} weight={FW.bold} color="#1B3A6B">
            Boa
          </Word>
          <Word size={s(29)} weight={FW.bold} color="#2E6BFF">
            Vista
          </Word>
        </div>
        <svg width={s(96)} height={s(7)} viewBox="0 0 96 7">
          <rect x="0" y="2" width="30" height="4" rx="2" fill="#F2C230" />
          <rect x="33" y="2" width="30" height="4" rx="2" fill="#7DC242" />
          <rect x="66" y="2" width="30" height="4" rx="2" fill="#3FA9F5" />
        </svg>
      </div>
    );
  }

  // receita federal
  return (
    <div style={{ display: "flex", alignItems: "center", gap: s(9) }}>
      <svg width={s(30)} height={s(30)} viewBox="0 0 30 30">
        <circle cx="15" cy="15" r="13.4" fill="#0E2C63" />
        <path
          d="M8.5 20.5V9.5h5.2c2.4 0 4 1.3 4 3.4 0 1.6-.9 2.7-2.3 3.1l2.8 4.5h-3l-2.4-4h-1.6v4z"
          fill="#fff"
        />
        <path d="M19.5 9.5h3.4v2.2h-3.4zM19.5 13.4h3.4v2.2h-3.4zM19.5 17.3h3.4v2.2h-3.4z" fill="#fff" />
      </svg>
      <Word size={s(24)} weight={FW.bold} color="#12315F" spacing={s(-0.3)}>
        Receita Federal
      </Word>
    </div>
  );
};
