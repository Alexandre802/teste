/**
 * Identidade visual ConsulTech extraída das imagens de referência.
 * Nenhuma cor/tipografia deve ser inventada fora deste arquivo.
 */

export const C = {
  // ---- azuis da marca -----------------------------------------------------
  blue: "#1B5CFF",
  blueBright: "#2E6BFF",
  blueDeep: "#0B3AD1",
  blueDark: "#082A9E",
  blueSoft: "#4D82FF",
  blueGlow: "rgba(27,92,255,0.55)",
  blueFaint: "rgba(27,92,255,0.14)",

  // ---- cenas escuras ------------------------------------------------------
  bgDark: "#04050A",
  bgDark2: "#080B14",
  bgDarkNavy: "#070A12",
  glass: "rgba(255,255,255,0.045)",
  glass2: "rgba(255,255,255,0.075)",
  glassStroke: "rgba(120,155,255,0.20)",
  glassStrokeStrong: "rgba(140,175,255,0.34)",
  skeleton: "rgba(255,255,255,0.16)",
  skeletonDim: "rgba(255,255,255,0.10)",

  // ---- cena clara ---------------------------------------------------------
  bgLight: "#F3F4F7",
  bgLight2: "#EDEFF3",
  white: "#FFFFFF",
  ink: "#0B0D12",
  inkSoft: "#22262F",
  gray: "#6B7280",
  grayLight: "#9AA1AC",
  skeletonLight: "#E3E6EB",
  iconWell: "#EEF1F6",

  // ---- semânticas ---------------------------------------------------------
  red: "#FF4D4D",
  redSoft: "#FF7A6E",
  green: "#22C55E",
  greenSoft: "#4ADE80",
  purple: "#8B5CF6",
  pink: "#EC4899",
  amber: "#F5A623",
} as const;

export const FONT = "Poppins";

export const FW = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

/** Gradiente azul “glossy” dos badges circulares. */
export const BADGE_GRADIENT =
  "radial-gradient(120% 120% at 32% 22%, #6D9BFF 0%, #2E6BFF 38%, #1B5CFF 62%, #0B3AD1 100%)";

/** Gradiente do ícone hexagonal do logo. */
export const LOGO_GRADIENT =
  "linear-gradient(140deg, #4FA3FF 0%, #2E6BFF 42%, #1B5CFF 68%, #0A34C4 100%)";

export const SHADOW = {
  cardLight: "0 18px 46px rgba(16,24,40,0.10), 0 2px 6px rgba(16,24,40,0.05)",
  cardLightSoft: "0 10px 30px rgba(16,24,40,0.07)",
  badge: "0 14px 34px rgba(11,58,209,0.45), inset 0 2px 6px rgba(255,255,255,0.45)",
  glassDark: "0 22px 60px rgba(0,0,0,0.55)",
  blueGlow: "0 0 44px rgba(27,92,255,0.45)",
} as const;

export const TEXT_GLOW_WHITE = "0 0 42px rgba(255,255,255,0.20)";
export const TEXT_GLOW_BLUE = "0 0 46px rgba(27,92,255,0.55)";
