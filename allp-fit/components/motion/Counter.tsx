'use client';

/**
 * Contador que sobe ao entrar na tela. Escreve direto no nó de texto para não
 * disparar re-render a cada quadro. Só é usado em número confirmado.
 */
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { numeroBR } from '@/lib/utils';

type Props = { valor: number; decimais?: number; sufixo?: string; className?: string };

export function Counter({ valor, decimais = 0, sufixo = '', className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const naTela = useInView(ref, { once: true, margin: '-15% 0px' });
  const semMovimento = useReducedMotion();

  useEffect(() => {
    const alvo = ref.current;
    if (!alvo) return;

    if (semMovimento || !naTela) {
      if (semMovimento) alvo.textContent = numeroBR(valor, decimais) + sufixo;
      return;
    }

    const controle = animate(0, valor, {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        alvo.textContent = numeroBR(v, decimais) + sufixo;
      },
    });

    return () => controle.stop();
  }, [naTela, valor, decimais, sufixo, semMovimento]);

  return (
    <span ref={ref} className={className}>
      {numeroBR(0, decimais) + sufixo}
    </span>
  );
}
