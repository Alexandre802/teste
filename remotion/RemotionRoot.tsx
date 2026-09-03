import React from 'react';
import { Composition } from 'remotion';
import {
  COMPOSITION_HEIGHT,
  COMPOSITION_ID,
  COMPOSITION_WIDTH,
  DURATION_IN_FRAMES,
  FPS,
} from './constants';
import { LawyerSequence } from './LawyerSequence';

/**
 * Registro da composição.
 *
 * O site não passa por aqui — ele monta `LawyerSequence` direto no
 * `<Player>`. Este arquivo existe para a mesma composição poder ser aberta no
 * Remotion Studio e renderizada em MP4 pela CLI sem duplicar a timeline.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={COMPOSITION_ID}
      component={LawyerSequence}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={COMPOSITION_WIDTH}
      height={COMPOSITION_HEIGHT}
      defaultProps={{ compact: false }}
    />
  );
};
