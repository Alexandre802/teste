import React from 'react';
import { Bg } from './Bg';
import { Plate } from './Plate';
import { ART_ENABLED, plates } from '../config/plates';
import type { SceneId } from '../config/timeline';

/**
 * Fundo da cena. Hoje entrega o mundo construído em código; com os plates
 * limpos em mãos, `ART_ENABLED` troca a fonte sem mexer em nenhuma cena.
 */
export const Stage: React.FC<{
  scene: SceneId;
  duration: number;
  push?: 'in' | 'out';
  drift?: number;
  trails?: number;
  glowAt?: [number, number];
}> = ({ scene, duration, push = 'in', drift = 0, trails, glowAt }) => {
  if (ART_ENABLED) {
    return <Plate plate={plates[scene]} duration={duration} push={push} />;
  }
  return <Bg duration={duration} drift={drift} trails={trails} glowAt={glowAt} />;
};
