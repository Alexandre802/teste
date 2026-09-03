/**
 * Fonte da imagem do personagem e o que ela permite animar.
 *
 * ─────────────────────────────────────────────────────────────────────
 * PARA ATIVAR A POSE DA GRAVATA
 *
 * 1. coloque o arquivo em  public/advocacia-premium/advogado-gravata.webp
 *    (homem de terno escuro, camisa branca, gravata escura, MÃO SOBRE O NÓ,
 *     fundo transparente)
 * 2. troque as duas constantes abaixo:
 *       FONTE      → '/advocacia-premium/advogado-gravata.webp'
 *       POSE_GRAVATA → true
 *
 * Nada mais precisa mudar: as camadas de mão e gravata já estão escritas em
 * LawyerScene e passam a receber o movimento do beat `gravata`.
 * ─────────────────────────────────────────────────────────────────────
 *
 * Por que existe a chave em vez de simplesmente animar sempre: na fotografia
 * atual o homem segura uma pasta com as duas mãos na altura do peito, longe
 * do colarinho. Mascarar um pedaço dela e deslocá-lo não produz "ajustando a
 * gravata" — produz um naco de pasta flutuando. Com POSE_GRAVATA em false a
 * cena entrega o que o asset permite de verdade (micro-rotação de cabeça e
 * torso, e o nó respirando) e não simula o gesto que falta.
 */

export const FONTE = '/advocacia-premium/advogado.webp';

export const POSE_GRAVATA = false;

/**
 * Máscaras verticais que fatiam a fotografia em camadas.
 *
 * As bordas são gradientes, não cortes: é a suavidade delas que impede a
 * diferença de velocidade entre as camadas de aparecer como emenda.
 */
export const MASCARAS = {
  /** cabeça e pescoço */
  cabeca: 'linear-gradient(to bottom, #000 0%, #000 17%, transparent 27%)',
  /** torso */
  torso:
    'linear-gradient(to bottom, transparent 12%, #000 24%, #000 62%, transparent 74%)',
  /** braço e o que ele carrega */
  braco: 'linear-gradient(to bottom, transparent 54%, #000 67%, #000 100%)',
  /**
   * Faixa estreita do nó da gravata. Recorta em duas direções porque o nó é
   * pequeno e central — uma faixa horizontal inteira arrastaria o colarinho e
   * os ombros junto.
   */
  no:
    'linear-gradient(to bottom, transparent 20%, #000 25%, #000 34%, transparent 40%)',
  noHorizontal:
    'linear-gradient(to right, transparent 38%, #000 45%, #000 60%, transparent 67%)',
} as const;
