/**
 * PAINEL DE CONTROLE DO VIDEO
 * -------------------------------------------------------------------------
 * Tudo que se costuma querer mexer depois esta aqui: duracao de cada cena,
 * ritmo das animacoes, atrasos, textos e volume dos efeitos.
 * Nenhuma cena tem numero magico solto - todas leem daqui.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Quadros de sobreposicao entre uma cena e a seguinte (a transicao). */
export const OVERLAP = 12;

/** Segundos -> quadros. Deixa os tempos legiveis na configuracao. */
export const s = (sec: number) => Math.round(sec * FPS);

/* ------------------------------------------------------------------ cenas */

export type SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6";

export type SceneConfig = {
  id: SceneId;
  /** Duracao total da cena, em quadros. */
  duration: number;
  /** De onde a cena entra na transicao. */
  from: "bottom" | "top" | "left" | "right" | "scale";
  /** Zoom lento de fundo (Ken Burns): [inicio, fim]. */
  bgZoom: [number, number];
};

export const SCENES: SceneConfig[] = [
  { id: "s1", duration: s(6.6), from: "scale", bgZoom: [1.06, 1.0] },
  { id: "s2", duration: s(5.4), from: "bottom", bgZoom: [1.0, 1.08] },
  { id: "s3", duration: s(7.0), from: "right", bgZoom: [1.05, 1.0] },
  { id: "s4", duration: s(6.2), from: "left", bgZoom: [1.0, 1.05] },
  { id: "s5", duration: s(7.4), from: "bottom", bgZoom: [1.06, 1.0] },
  { id: "s6", duration: s(5.6), from: "scale", bgZoom: [1.0, 1.1] },
];

/** Quadro inicial de cada cena, ja descontando a sobreposicao. */
export const SCENE_STARTS = SCENES.reduce<number[]>((acc, sc, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].duration - OVERLAP);
  return acc;
}, []);

export const TOTAL_FRAMES =
  SCENE_STARTS[SCENES.length - 1] + SCENES[SCENES.length - 1].duration;

/* ------------------------------------------------------- ritmo das entradas */

/** Velocidade "padrao" pedida para o texto palavra a palavra. */
export const WORD_STEP = 4; // quadros entre uma palavra e a proxima
export const ROW_STEP = 9; // quadros entre um item de lista e o proximo
export const CARD_STEP = 7; // quadros entre um card e o proximo

/** Molas usadas nas entradas. Mexer aqui muda o "peso" de tudo. */
export const SPRING = {
  soft: { damping: 22, mass: 0.9, stiffness: 110 },
  snappy: { damping: 16, mass: 0.65, stiffness: 190 },
  punch: { damping: 13, mass: 0.55, stiffness: 260 },
  heavy: { damping: 26, mass: 1.5, stiffness: 90 },
} as const;

/* --------------------------------------------------------------- audio mix */

export const SFX_GAIN: Record<string, number> = {
  whoosh_short: 0.34,
  whoosh_trans: 0.5,
  swipe: 0.3,
  reverse_whoosh: 0.36,
  pop_ui: 0.3,
  soft_pop: 0.24,
  click: 0.24,
  tap: 0.26,
  notif: 0.32,
  impact: 0.5,
  bass_hit: 0.52,
  sub_boom: 0.55,
  riser: 0.34,
  glitch: 0.26,
  tick: 0.16,
  success: 0.4,
  sparkle: 0.3,
  logo_sting: 0.62,
};

/* ------------------------------------------------------------------ textos */

/**
 * Os textos vivem dentro das imagens de referencia (a identidade visual da
 * Tres Estrelas e preservada pixel a pixel). Este mapa existe para
 * documentar o que cada camada de texto diz - util na hora de reeditar.
 */
export const COPY = {
  s1: { h1: "VOCÊ VENDE.", h2: "A GENTE FAZ CHEGAR." },
  s2: { number: "+100.000", sub: "VOLUMES TODOS OS MESES" },
  s3: {
    h1: "QUEM VENDE MAIS",
    h2: "NÃO PODE ESPERAR MAIS.",
    sub: "Carga urgente. Operação diária.",
    steps: ["Pedido vendido", "Separado", "Enviado"],
  },
  s4: {
    h1: "FULL DE",
    h2: "VERDADE.",
    sub: ["Envie hoje.", "Receba amanhã", "em São Paulo.", "Até 24h de CD a CD."],
    route: ["GOIÂNIA", "SÃO PAULO"],
  },
  s5: {
    h1: "ENTREGAR BEM",
    h2: "TAMBÉM É VENDER.",
    cards: ["RASTREAMENTO EM TEMPO REAL", "MONITORAMENTO 24H", "CARGA SEGURADA", "GESTÃO DE RISCO"],
    steps: ["Pedido enviado", "Em transporte", "ENTREGUE"],
  },
  s6: { big: "TRÊS ESTRELAS", tag: "Logística para quem vende grande." },
} as const;

/* ------------------------------------------------------- cena 2: contagem */

export const COUNTER = {
  /** Valor final exibido. */
  target: 100000,
  /** Quadro em que a contagem comeca. */
  start: s(0.6),
  /** Quantos quadros a contagem leva. */
  run: s(2.5),
  /** Quadro em que troca para o recorte original (repouso exato). */
  settle: s(3.1),
};
