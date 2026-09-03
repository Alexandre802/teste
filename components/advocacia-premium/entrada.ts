'use client';

import { useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';

/**
 * Entrada padrão das seções: sobe pouco, desfoca pouco, some o desfoque.
 *
 * Existe para o site inteiro ter um só tempo de entrada — e para
 * `prefers-reduced-motion` ser respeitado num lugar só, em vez de repetir a
 * checagem em cada seção. Com movimento reduzido o conteúdo já nasce montado:
 * `initial: false` impede o framer de partir do estado escondido.
 */

export const CURVA = [0.22, 1, 0.36, 1] as const;

export const paiEscalonado: Variants = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const filho: Variants = {
  oculto: { opacity: 0, y: 18, filter: 'blur(7px)' },
  visivel: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: CURVA },
  },
};

export function useEntrada() {
  const reduzir = useReducedMotion();

  /** props para o contêiner que escalona os filhos */
  const lista = reduzir
    ? { initial: false as const, animate: 'visivel' as const, variants: paiEscalonado }
    : {
        initial: 'oculto' as const,
        whileInView: 'visivel' as const,
        viewport: { once: true, amount: 0.25 },
        variants: paiEscalonado,
      };

  /** props para um bloco isolado */
  const bloco = reduzir
    ? { initial: false as const, animate: 'visivel' as const, variants: filho }
    : {
        initial: 'oculto' as const,
        whileInView: 'visivel' as const,
        viewport: { once: true, amount: 0.3 },
        variants: filho,
      };

  return { reduzir, lista, bloco, item: filho };
}
