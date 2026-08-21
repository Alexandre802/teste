import { staticFile } from 'remotion';
import type { SceneId } from './timeline';

/**
 * As artes do repositório entram como fundo. Elas são 3:1 e o quadro é 9:16,
 * então cada cena escolhe por onde cortar: `focal` é a fração horizontal da
 * arte que fica no centro do quadro, e a câmera passeia em torno dela.
 *
 * Os recortes foram escolhidos em regiões sem tipografia embutida — o corte
 * vertical mostra só cerca de 19% da largura da arte, o que permite pegar
 * ambiente limpo (pátio, frota, rastros) e deixar o texto de fora.
 */
export const ART_ENABLED = true;

export type PlateDef = {
  src: string;
  /** Recorte horizontal em foco, 0 = borda esquerda da arte, 1 = direita. */
  focal: number;
  /** Passeio horizontal ao longo da cena, em pontos percentuais. */
  pan: number;
  /** As artes ainda trazem tipografia embutida; com plates limpos, vire para false. */
  baked: boolean;
  /** Quanto rebaixar a arte, 0 = arte cheia, 1 = quase apagada. */
  veil: number;
  /**
   * `cover` preenche o quadro com um recorte da arte. `inset` faz a arte
   * flutuar, menor e com bordas esfumadas, sobre o ambiente em código —
   * para quando o assunto precisa caber inteiro.
   */
  mode?: 'cover' | 'inset';
  /** Altura da arte no modo `inset`, em fração do quadro. */
  insetHeight?: number;
  /** Largura da janela `inset`, como proporção da altura. */
  insetRatio?: number;
};

/** Pátio e frota da arte de assinatura: o ambiente limpo da marca. */
const AMBIENTE = staticFile('plates/s7_assinatura.png');

export const plates: Record<SceneId, PlateDef> = {
  // a arte de abertura é a própria cena: a câmera atravessa a composição da
  // esquerda (os três marketplaces) até a direita (a frase e o pátio)
  s1: { src: staticFile('plates/s1_phones.png'), focal: 0.49, pan: 58, baked: true, veil: 0.05 },
  // a revelação: o CD e a frota ficam à mostra quando os pedidos recuam
  s2: { src: AMBIENTE, focal: 0.83, pan: 7, baked: true, veil: 0.46 },
  // borda da arte de escala: só o campo de caixas em movimento
  s3: { src: staticFile('plates/s3_escala.png'), focal: 0.04, pan: 6, baked: true, veil: 0.34 },
  // rastros e frota atrás do mockup de rastreio
  s4: { src: AMBIENTE, focal: 0.93, pan: -4, baked: true, veil: 0.52 },
  // ambiente neutro: o mapa e a rota são desenhados por cima
  s5: { src: AMBIENTE, focal: 0.80, pan: 4, baked: true, veil: 0.58 },
  // a caixa protegida é o próprio herói da arte, recortada no centro
  s6: { src: staticFile('plates/s6_confianca.png'), focal: 0.45, pan: 3, baked: true, veil: 0.16, mode: 'inset', insetHeight: 0.52, insetRatio: 0.72 },
  // volta ao pátio operando, emendando com a primeira cena
  s7: { src: AMBIENTE, focal: 0.90, pan: -6, baked: true, veil: 0.54 },
};
