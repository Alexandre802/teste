'use client';

/**
 * Visualizador de foto em tela cheia. Fecha no Esc, no clique fora e no botão;
 * navega com ← →. O foco vai para o próprio painel ao abrir e volta para o
 * elemento que abriu ao fechar.
 *
 * Vai para o <body> por portal: a seção que o chama tem `isolation: isolate`,
 * e sem o portal o painel ficaria preso naquele contexto de empilhamento,
 * aparecendo por baixo do cabeçalho fixo.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Foto } from '@/data/gallery';

type Props = {
  fotos: Foto[];
  /** Índice aberto, ou null com o visualizador fechado. */
  indice: number | null;
  onFechar: () => void;
  onTrocar: (indice: number) => void;
};

export function Lightbox({ fotos, indice, onFechar, onTrocar }: Props) {
  const painel = useRef<HTMLDivElement>(null);
  const semMovimento = useReducedMotion();
  const aberto = indice !== null;
  const foto = aberto ? fotos[indice] : null;

  const avancar = useCallback(
    (passo: number) => {
      if (indice === null) return;
      onTrocar((indice + passo + fotos.length) % fotos.length);
    },
    [indice, fotos.length, onTrocar],
  );

  useEffect(() => {
    if (!aberto) return;

    const focoAnterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    painel.current?.focus();

    const noTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
      if (e.key === 'ArrowRight') avancar(1);
      if (e.key === 'ArrowLeft') avancar(-1);
    };

    window.addEventListener('keydown', noTeclado);
    return () => {
      window.removeEventListener('keydown', noTeclado);
      document.body.style.overflow = overflowAnterior;
      focoAnterior?.focus();
    };
  }, [aberto, avancar, onFechar]);

  // no servidor não existe <body> para receber o portal; e o painel só abre
  // por clique, então nada é perdido na renderização inicial
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {aberto && foto && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${foto.titulo} — foto da Allp Fit`}
          ref={painel}
          tabIndex={-1}
          className="fixed inset-0 z-[70] flex flex-col bg-void/95 backdrop-blur-md"
          initial={semMovimento ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onFechar();
          }}
        >
          <div className="flex items-center justify-between gap-4 p-4 md:p-6">
            <p className="font-display text-base font-bold text-white md:text-lg">{foto.titulo}</p>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar foto"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-ciano/60"
            >
              <X size={20} aria-hidden />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-3 md:px-8">
            <motion.div
              key={foto.id}
              className="relative flex h-full w-full items-center justify-center"
              initial={semMovimento ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={foto.src}
                alt={foto.alt}
                width={foto.largura}
                height={foto.altura}
                sizes="100vw"
                className="max-h-full w-auto rounded-xl object-contain"
                priority
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 md:p-6">
            <button
              type="button"
              onClick={() => avancar(-1)}
              aria-label="Foto anterior"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-ciano/60"
            >
              <ChevronLeft size={22} aria-hidden />
            </button>

            <p className="max-w-md text-center text-xs text-cinza md:text-sm">{foto.legenda}</p>

            <button
              type="button"
              onClick={() => avancar(1)}
              aria-label="Próxima foto"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-ciano/60"
            >
              <ChevronRight size={22} aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
