import { AbsoluteFill, Video } from 'remotion';
import { HERO_VIDEO_SRC } from './constants';

/**
 * Composição do hero.
 *
 * O movimento continua vindo exclusivamente do arquivo de vídeo. O Remotion
 * só expõe o quadro correspondente ao scroll; não existe zoom CSS ou câmera
 * reconstruída. A composição agora trabalha em UHD vertical (2160×3840),
 * mantendo a proporção 9:16 do material original.
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
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 50%',
          filter: 'none',
          imageRendering: 'auto',
        }}
      />
    </AbsoluteFill>
  );
};
