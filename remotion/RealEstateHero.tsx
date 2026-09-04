import { AbsoluteFill, Video } from 'remotion';
import { HERO_VIDEO_SRC } from './constants';

/**
 * Composição do hero.
 *
 * Ela existe para um propósito só: colocar o vídeo de referência dentro do
 * Remotion, de forma que o quadro exibido seja função do frame da composição —
 * e, portanto, do scroll. Nada de câmera reconstruída, nada de transform de
 * CSS imitando drone: o movimento é o do arquivo.
 *
 * A composição tem exatamente a proporção do vídeo (720×1280), então aqui não
 * há corte nenhum. O enquadramento para cada tela é resolvido fora, na caixa
 * que envolve o Player (ver `HeroScrollExperience`).
 */
export type RealEstateHeroProps = {
  /** Escolhida no navegador conforme os codecs disponíveis. */
  src: string;
};

export const RealEstateHero: React.FC<RealEstateHeroProps> = ({ src = HERO_VIDEO_SRC }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#090909' }}>
      <Video
        src={src}
        muted
        pauseWhenBuffering
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </AbsoluteFill>
  );
};
