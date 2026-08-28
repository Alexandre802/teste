"use client";

import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Número que corre até o novo valor. Só o texto muda — nada de layout —
 * então a atualização do painel depois de uma venda não empurra a página.
 * Com movimento reduzido, o valor aparece direto.
 */
export function AnimatedNumber({
  value,
  format,
  className = "",
}: {
  value: number;
  format: (value: number) => string;
  className?: string;
}) {
  const motionValue = useMotionValue(value);
  const [display, setDisplay] = useState(value);
  const reduzido = useReducedMotion();

  useEffect(() => {
    if (reduzido) return;
    const controls = animate(motionValue, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [value, motionValue, reduzido]);

  return <span className={`tabular ${className}`}>{format(Math.round(reduzido ? value : display))}</span>;
}
