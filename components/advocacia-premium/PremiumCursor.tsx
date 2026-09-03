'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './PremiumCursor.module.css';

/**
 * Ponto branco que segue o mouse.
 *
 * Só monta quando há mesmo um mouse: `(pointer: fine)` exclui toque e caneta,
 * e o primeiro `pointerdown` de toque desliga o ponto de vez — em aparelho
 * híbrido ele apareceria parado no último ponto tocado.
 *
 * A posição é escrita direto no estilo do elemento dentro de um rAF, sem
 * passar por estado do React: um ponto de cursor que re-renderiza a árvore a
 * cada movimento é o caminho mais curto para engasgar a página.
 */
export default function PremiumCursor() {
  const pontoRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia('(pointer: fine)');
    if (!consulta.matches) return;
    setAtivo(true);

    const desligar = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') setAtivo(false);
    };
    window.addEventListener('pointerdown', desligar);
    return () => window.removeEventListener('pointerdown', desligar);
  }, []);

  useEffect(() => {
    if (!ativo) return;
    const ponto = pontoRef.current;
    if (!ponto) return;

    let rafId = 0;
    let agendado = false;
    let x = 0;
    let y = 0;

    const pintar = () => {
      agendado = false;
      ponto.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const mover = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      ponto.dataset.visivel = 'sim';
      if (agendado) return;
      agendado = true;
      rafId = window.requestAnimationFrame(pintar);
    };

    // cresce sobre o que é clicável
    const sobre = (e: PointerEvent) => {
      const alvo = e.target as HTMLElement | null;
      ponto.dataset.sobre = alvo?.closest('a, button') ? 'sim' : 'nao';
    };

    const sair = () => {
      ponto.dataset.visivel = 'nao';
    };

    window.addEventListener('pointermove', mover, { passive: true });
    window.addEventListener('pointerover', sobre, { passive: true });
    document.addEventListener('pointerleave', sair);

    return () => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerover', sobre);
      document.removeEventListener('pointerleave', sair);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [ativo]);

  if (!ativo) return null;

  return <div ref={pontoRef} className={styles.ponto} data-visivel="nao" aria-hidden />;
}
