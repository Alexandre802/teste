'use client';

/**
 * Título que sobe de dentro de uma máscara, palavra por palavra — o gesto de
 * abertura das seções fortes.
 *
 * O texto continua sendo uma única frase para leitor de tela (as palavras
 * visíveis ficam com aria-hidden), e a marcação é a mesma com ou sem
 * `prefers-reduced-motion`: só a duração muda.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { dur, suave } from '@/components/motion/config';
import { cn } from '@/lib/utils';

type Props = {
  texto: string;
  className?: string;
  delay?: number;
  /** Tag semântica do título. */
  as?: 'h1' | 'h2' | 'h3' | 'p';
  /** Centraliza as palavras (títulos de seção centralizados). */
  centro?: boolean;
};

export function TextReveal({ texto, className, delay = 0, as = 'h2', centro = false }: Props) {
  const semMovimento = useReducedMotion();
  const Tag = as;
  const palavras = texto.split(' ');

  return (
    <Tag className={cn('relative', className)}>
      <span className="sr-only">{texto}</span>
      <motion.span
        aria-hidden
        className={cn('flex flex-wrap gap-x-[0.28em]', centro && 'justify-center')}
        initial="oculto"
        whileInView="visivel"
        viewport={{ once: true, margin: '-12% 0px' }}
        variants={{
          visivel: {
            transition: {
              staggerChildren: dur(semMovimento, 0.055),
              delayChildren: dur(semMovimento, delay),
            },
          },
        }}
      >
        {palavras.map((palavra, i) => (
          <span key={`${palavra}-${i}`} className="inline-block overflow-hidden pb-[0.06em]">
            <motion.span
              className="inline-block"
              variants={{
                oculto: { y: '108%' },
                visivel: { y: '0%', transition: { duration: dur(semMovimento, 0.85), ease: suave } },
              }}
            >
              {palavra}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
