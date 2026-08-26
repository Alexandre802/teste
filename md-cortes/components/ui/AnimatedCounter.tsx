'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Props {
  valor: number;
  /** Formata o número já animado. Sem isso, sai inteiro. */
  formatar?: (n: number) => string;
  duracao?: number;
  className?: string;
}

/**
 * Conta do valor anterior até o novo.
 *
 * Quando um corte entra pelo tempo real, o 5 vira 6 subindo — a mudança fica
 * visível sem piscar a tela inteira. Na primeira carga sobe de zero.
 *
 * Não usa `motion.span` com spring de propósito: o valor precisa parar
 * exatamente no número certo, e um spring passa do ponto antes de assentar.
 */
export function ContadorAnimado({ valor, formatar, duracao = 700, className }: Props) {
  const reduzido = useReducedMotion();
  const [exibido, setExibido] = useState(valor);
  const anteriorRef = useRef(valor);
  const quadroRef = useRef<number | null>(null);

  useEffect(() => {
    const de = anteriorRef.current;
    const para = valor;
    anteriorRef.current = valor;

    if (reduzido || de === para) {
      setExibido(para);
      return;
    }

    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min((agora - inicio) / duracao, 1);
      // easeOutCubic: rápido no começo, assenta suave — sem elástico.
      const suave = 1 - Math.pow(1 - t, 3);
      setExibido(de + (para - de) * suave);
      if (t < 1) quadroRef.current = requestAnimationFrame(passo);
    };
    quadroRef.current = requestAnimationFrame(passo);

    return () => {
      if (quadroRef.current) cancelAnimationFrame(quadroRef.current);
    };
  }, [valor, duracao, reduzido]);

  const texto = formatar ? formatar(exibido) : String(Math.round(exibido));
  return (
    <span className={className} suppressHydrationWarning>
      {texto}
    </span>
  );
}
