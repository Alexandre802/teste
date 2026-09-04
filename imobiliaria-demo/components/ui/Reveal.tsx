'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefereMenosMovimento } from '@/lib/use-reduced-motion';

type Props = {
  children: ReactNode;
  /** Atraso em segundos — usado para escalonar cards de uma mesma grade. */
  delay?: number;
  className?: string;
};

/**
 * Entrada discreta ao chegar na viewport: opacidade e 25px de deslocamento.
 * O movimento cinematográfico é só o do hero; aqui é apenas respiro.
 */
export const Reveal = ({ children, delay = 0, className }: Props) => {
  const menosMovimento = usePrefereMenosMovimento();

  if (menosMovimento) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
