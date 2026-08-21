import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { PlateDef } from '../config/plates';
import { theme } from '../config/theme';
import { Bg } from './Bg';

/** Todas as artes do repositório são 2172×724. */
const ART_ASPECT = 2172 / 724;

/**
 * Converte "fração horizontal da arte" em `objectPosition`.
 *
 * Com `object-fit: cover` a porcentagem de objectPosition não é o ponto da
 * imagem: ela distribui o excedente (imgW − quadro). Sem essa conversão o
 * recorte escorrega e acaba pegando a tipografia embutida na arte.
 */
const focalToObjectPosition = (focal: number, compW: number, compH: number) => {
  const imgW = compH * ART_ASPECT;
  const overflow = imgW - compW;
  if (overflow <= 0) return 50;
  return ((focal * imgW - compW / 2) / overflow) * 100;
};

export const Plate: React.FC<{
  plate: PlateDef;
  duration: number;
  push?: 'in' | 'out';
}> = ({ plate, duration, push = 'in' }) => {
  const frame = useCurrentFrame();
  const { width: compW, height: compH } = useVideoConfig();
  const p = duration > 0 ? frame / duration : 0;

  const focal = interpolate(p, [0, 1], [
    plate.focal - plate.pan / 200,
    plate.focal + plate.pan / 200,
  ]);
  const objX = focalToObjectPosition(focal, compW, compH);
  const scale = push === 'in'
    ? interpolate(p, [0, 1], [1.03, 1.12])
    : interpolate(p, [0, 1], [1.12, 1.03]);

  const veils = plate.baked ? (
    <>
      <AbsoluteFill style={{ background: theme.navy, opacity: plate.veil }} />
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(ellipse 95% 55% at 50% 46%, ${theme.navyDeep} 0%, ${theme.navyDeep}99 55%, transparent 85%)`,
          opacity: plate.veil * 0.9,
        }}
      />
    </>
  ) : null;

  /**
   * `inset`: a arte flutua dentro do ambiente construído em código, com as
   * bordas esfumadas. Serve quando o assunto da arte precisa aparecer inteiro
   * e menor do que o recorte `cover` permitiria.
   */
  if (plate.mode === 'inset') {
    const insetH = (plate.insetHeight ?? 0.6) * compH;
    return (
      <AbsoluteFill style={{ backgroundColor: theme.navy, overflow: 'hidden' }}>
        <Bg duration={duration} drift={plate.pan * 2} trails={20} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              // janela estreita: mantém o recorte da arte tão fechado quanto
              // no modo cover, senão a tipografia embutida entra no quadro
              width: insetH * (plate.insetRatio ?? 0.66),
              height: insetH,
              transform: `scale(${scale})`,
              maskImage: 'radial-gradient(ellipse 62% 62% at 50% 50%, #000 45%, transparent 82%)',
              WebkitMaskImage: 'radial-gradient(ellipse 62% 62% at 50% 50%, #000 45%, transparent 82%)',
            }}
          >
            <Img
              src={plate.src}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                objectPosition: `${focalToObjectPosition(focal, insetH * (plate.insetRatio ?? 0.66), insetH)}% 50%`,
              }}
            />
          </div>
        </AbsoluteFill>
        {veils}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: theme.navy, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={plate.src}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: `${objX}% 50%`,
            filter: plate.baked ? `blur(${1 + plate.veil * 4}px) saturate(1.08)` : undefined,
          }}
        />
      </AbsoluteFill>
      {veils}
    </AbsoluteFill>
  );
};
