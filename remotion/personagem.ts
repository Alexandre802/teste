/**
 * Configuração visual do personagem usado no Remotion premium.
 *
 * O asset abaixo é a nova imagem enviada para a cena: advogado em terno escuro,
 * mão posicionada sobre o nó da gravata, pronto para o gesto de ajuste.
 * A imagem é servida por uma rota interna do próprio projeto para continuar
 * funcionando no deploy sem depender de CDN externa.
 */

export const FONTE = '/advocacia-premium/advogado-gravata';

export const POSE_GRAVATA = true;

/**
 * Máscaras suaves para separar a foto em regiões que podem reagir em ritmos
 * diferentes. A mão é isolada em uma área pequena; o antebraço acompanha com
 * menos amplitude e o nó da gravata reage ainda menos. Esse descompasso é o
 * que evita o aspecto de imagem inteira deslizando.
 */
export const MASCARAS = {
  cabeca: 'linear-gradient(to bottom, #000 0%, #000 22%, transparent 31%)',
  torso:
    'linear-gradient(to bottom, transparent 13%, #000 24%, #000 72%, transparent 84%)',
  braco:
    'radial-gradient(ellipse 28% 25% at 39% 47%, #000 0%, #000 58%, transparent 78%)',
  mao:
    'radial-gradient(ellipse 18% 15% at 50.5% 38%, #000 0%, #000 60%, transparent 78%)',
  recorteMao:
    'radial-gradient(ellipse 15% 13% at 50.5% 38%, transparent 0%, transparent 58%, #000 77%)',
  no:
    'radial-gradient(ellipse 7.5% 6.5% at 50.5% 34.5%, #000 0%, #000 58%, transparent 80%)',
} as const;
