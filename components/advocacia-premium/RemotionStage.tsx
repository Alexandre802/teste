'use client';

import React, { useEffect, useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { LawyerSequence } from '@/remotion/LawyerSequence';
import {
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
  DURATION_IN_FRAMES,
  FPS,
} from '@/remotion/constants';

/**
 * O `<Player>` isolado num módulo só dele.
 *
 * Existe separado para poder ser carregado por `next/dynamic` com `ssr:false`
 * — a cena mede um path SVG com `getPointAtLength`, que não existe no
 * servidor — e só quando a seção se aproxima da tela.
 *
 * O ref sobe por callback em vez de `forwardRef` porque componente carregado
 * dinamicamente não repassa ref de forma confiável; quem controla a rolagem
 * guarda essa referência e chama `seekTo` nela.
 */
export default function RemotionStage({
  compact,
  aoMontar,
}: {
  compact: boolean;
  aoMontar: (player: PlayerRef | null) => void;
}) {
  const ref = useRef<PlayerRef>(null);

  useEffect(() => {
    aoMontar(ref.current);
    return () => aoMontar(null);
  }, [aoMontar]);

  return (
    <Player
      ref={ref}
      component={LawyerSequence}
      inputProps={{ compact }}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      compositionWidth={COMPOSITION_WIDTH}
      compositionHeight={COMPOSITION_HEIGHT}
      controls={false}
      autoPlay={false}
      loop={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      spaceKeyToPlayOrPause={false}
      acknowledgeRemotionLicense
      style={{ width: '100%', height: '100%' }}
    />
  );
}
