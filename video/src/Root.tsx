import React from 'react';
import { Composition } from 'remotion';
import { FPS } from './config/beat';
import { TOTAL_FRAMES } from './config/timeline';
import { TresEstrelas } from './Video';

/**
 * 3840×1280 — 3:1, a mesma proporção das artes do cliente (2172×724) e dos
 * vídeos de referência. Nessa razão as artes entram inteiras: sem barra
 * lateral e sem recorte.
 */
export const RemotionRoot: React.FC = () => (
  <Composition
    id="TresEstrelas"
    component={TresEstrelas}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={3840}
    height={1280}
  />
);
