/**
 * Design system da Monttra extraido das 10 imagens de referencia.
 * Alterar aqui repercute em todas as cenas.
 */

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const COLORS = {
  // --- cenas claras -------------------------------------------------------
  bg: "#F2F3F0",
  bgSoft: "#EAECE7",
  ink: "#0B2A20",
  inkSoft: "#33443C",
  muted: "#6E7C75",
  mutedSoft: "#95A29B",
  white: "#FFFFFF",
  line: "#E6E9E4",

  green: "#0EA46A",
  greenBright: "#16BE7C",
  greenDeep: "#0A6F49",
  greenDark: "#0C3A2C",
  greenInk: "#08281E",
  mint: "#6FDCAA",
  pale: "#D7EBE0",
  paler: "#E9F3EE",
  palest: "#F0F7F3",

  red: "#DC5049",

  // --- cenas escuras ------------------------------------------------------
  darkBg: "#040706",
  darkBg2: "#0A1310",
  darkCard: "rgba(255,255,255,0.055)",
  darkCardLine: "rgba(255,255,255,0.10)",
  neon: "#00E58C",
  neonSoft: "#4CF3B0",
  onDark: "#FFFFFF",
  onDarkMuted: "#9DB2A9",
} as const;

export const FONT = {
  family: "'Plus Jakarta Sans', system-ui, sans-serif",
  regular: 400,
  medium: 500,
  semi: 600,
  bold: 700,
  black: 800,
} as const;

export const SHADOW = {
  card: "0 20px 48px rgba(11,42,32,0.10), 0 3px 10px rgba(11,42,32,0.05)",
  cardSoft: "0 12px 30px rgba(11,42,32,0.07)",
  cardStrong: "0 28px 70px rgba(11,42,32,0.16)",
  onDark: "0 24px 60px rgba(0,0,0,0.55)",
  glow: (c = COLORS.neon, a = 0.45, r = 60) => `0 0 ${r}px ${hexA(c, a)}`,
} as const;

export const RADIUS = {
  sm: 14,
  md: 22,
  lg: 30,
  xl: 40,
  pill: 999,
} as const;

/** hex + alpha -> rgba() */
export function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Formata numero no padrao brasileiro. */
export function brl(value: number, decimals = 2): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Presets de mola usados nas entradas. */
export const SPRING = {
  soft: { damping: 200, stiffness: 90, mass: 0.9 },
  smooth: { damping: 26, stiffness: 120, mass: 0.8 },
  pop: { damping: 14, stiffness: 200, mass: 0.6 },
  snappy: { damping: 18, stiffness: 260, mass: 0.55 },
  bouncy: { damping: 10, stiffness: 170, mass: 0.7 },
} as const;
