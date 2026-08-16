/**
 * Paleta extraída pixel a pixel das 5 imagens de referência.
 * Não alterar sem reamostrar as referências — estes valores são a identidade visual.
 */
export const COLORS = {
  // Roxo institucional (amostrado do header do app, ref. 430F957D)
  brand: "#820AD1",
  brandLight: "#8A37D4",
  brandDeep: "#6D0DCB",

  // Fundos (ref. IMG_4434 / CE32367F)
  bgDeep: "#0C0024",
  bgNight: "#12002F",
  bgPurple: "#1A0740",
  bgMid: "#240C48",
  bgRaised: "#3C2478",

  // Gradiente do cartão roxo (ref. 5FD796DB, de cima para baixo)
  cardTop: "#AA4BE9",
  cardMid: "#7426C6",
  cardLow: "#3B0C7B",
  cardBottom: "#290259",

  // Cartão escuro
  darkCardTop: "#360D73",
  darkCardBottom: "#1B0442",

  // Cartão prata (ref. 637A3CA6, leque)
  silverTop: "#E8E6F2",
  silverBottom: "#9E9AB8",

  // Cartão rosé do leque
  roseTop: "#F0D8E8",
  roseBottom: "#B47FD0",

  // Neon / glow
  neon: "#C77DFF",
  neonHot: "#E0AAFF",

  // Superfícies claras (tela do app)
  white: "#FFFFFF",
  offWhite: "#F0F0F0",
  ink: "#111111",
  inkSoft: "#6B6B7B",
  divider: "#E8E8EF",

  // Mastercard
  mcRed: "#EB001B",
  mcOrange: "#F79E1B",

  // Semânticos
  success: "#00D68F",
  chip: "#C9C9D4",
} as const;

export const FONT = {
  /** Stack pesada, geométrica — aproxima a Graphik usada pela marca. */
  display:
    '"Archivo Black", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
  body: '"Inter", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
} as const;

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 60,
} as const;
