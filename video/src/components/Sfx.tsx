import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';

/**
 * Biblioteca de efeitos sonoros (sintetizada por tools/make_sfx.py).
 * Duracao em frames a 60fps, usada para dimensionar a Sequence.
 */
export const SFX = {
  whooshShort: { file: 'whoosh-short.wav', frames: 20 },
  whooshTransition: { file: 'whoosh-transition.wav', frames: 48 },
  swipeFast: { file: 'swipe-fast.wav', frames: 12 },
  popUi: { file: 'pop-ui.wav', frames: 8 },
  popSoft: { file: 'pop-soft.wav', frames: 10 },
  clickDigital: { file: 'click-digital.wav', frames: 6 },
  tapButton: { file: 'tap-button.wav', frames: 8 },
  notificationPop: { file: 'notification-pop.wav', frames: 20 },
  impactHit: { file: 'impact-hit.wav', frames: 36 },
  bassHit: { file: 'bass-hit.wav', frames: 38 },
  subBoom: { file: 'sub-boom.wav', frames: 62 },
  riserShort: { file: 'riser-short.wav', frames: 58 },
  reverseWhoosh: { file: 'reverse-whoosh.wav', frames: 34 },
  glitchDigital: { file: 'glitch-digital.wav', frames: 16 },
  tickMicro: { file: 'tick-micro.wav', frames: 4 },
  successChime: { file: 'success-chime.wav', frames: 46 },
  sparkleShine: { file: 'sparkle-shine.wav', frames: 40 },
  logoSting: { file: 'logo-sting.wav', frames: 98 },
} as const;

export type SfxName = keyof typeof SFX;

/** Volume base por efeito, para a mixagem nao ficar irregular. */
const BASE_VOLUME: Record<SfxName, number> = {
  whooshShort: 0.5,
  whooshTransition: 0.62,
  swipeFast: 0.42,
  popUi: 0.42,
  popSoft: 0.36,
  clickDigital: 0.34,
  tapButton: 0.4,
  notificationPop: 0.42,
  impactHit: 0.66,
  bassHit: 0.72,
  subBoom: 0.8,
  riserShort: 0.5,
  reverseWhoosh: 0.46,
  glitchDigital: 0.38,
  tickMicro: 0.26,
  successChime: 0.5,
  sparkleShine: 0.34,
  logoSting: 0.72,
};

/**
 * Dispara um efeito no frame `at`, relativo a Sequence onde esta montado.
 * Colocar dentro da cena mantem o timing correto ao mudar duracoes.
 */
export const Sfx: React.FC<{
  name: SfxName;
  at: number;
  volume?: number;
  playbackRate?: number;
}> = ({ name, at, volume, playbackRate = 1 }) => {
  const s = SFX[name];
  const vol = (volume ?? 1) * BASE_VOLUME[name];
  return (
    <Sequence
      from={at}
      durationInFrames={Math.ceil(s.frames / playbackRate) + 2}
      layout="none"
      name={`sfx:${name}`}
    >
      <Audio
        src={staticFile(`sfx/${s.file}`)}
        volume={vol}
        playbackRate={playbackRate}
      />
    </Sequence>
  );
};

/** Atalho para disparar uma lista de cues de uma vez. */
export const SfxTrack: React.FC<{
  cues: { name: SfxName; at: number; volume?: number; rate?: number }[];
}> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sfx
        key={`${c.name}-${c.at}-${i}`}
        name={c.name}
        at={c.at}
        volume={c.volume}
        playbackRate={c.rate}
      />
    ))}
  </>
);
