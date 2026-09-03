/**
 * Sistema de design Monttra.
 *
 * Todas as cores foram amostradas diretamente das imagens de referencia
 * (referencias/imagens) para preservar fielmente a identidade visual.
 */

export const COLORS = {
  // --- fundos -------------------------------------------------------------
  bgWarm: '#F0EFEF', // cenas tipograficas (ref: "Metodo nao da resultado")
  bgWarmTop: '#F4F4F3',
  bgCool: '#F2F4FA', // cenas de UI (ref: "Previsao da semana")
  bgCoolTop: '#F7F8FC',
  bgDark: '#02201C', // cena escura (ref: "Resultado da operacao")
  bgDarkDeep: '#010D0C',

  // --- tinta / texto ------------------------------------------------------
  ink: '#0C1919', // preto esverdeado dos titulos
  inkDeep: '#011816',
  inkSoft: '#26383A',
  gray: '#4D5771', // texto de apoio nas telas de UI
  grayLight: '#8A93A8',

  // --- verdes da marca ----------------------------------------------------
  green: '#019266', // verde primario dos titulos
  greenTeal: '#068E75', // variacao teal ("enxergar")
  greenDeep: '#035036', // pill "Mes", verde escuro
  greenBright: '#03B377',
  greenNeon: '#05D58E',
  greenGlow: '#2FE9A6',
  greenPale: '#CDEEE3',
  greenPaler: '#E1F4EA',
  greenMist: '#DEFBF2',

  // --- vermelhos ----------------------------------------------------------
  red: '#F2503A',
  redSoft: '#F55D47',
  redDeep: '#DC3A3F',
  redPale: '#FDE7E3',

  white: '#FFFFFF',
} as const;

/** Gradiente das 5 barras do simbolo Monttra (amostrado do logo original). */
export const LOGO_BARS = [
  { x: 5, y: 38, w: 11, h: 30, top: '#A0E7D8', bottom: '#4EE4C4' },
  { x: 19, y: 27, w: 12, h: 41, top: '#76E3CD', bottom: '#11DBB1' },
  { x: 33, y: 14, w: 13, h: 54, top: '#03AD95', bottom: '#098D6C' },
  { x: 48, y: 5, w: 13, h: 72, top: '#07A587', bottom: '#09B390' },
  { x: 64, y: 24, w: 12, h: 47, top: '#86D5CA', bottom: '#06C5A7' },
] as const;

export const LOGO_MARK_BOX = { w: 81, h: 82 } as const;

export const FONTS = {
  /** Display condensado pesado — manchetes verticais (ref: "Voce ate pode estar") */
  display: '"Anton", "Archivo", sans-serif',
  /** Grotesca — manchetes largas e toda a UI (ref: "Metodo nao da resultado") */
  sans: '"Archivo", "Helvetica Neue", Arial, sans-serif',
  /** Geometrica — wordmark e textos de interface arredondados */
  ui: '"Poppins", "Archivo", sans-serif',
} as const;

/**
 * Curvas de aceleracao. Nomeadas como no After Effects para facilitar ajustes.
 */
export const EASE = {
  /** saida expo — entrada de elementos com desaceleracao longa */
  out: [0.16, 1, 0.3, 1] as const,
  /** saida forte, quase instantanea no inicio */
  outHard: [0.05, 0.95, 0.15, 1] as const,
  /** in-out suave para movimentos de camera */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** entrada acelerada — saidas de tela */
  in: [0.55, 0, 1, 0.45] as const,
  /** overshoot sutil */
  back: [0.34, 1.56, 0.64, 1] as const,
};

/** Molas usadas nos elementos de UI. */
export const SPRINGS = {
  soft: { damping: 18, mass: 0.7, stiffness: 110 },
  snappy: { damping: 14, mass: 0.5, stiffness: 190 },
  pop: { damping: 11, mass: 0.42, stiffness: 240 },
  heavy: { damping: 22, mass: 1.1, stiffness: 90 },
} as const;

export const SHADOW = {
  card: '0 18px 46px rgba(9, 32, 27, 0.10), 0 3px 10px rgba(9, 32, 27, 0.06)',
  cardHi: '0 34px 80px rgba(9, 32, 27, 0.16), 0 6px 18px rgba(9, 32, 27, 0.08)',
  chip: '0 8px 22px rgba(9, 32, 27, 0.08)',
  glow: '0 0 60px rgba(5, 213, 142, 0.45)',
} as const;
