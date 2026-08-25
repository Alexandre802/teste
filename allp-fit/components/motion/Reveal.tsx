'use client';

/**
 * Entrada padrão das seções: sobe alguns pixels e ganha nitidez ao entrar na
 * viewport, uma única vez. Só `transform`, `opacity` e `filter` são animados —
 * nada que provoque reflow de layout.
 *
 * Com `prefers-reduced-motion` o conteúdo assume o estado final na hora, sem
 * trocar a marcação (ver components/motion/config.ts).
 */
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { dur, suave } from '@/components/motion/config';

const tags = {
  div: motion.div,
  span: motion.span,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  li: motion.li,
  p: motion.p,
  header: motion.header,
  figure: motion.figure,
} as const;

export type TagMotion = keyof typeof tags;

type PropsReveal = {
  children: ReactNode;
  /** Atraso em segundos — usado para escalonar irmãos. */
  delay?: number;
  /** Deslocamento inicial no eixo Y. */
  y?: number;
  /** Começa levemente desfocado (blur-to-sharp), para títulos. */
  blur?: boolean;
  as?: TagMotion;
  className?: string;
  id?: string;
};

export function Reveal({
  children,
  delay = 0,
  y = 26,
  blur = false,
  as = 'div',
  className,
  id,
}: PropsReveal) {
  const semMovimento = useReducedMotion();
  const Componente = tags[as];

  return (
    <Componente
      id={id}
      className={className}
      initial={{ opacity: 0, y, filter: blur ? 'blur(10px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      transition={{ duration: dur(semMovimento, 0.75), delay: dur(semMovimento, delay), ease: suave }}
    >
      {children}
    </Componente>
  );
}

/** Container que escalona a entrada dos filhos (usar com `ItemStagger`). */
export function Stagger({
  children,
  className,
  intervalo = 0.09,
  delay = 0,
  as = 'div',
  id,
}: {
  children: ReactNode;
  className?: string;
  intervalo?: number;
  delay?: number;
  as?: TagMotion;
  id?: string;
}) {
  const semMovimento = useReducedMotion();
  const Componente = tags[as];

  return (
    <Componente
      id={id}
      className={className}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={{
        visivel: {
          transition: {
            staggerChildren: dur(semMovimento, intervalo),
            delayChildren: dur(semMovimento, delay),
          },
        },
      }}
    >
      {children}
    </Componente>
  );
}

export function ItemStagger({
  children,
  className,
  y = 24,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  as?: TagMotion;
}) {
  const semMovimento = useReducedMotion();
  const Componente = tags[as];

  return (
    <Componente
      className={className}
      variants={{
        oculto: { opacity: 0, y },
        visivel: {
          opacity: 1,
          y: 0,
          transition: { duration: dur(semMovimento, 0.7), ease: suave },
        },
      }}
    >
      {children}
    </Componente>
  );
}
