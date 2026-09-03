import React from 'react';

/**
 * Monograma AC.
 *
 * Um anel aberto — o C — com o A inscrito no vão. Tudo em traço, sem
 * preenchimento: é o que permite a marca ser DESENHADA na abertura, por
 * `stroke-dashoffset`, em vez de simplesmente surgir.
 *
 * Geometria: circunferência de raio 32 no centro 50,50, aberta entre -45° e
 * +45°. O A ocupa de 32 a 70 na vertical, dentro do vão.
 */

export const ARCO_C = 'M 72.6 27.4 A 32 32 0 1 0 72.6 72.6';
export const HASTES_A = 'M 34 70 L 50 32 L 66 70';
export const TRAVESSA_A = 'M 40.5 55 L 59.5 55';

export const LogoMonogram: React.FC<{
  tamanho?: number;
  /** cor do anel; o A acompanha a cor do texto */
  arco?: string;
  cor?: string;
  espessura?: number;
  className?: string;
}> = ({
  tamanho = 40,
  arco = '#b89b61',
  cor = 'currentColor',
  espessura = 3,
  className,
}) => (
  <svg
    className={className}
    width={tamanho}
    height={tamanho}
    viewBox="0 0 100 100"
    fill="none"
    role="img"
    aria-label="Almeida &amp; Costa"
  >
    <path
      d={ARCO_C}
      stroke={arco}
      strokeWidth={espessura}
      strokeLinecap="round"
    />
    <path
      d={HASTES_A}
      stroke={cor}
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d={TRAVESSA_A} stroke={cor} strokeWidth={espessura} strokeLinecap="round" />
  </svg>
);
