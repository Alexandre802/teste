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

/**
 * Em 3:1 a arte coincide com o quadro e entra inteira, em força total.
 *
 * Quem abre espaço para a tipografia animada é o `TextBand`, que cobre só a
 * faixa onde a arte traz o texto embutido. Rebaixar a arte inteira com `veil`
 * resolvia a disputa, mas apagava caminhões, selos e pátio junto.
 */
export const plates: Record<SceneId, PlateDef> = {
  s1: { src: staticFile('plates/s1_phones.png'),     focal: 0.5, pan: 0, baked: true, veil: 0 },
  s2: { src: staticFile('plates/s2_operacao.png'),   focal: 0.5, pan: 0, baked: true, veil: 0 },
  s3: { src: staticFile('plates/s3_escala.png'),     focal: 0.5, pan: 0, baked: true, veil: 0 },
  s4: { src: staticFile('plates/s4_urgencia.png'),   focal: 0.5, pan: 0, baked: true, veil: 0 },
  s5: { src: staticFile('plates/s5_mapa.png'),       focal: 0.5, pan: 0, baked: true, veil: 0 },
  s6: { src: staticFile('plates/s6_confianca.png'),  focal: 0.5, pan: 0, baked: true, veil: 0 },
  s7: { src: staticFile('plates/s7_assinatura.png'), focal: 0.5, pan: 0, baked: true, veil: 0 },
};
