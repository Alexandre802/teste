/**
 * Camadas do lanche do hero.
 *
 * São faixas da fotografia da campanha, cortada nas fronteiras entre os
 * ingredientes. O corte é reto e sem borda esfumada de propósito: em repouso
 * as faixas se encaixam e recompõem a foto pixel a pixel — o lanche na tela
 * inicial é exatamente a imagem original, sem emenda visível.
 *
 * `spread` é o quanto a camada se afasta quando o scroll chega ao fim. Em
 * scroll 0 todos valem 0.
 */

/** Dimensões da foto de origem. */
export const SOURCE = { w: 1292, h: 1217 } as const;

export interface BurgerLayer {
  src: string;
  alt: string;
  /** topo e altura da faixa dentro da foto, em pixels */
  top: number;
  height: number;
  /** deslocamento no estado aberto, em pixels da foto */
  spread: number;
}

export const BURGER_LAYERS: BurgerLayer[] = [
  { src: '/lanche/1-pao-superior.webp', alt: 'Pão superior', top: 0, height: 442, spread: -225 },
  { src: '/lanche/2-tomate.webp', alt: 'Tomate', top: 440, height: 122, spread: -150 },
  { src: '/lanche/3-alface-cima.webp', alt: 'Alface', top: 560, height: 82, spread: -75 },
  { src: '/lanche/4-carne-cima.webp', alt: 'Carne e queijo', top: 640, height: 107, spread: 0 },
  { src: '/lanche/5-alface-baixo.webp', alt: 'Alface', top: 745, height: 52, spread: 75 },
  { src: '/lanche/6-carne-baixo.webp', alt: 'Carne e queijo', top: 795, height: 87, spread: 150 },
  { src: '/lanche/7-pao-inferior.webp', alt: 'Pão inferior', top: 880, height: 337, spread: 225 },
];

/** Quanto o conjunto encolhe ao abrir, para o lanche expandido caber na caixa. */
export const OPEN_SCALE = 0.74;
