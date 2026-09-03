import React from 'react';
import type { SignaturePoint } from './signaturePath';

/**
 * A caneta.
 *
 * Desenhada em SVG dentro do mesmo viewBox do traço, com a PONTA na origem
 * (0,0) do próprio grupo. Assim `translate(ponto.x, ponto.y)` põe a ponta
 * exatamente sobre o ponto do path — nunca perto dele.
 *
 * O corpo não acompanha a tangente inteira: quem escreve mantém o ângulo da
 * mão quase fixo e deixa a curva para os dedos. A tangente entra só como uma
 * oscilação de poucos graus, senão a caneta roda como ponteiro.
 */
export const PenProp: React.FC<{
  ponto: SignaturePoint;
  /** 0 a 1 — entrada da caneta em quadro, antes de encostar no papel */
  entrada: number;
  /** 0 a 1 — quanto a ponta está apoiada no papel */
  apoio: number;
}> = ({ ponto, entrada, apoio }) => {
  // vem de fora do quadro, à direita e acima
  const deslocX = (1 - entrada) * 210;
  const deslocY = (1 - entrada) * -190;
  // enquanto não apoia, fica levemente acima do papel
  const alturaCaneta = (1 - apoio) * -13;

  const inclinacao = 27 + ponto.angle * 0.06;

  return (
    <g
      // a escala vem DEPOIS do translate: como a ponta está na origem do
      // grupo, encolher a caneta não a tira do ponto do traço
      transform={`translate(${ponto.x + deslocX} ${ponto.y + deslocY + alturaCaneta}) rotate(${inclinacao}) scale(0.62)`}
      opacity={entrada}
    >
      {/* sombra projetada no papel, mais dura conforme a ponta desce */}
      <ellipse
        cx={7}
        cy={11}
        rx={17}
        ry={4.5}
        fill="rgba(20,26,32,0.16)"
        opacity={0.25 + apoio * 0.35}
        transform={`translate(${(1 - apoio) * 14} ${(1 - apoio) * 10})`}
      />

      {/* ponta */}
      <path d="M -3.6 -24 L 0 0 L 3.6 -24 Z" fill="#c9a94f" />
      <path d="M -2 -24 L 0 -6 L 2 -24 Z" fill="#8a7433" />

      {/* aro metálico */}
      <rect x={-6.4} y={-50} width={12.8} height={26} rx={1.6} fill="#b6b9bd" />
      <rect x={-6.4} y={-50} width={5} height={26} fill="rgba(255,255,255,0.28)" />

      {/* anel dourado */}
      <rect x={-7.2} y={-57} width={14.4} height={7.4} rx={1.4} fill="#b89b61" />
      <rect x={-7.2} y={-57} width={4.6} height={7.4} fill="#d2bf92" />

      {/* corpo */}
      <rect x={-7.6} y={-300} width={15.2} height={244} rx={6} fill="#0b0e11" />
      <rect x={-7.6} y={-300} width={4.4} height={244} rx={4} fill="rgba(255,255,255,0.13)" />
      <rect x={3.2} y={-300} width={3.2} height={244} rx={3} fill="rgba(0,0,0,0.45)" />

      {/* clipe */}
      <rect x={4.6} y={-292} width={3.6} height={52} rx={1.8} fill="#b89b61" />
    </g>
  );
};
