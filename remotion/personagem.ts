/**
 * Configuração visual do personagem usado no Remotion premium.
 *
 * Asset: advogado de terno escuro, mão posicionada sobre o nó da gravata.
 * A fotografia é servida por rota interna do próprio projeto.
 */

export const FONTE = '/advocacia-premium/advogado-gravata';
export const POSE_GRAVATA = true;

/**
 * Máscaras ajustadas depois da referência em vídeo.
 * O antebraço recebe uma área maior e mais suave para que o punho não pareça
 * solto; a mão fica concentrada no gesto e o nó é isolado em uma área pequena.
 */
export const MASCARAS = {
  cabeca:
    'linear-gradient(to bottom, #000 0%, #000 22%, rgba(0,0,0,.88) 27%, transparent 34%)',
  torso:
    'linear-gradient(to bottom, transparent 12%, rgba(0,0,0,.88) 22%, #000 30%, #000 76%, rgba(0,0,0,.72) 82%, transparent 88%)',
  braco:
    'radial-gradient(ellipse 34% 31% at 37.5% 45.5%, #000 0%, #000 56%, rgba(0,0,0,.82) 66%, transparent 82%)',
  mao:
    'radial-gradient(ellipse 18% 16% at 50.5% 38%, #000 0%, #000 58%, rgba(0,0,0,.82) 68%, transparent 81%)',
  recorteMao:
    'radial-gradient(ellipse 16% 14% at 50.5% 38%, transparent 0%, transparent 56%, rgba(0,0,0,.42) 66%, #000 80%)',
  no:
    'radial-gradient(ellipse 7.5% 6.8% at 50.5% 34.5%, #000 0%, #000 56%, rgba(0,0,0,.75) 68%, transparent 82%)',
} as const;
