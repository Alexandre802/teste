/**
 * Camadas do lanche do hero.
 *
 * São recortes da fotografia de referência da campanha, cortada nas separações
 * reais entre os ingredientes e com o fundo de madeira removido. Cada camada é
 * posicionada por porcentagem dentro de uma caixa com a proporção da foto
 * original, então o conjunto escala sem sair do lugar.
 *
 * `shift` é o quanto a camada sobe para o lanche ficar MONTADO (scroll = 0).
 * Em scroll = 1 todos os shifts chegam a zero e as camadas voltam exatamente à
 * posição da foto — o estado aberto é a própria imagem de referência.
 */

/** Largura e altura da foto de origem, do topo do pão ao fim do pão inferior. */
export const SOURCE = { w: 941, h: 1204 } as const;

export interface BurgerLayer {
  src: string;
  alt: string;
  /** topo e altura dentro da foto original, em pixels */
  top: number;
  height: number;
  /**
   * Quanto a camada sobe para o lanche ficar MONTADO. Os valores foram
   * ajustados olhando o resultado: medir o corpo do ingrediente por alfa
   * falha nos que afinam nas pontas (a carne, a alface), e o que importa é
   * o lanche parecer inteiro em scroll 0.
   */
  shift: number;
}

export const BURGER_LAYERS: BurgerLayer[] = [
  { src: '/lanche/1-pao-superior.webp', alt: 'Pão superior', top: 0, height: 186, shift: 0 },
  { src: '/lanche/2-tomate.webp', alt: 'Tomate', top: 186, height: 156, shift: -62 },
  { src: '/lanche/3-alface.webp', alt: 'Alface', top: 342, height: 134, shift: -168 },
  { src: '/lanche/4-queijo-cima.webp', alt: 'Queijo', top: 476, height: 144, shift: -252 },
  { src: '/lanche/5-carne-cima.webp', alt: 'Carne', top: 620, height: 150, shift: -336 },
  { src: '/lanche/6-queijo-baixo.webp', alt: 'Queijo', top: 770, height: 114, shift: -402 },
  { src: '/lanche/7-carne-baixo.webp', alt: 'Carne', top: 884, height: 164, shift: -474 },
  { src: '/lanche/8-pao-inferior.webp', alt: 'Pão inferior', top: 1048, height: 136, shift: -556 },
];
