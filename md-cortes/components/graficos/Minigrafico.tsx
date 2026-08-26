'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { caminhoSuave } from './serie-suave';

interface Props {
  valores: number[];
  largura?: number;
  altura?: number;
}

/**
 * A linha fininha ao lado do faturado do dia.
 *
 * Não tem eixo, número nem toque: serve só para dizer, de relance, se a semana
 * está subindo ou descendo. Quem quiser o número exato toca no gráfico grande.
 */
export function Minigrafico({ valores, largura = 108, altura = 38 }: Props) {
  const reduzido = useReducedMotion();
  const maximo = Math.max(...valores, 0);

  if (valores.length < 2 || maximo === 0) {
    return (
      <svg width={largura} height={altura} aria-hidden="true">
        <line
          x1={2}
          y1={altura - 6}
          x2={largura - 2}
          y2={altura - 6}
          stroke="#232733"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const pontos = valores.map((v, i) => ({
    x: 2 + (i / (valores.length - 1)) * (largura - 4),
    y: altura - 4 - (v / maximo) * (altura - 10),
  }));

  return (
    <svg width={largura} height={altura} aria-hidden="true" className="overflow-visible">
      <defs>
        <linearGradient id="mini-linha" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a97b28" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f0cd80" />
        </linearGradient>
      </defs>
      <motion.path
        d={caminhoSuave(pontos)}
        fill="none"
        stroke="url(#mini-linha)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduzido ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.32, 0.72, 0.35, 1] }}
      />
    </svg>
  );
}
