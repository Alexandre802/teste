import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import type { PlateDef } from '../config/plates';
import { theme } from '../config/theme';

/**
 * Fundo da cena. A arte recebe um empurrão de câmera lento e contínuo — na
 * referência nada fica parado, nem no plano de fundo.
 */
export const Plate: React.FC<{
  plate: PlateDef;
  duration: number;
  /** Direção do empurrão; alterna entre cenas para o movimento não virar deriva. */
  push?: 'in' | 'out';
  drift?: [number, number];
}> = ({ plate, duration, push = 'in', drift = [0, 0] }) => {
  const frame = useCurrentFrame();
  const p = frame / duration;

  const scale = push === 'in'
    ? interpolate(p, [0, 1], [1.02, 1.09])
    : interpolate(p, [0, 1], [1.09, 1.02]);
  const tx = interpolate(p, [0, 1], [0, drift[0]]);
  const ty = interpolate(p, [0, 1], [0, drift[1]]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.navy, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) translate(${tx}px, ${ty}px)` }}>
        <Img
          src={plate.src}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            // o desfoque leve só existe enquanto a arte vier com texto embutido
            filter: plate.baked ? 'blur(2.5px) saturate(1.05)' : undefined,
          }}
        />
      </AbsoluteFill>
      {plate.baked ? <ProvisionalVeil rect={plate.scrim} /> : null}
    </AbsoluteFill>
  );
};

/**
 * Véu provisório. As artes atuais já trazem a tipografia embutida, então o
 * fundo é rebaixado para que a camada animada apareça sozinha — sem isso o
 * texto do render aparece duplicado com o da imagem.
 *
 * Sai inteiro quando os plates limpos chegarem: basta `baked: false`.
 */
const ProvisionalVeil: React.FC<{ rect?: [number, number, number, number] }> = ({ rect }) => (
  <>
    <AbsoluteFill style={{ background: `${theme.navy}96` }} />
    {rect ? (
      <AbsoluteFill
        style={{
          left: `${rect[0] * 100}%`,
          top: `${rect[1] * 100}%`,
          width: `${rect[2] * 100}%`,
          height: `${rect[3] * 100}%`,
          background:
            `radial-gradient(ellipse at center, ${theme.navyDeep}ee 0%, ${theme.navyDeep}cc 50%, ${theme.navyDeep}00 78%)`,
          filter: 'blur(22px)',
        }}
      />
    ) : null}
  </>
);
