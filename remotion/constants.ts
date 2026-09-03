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

/** Fundo da composição — igual ao da página, para o letterbox sumir. */
export const SCENE_BG = '#030405';

export const BEAT = {
  /** personagem surge do escuro */
  entrada: { from: 0, to: 30 },
  /** corpo gira: cabeça, torso e braço em velocidades diferentes */
  giro: { from: 30, to: 70 },
  /** a pasta vem à frente e abre */
  pasta: { from: 70, to: 110 },
  /** o documento sobe de dentro da pasta */
  papel: { from: 110, to: 145 },
  /** câmera aproxima; o advogado sai do enquadramento */
  aproximacao: { from: 145, to: 175 },
  /** a caneta entra em quadro */
  caneta: { from: 175, to: 200 },
  /** a assinatura é desenhada sob a ponta da caneta */
  assinatura: { from: 200, to: 235 },
  /** documento assinado, frame segurado */
  final: { from: 235, to: 240 },
} as const;

/**
 * Frame exibido quando o visitante pede menos animação: documento já
 * assinado, que é o estado que resume a sequência inteira.
 */
export const REDUCED_MOTION_FRAME = 238;
