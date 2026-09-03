import React from 'react';
import type { SignaturePoint } from './signaturePath';

/**
 * A caneta.
 *
 * Desenhada em SVG dentro do mesmo viewBox do traço, com a PONTA na origem
 * (0,0) do próprio grupo. Assim `translate(ponto.x, ponto.y)` põe a ponta
 * exatamente sobre o ponto do path — nunca perto dele. A escala vem depois do
 * translate: como a ponta está na origem, encolher a caneta não a tira do
 * papel.
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
  /** 0 a 1 — a caneta levanta e sai depois de assinar */
  saida: number;
  /** tamanho da peça; menor no retrato, para não estourar a folha */
  escala: number;
}> = ({ ponto, entrada, apoio, saida, escala }) => {
  // vem de fora do quadro, à direita e acima
  const deslocX = (1 - entrada) * 210 + saida * 16;
  const deslocY = (1 - entrada) * -190 - saida * 12;
  // enquanto não apoia, fica levemente acima do papel
  const alturaCaneta = (1 - apoio) * -13;

  const inclinacao = 27 + ponto.angle * 0.06;

  return (
    <g
      transform={`translate(${ponto.x + deslocX} ${ponto.y + deslocY + alturaCaneta}) rotate(${inclinacao}) scale(${escala})`}
      opacity={entrada * (1 - saida)}
    >
      {/* sombra projetada no papel, mais definida conforme a ponta desce */}
      <ellipse
        cx={6}
        cy={10}
        rx={15}
        ry={4}
        fill="rgba(20,26,32,0.14)"
        opacity={0.22 + apoio * 0.32}
        transform={`translate(${(1 - apoio) * 14} ${(1 - apoio) * 10})`}
      />

      {/* ponta: cone de metal com o bico escuro */}
      <path d="M -2.6 -22 L 0 0 L 2.6 -22 Z" fill="#c6a55c" />
      <path d="M -1.3 -22 L 0 -5 L 1.3 -22 Z" fill="#6f5c28" />

      {/* aro metálico escovado */}
      <rect x={-4.7} y={-46} width={9.4} height={24} rx={1.2} fill="#9fa4a9" />
      <rect x={-4.7} y={-46} width={3} height={24} fill="rgba(255,255,255,0.34)" />
      <rect x={2.4} y={-46} width={2.3} height={24} fill="rgba(0,0,0,0.28)" />

      {/* anel dourado */}
      <rect x={-5.2} y={-52.4} width={10.4} height={6.6} rx={1} fill="#b89b61" />
      <rect x={-5.2} y={-52.4} width={3.2} height={6.6} fill="#d2bf92" />

      {/* corpo: estreito, com brilho de um lado e sombra do outro */}
      <rect x={-5.4} y={-292} width={10.8} height={240} rx={4.6} fill="#0a0d10" />
      <rect x={-5.4} y={-292} width={2.9} height={240} rx={3} fill="rgba(255,255,255,0.15)" />
      <rect x={2.1} y={-292} width={2.6} height={240} rx={2.4} fill="rgba(0,0,0,0.5)" />

      {/* clipe */}
      <rect x={3.4} y={-285} width={2.5} height={48} rx={1.2} fill="#b89b61" />
      <rect x={3.4} y={-285} width={1} height={48} rx={0.8} fill="#d2bf92" />
    </g>
  );
};
