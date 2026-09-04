import { Composition } from 'remotion';
import { RealEstateHero } from './RealEstateHero';
import {
  HERO_DURATION_IN_FRAMES,
  HERO_FPS,
  HERO_HEIGHT,
  HERO_VIDEO_SRC,
  HERO_WIDTH,
} from './constants';

/**
 * Registro da composição para o Remotion Studio / CLI.
 *
 * O site não passa por aqui — ele monta o `<Player>` direto com
 * `RealEstateHero`. Este arquivo serve para abrir o Studio e conferir o
 * percurso quadro a quadro.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RealEstateHero"
      component={RealEstateHero}
      durationInFrames={HERO_DURATION_IN_FRAMES}
      fps={HERO_FPS}
      width={HERO_WIDTH}
      height={HERO_HEIGHT}
      defaultProps={{ src: HERO_VIDEO_SRC }}
    />
  );
};
