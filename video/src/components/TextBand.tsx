import React from 'react';
import { AbsoluteFill } from 'remotion';
import { theme } from '../config/theme';

/**
 * Cobre a faixa da arte onde a tipografia está embutida, para a versão
 * animada assumir aquele espaço sozinha.
 *
 * A regra do projeto é essa: a arte entrega a imagem, o código entrega a
 * tipografia. Sem cobrir, os dois textos aparecem no mesmo quadro — foi o que
 * aconteceu em todas as cenas quando passei a desenhar as frases por cima.
 *
 * As bordas são esfumadas para o corte não virar um retângulo visível.
 */
export const TextBand: React.FC<{
  /** Início e fim da faixa, em fração da largura. */
  from: number;
  to: number;
  /** Limites verticais, para a faixa não comer imagem acima ou abaixo do texto. */
  top?: number;
  bottom?: number;
  /** Suavidade das bordas, em pontos percentuais. */
  feather?: number;
}> = ({ from, to, top = 0, bottom = 1, feather = 6 }) => {
  const a = from * 100;
  const b = to * 100;
  const t = top * 100;
  const u = bottom * 100;
  const vFeather = 7;
  return (
    <AbsoluteFill
      style={{
        background:
          `linear-gradient(90deg, ` +
          `transparent ${Math.max(0, a - feather)}%, ` +
          `${theme.navyDeep} ${a}%, ` +
          `${theme.navyDeep} ${b}%, ` +
          `transparent ${Math.min(100, b + feather)}%)`,
        maskImage:
          `linear-gradient(180deg, ` +
          `transparent ${Math.max(0, t - vFeather)}%, ` +
          `#000 ${t}%, #000 ${u}%, ` +
          `transparent ${Math.min(100, u + vFeather)}%)`,
        WebkitMaskImage:
          `linear-gradient(180deg, ` +
          `transparent ${Math.max(0, t - vFeather)}%, ` +
          `#000 ${t}%, #000 ${u}%, ` +
          `transparent ${Math.min(100, u + vFeather)}%)`,
      }}
    />
  );
};
