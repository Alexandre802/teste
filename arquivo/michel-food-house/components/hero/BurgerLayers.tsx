/**
 * Camadas do lanche do hero.
 *
 * São faixas da fotografia da campanha, cortada nas fronteiras entre os
 * ingredientes. O corte é reto e sem borda esfumada de propósito: em repouso
 * as faixas se encaixam e recompõem a foto pixel a pixel — o lanche na tela
 * inicial é exatamente a imagem original, sem emenda visível.
 *
 * `spread` é o quanto a camada sobe quando o scroll chega ao fim. Em scroll 0
 * todos valem 0.
 *
 * O pão de baixo fica parado e tudo acima sobe a partir dele, como na
 * referência em vídeo: o lanche cresce para cima a partir de uma base fixa,
 * em vez de se afastar do centro para os dois lados.
 */

/** Dimensões da foto de origem. */
export const SOURCE = { w: 1292, h: 1217 } as const;

export interface BurgerLayer {
  src: string;
  alt: string;
  /** topo e altura da faixa dentro da foto, em pixels */
  top: number;
  height: number;
  /** subida no estado aberto, em pixels da foto (0 = fica onde está) */
  spread: number;
}

export const BURGER_LAYERS: BurgerLayer[] = [
  { src: '/lanche/1-pao-superior.webp', alt: 'Pão superior', top: 0, height: 442, spread: -450 },
  { src: '/lanche/2-tomate.webp', alt: 'Tomate', top: 440, height: 122, spread: -375 },
  { src: '/lanche/3-alface-cima.webp', alt: 'Alface', top: 560, height: 82, spread: -300 },
  { src: '/lanche/4-carne-cima.webp', alt: 'Carne e queijo', top: 640, height: 107, spread: -225 },
  { src: '/lanche/5-alface-baixo.webp', alt: 'Alface', top: 745, height: 52, spread: -150 },
  { src: '/lanche/6-carne-baixo.webp', alt: 'Carne e queijo', top: 795, height: 87, spread: -75 },
  { src: '/lanche/7-pao-inferior.webp', alt: 'Pão inferior', top: 880, height: 337, spread: 0 },
];

/**
 * Aberto, o conjunto sobe 450 px sobre uma foto de 1217 px, então mede 1667.
 * Esta escala (1217/1667) devolve a altura original — com a origem embaixo, a
 * base permanece onde está e o lanche cresce para cima sem sair da caixa.
 */
export const OPEN_SCALE = 0.73;
