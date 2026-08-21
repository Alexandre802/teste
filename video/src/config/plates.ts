import { staticFile } from 'remotion';
import type { SceneId } from './timeline';

/**
 * As artes atuais são composições achatadas, com o texto embutido na imagem.
 * Enquanto `baked` for true, cada cena desenha um véu suave sob a tipografia
 * animada para cobrir o texto original. Quando os plates limpos chegarem,
 * basta trocar o arquivo e virar `baked` para false — nada mais muda.
 */
export type PlateDef = {
  src: string;
  baked: boolean;
  /** Região coberta pelo véu, em fração do quadro: [x, y, largura, altura]. */
  scrim?: [number, number, number, number];
};

export const plates: Record<SceneId, PlateDef> = {
  s1: { src: staticFile('plates/s1_phones.png'),     baked: true, scrim: [0.52, 0.10, 0.48, 0.80] },
  s2: { src: staticFile('plates/s2_operacao.png'),   baked: true, scrim: [0.52, 0.10, 0.48, 0.80] },
  s3: { src: staticFile('plates/s3_escala.png'),     baked: true, scrim: [0.00, 0.05, 1.00, 0.95] },
  s4: { src: staticFile('plates/s4_urgencia.png'),   baked: true, scrim: [0.40, 0.08, 0.60, 0.80] },
  s5: { src: staticFile('plates/s5_mapa.png'),       baked: true, scrim: [0.00, 0.08, 0.52, 0.80] },
  s6: { src: staticFile('plates/s6_confianca.png'),  baked: true, scrim: [0.00, 0.00, 1.00, 1.00] },
  s7: { src: staticFile('plates/s7_assinatura.png'), baked: true, scrim: [0.20, 0.10, 0.60, 0.70] },
};
