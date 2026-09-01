'use client'

/**
 * Vocabulário de movimento do produto.
 *
 * Tudo curto e discreto: opacidade e alguns pixels. Quem desliga animação no
 * sistema recebe o mesmo conteúdo, parado — `useReducedMotion` zera as
 * distâncias em vez de esconder etapa.
 */

import { useReducedMotion, type Variants } from 'framer-motion'

export const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

export function useMotionSettings() {
  const reduced = useReducedMotion()
  return {
    reduced: Boolean(reduced),
    rise: reduced ? 0 : 15,
    slide: reduced ? 0 : 12,
    duration: reduced ? 0 : 0.32,
  }
}

export function fadeUp(distance: number, duration: number): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    show: { opacity: 1, y: 0, transition: { duration, ease: EASE_OUT } },
  }
}

export function staggerList(step = 0.045): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: step, delayChildren: 0.02 } },
  }
}

export function stepTransition(distance: number, duration: number): Variants {
  return {
    hidden: { opacity: 0, x: distance },
    show: { opacity: 1, x: 0, transition: { duration, ease: EASE_OUT } },
    exit: { opacity: 0, x: -distance, transition: { duration: duration * 0.7, ease: EASE_OUT } },
  }
}
