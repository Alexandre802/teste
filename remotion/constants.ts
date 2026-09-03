/**
 * Timeline única da composição `LawyerSequence`.
 *
 * O site não toca o vídeo: ele converte o progresso da rolagem em frame e
 * chama `seekTo`. Por isso todo corte é declarado aqui em número de frame —
 * o controlador de scroll e as cenas leem exatamente a mesma fonte.
 */

export const FPS = 30;
export const DURATION_IN_FRAMES = 240;
export const COMPOSITION_WIDTH = 1920;
export const COMPOSITION_HEIGHT = 1080;
export const COMPOSITION_ID = 'LawyerSequence';

/** Fundo da composição — igual ao da página, para o corte sumir. */
export const SCENE_BG = '#030405';

export const BEAT = {
  /** personagem surge do escuro */
  entrada: { from: 0, to: 20 },
  /** o gesto: mão no nó da gravata, cabeça e torso reagindo */
  gravata: { from: 20, to: 78 },
  /** a mão baixa, o torso volta ao eixo e a pasta assume o foco */
  transicaoPasta: { from: 78, to: 100 },
  /** a pasta vem à frente e abre */
  pasta: { from: 100, to: 125 },
  /** o documento sobe de dentro da pasta */
  papel: { from: 125, to: 155 },
  /** câmera aproxima; o advogado sai do enquadramento */
  aproximacao: { from: 155, to: 180 },
  /** a caneta entra em quadro */
  caneta: { from: 180, to: 202 },
  /** a assinatura é desenhada sob a ponta da caneta */
  assinatura: { from: 202, to: 235 },
  /** a cena inteira se apaga sobre o mesmo preto da seção seguinte */
  final: { from: 235, to: 240 },
} as const;

/**
 * Frame exibido quando o visitante pede menos animação: documento já
 * assinado, que é o estado que resume a sequência inteira. Fica antes do
 * apagamento final, senão o quadro parado seria uma tela preta.
 */
export const REDUCED_MOTION_FRAME = 234;
