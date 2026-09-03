import React from 'react';
import { SIGNATURE_PATH } from './signaturePath';

/**
 * O traço da assinatura, revelado por `stroke-dashoffset`.
 *
 * Fica dentro do mesmo `<svg>` da caneta (ver PaperDocument): partilhando o
 * viewBox, o ponto que o traço alcança e a ponta que o desenha são a mesma
 * coordenada — não há conversão entre sistemas para sair de sincronia.
 *
 * São dois traços sobrepostos com o mesmo dashoffset: um largo e translúcido,
 * que faz a tinta espalhar no papel, e o cheio por cima.
 */
export const Signature: React.FC<{
  /** 0 a 1 — mesma fração de comprimento que posiciona a caneta */
  progresso: number;
  comprimento: number;
}> = ({ progresso, comprimento }) => {
  const offset = comprimento * (1 - progresso);

  return (
    <g>
      <path
        d={SIGNATURE_PATH}
        fill="none"
        stroke="rgba(22,29,36,0.28)"
        strokeWidth={6.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={comprimento}
        strokeDashoffset={offset}
      />
      <path
        d={SIGNATURE_PATH}
        fill="none"
        stroke="#161d24"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={comprimento}
        strokeDashoffset={offset}
      />
    </g>
  );
};
