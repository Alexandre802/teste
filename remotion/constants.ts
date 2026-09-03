/**
 * Timeline única da composição `LawyerSequence`.
 *
 * A rolagem controla diretamente o frame do Remotion. Nesta revisão a primeira
 * parte ganhou mais tempo porque o gesto da gravata agora segue a referência em
 * vídeo enviada pelo cliente: movimento curto, elegante e com retorno ao centro
 * antes da entrada da pasta.
 */

export const FPS = 30;
export const DURATION_IN_FRAMES = 240;
export const COMPOSITION_WIDTH = 1920;
export const COMPOSITION_HEIGHT = 1080;
export const COMPOSITION_ID = 'LawyerSequence';

export const SCENE_BG = '#030405';

export const BEAT = {
  /** personagem surge do escuro */
  entrada: { from: 0, to: 20 },
  /** mão ajusta o nó: esquerda -> direita -> centro */
  gravata: { from: 20, to: 96 },
  /** gesto encerra, homem assenta e a pasta começa a assumir a cena */
  transicaoPasta: { from: 96, to: 112 },
  /** a pasta sobe, vem à frente e abre */
  pasta: { from: 112, to: 137 },
  /** documento sobe de dentro da pasta */
  papel: { from: 135, to: 162 },
  /** câmera aproxima e o personagem deixa o foco */
  aproximacao: { from: 160, to: 182 },
  /** a caneta entra */
  caneta: { from: 180, to: 202 },
  /** assinatura desenhada pela ponta da caneta */
  assinatura: { from: 202, to: 235 },
  /** tudo apaga sobre o mesmo preto da próxima seção */
  final: { from: 235, to: 240 },
} as const;

export const REDUCED_MOTION_FRAME = 234;