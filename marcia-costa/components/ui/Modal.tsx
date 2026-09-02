"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

/**
 * Folha que sobe por baixo no celular e vira caixa centrada no desktop.
 *
 * Fechamento: o X e um <button onClick> de verdade (nada de listener preso a
 * elemento que ja existia), tocar fora fecha, Esc fecha. O foco entra na folha
 * ao abrir e volta para quem abriu ao fechar.
 */
export function Modal({
  aberto,
  aoFechar,
  titulo,
  children,
  rodape,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  rodape?: ReactNode;
}) {
  const painel = useRef<HTMLDivElement>(null);
  const focoAnterior = useRef<HTMLElement | null>(null);
  const tituloId = useId();

  useEffect(() => {
    if (!aberto) return;

    focoAnterior.current = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    painel.current?.focus();

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
      focoAnterior.current?.focus?.();
    };
  }, [aberto, aoFechar]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.button
            type="button"
            aria-label="Fechar tocando fora"
            tabIndex={-1}
            onClick={aoFechar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 h-full w-full cursor-default bg-tinta/50"
          />

          <motion.div
            ref={painel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-gigante bg-white shadow-flutuante outline-none sm:max-w-lg sm:rounded-gigante"
          >
            <header className="flex items-start justify-between gap-3 border-b border-borda px-5 py-4">
              <h2
                id={tituloId}
                className="fonte-titulo pr-2 text-lg font-bold text-tinta"
              >
                {titulo}
              </h2>
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar"
                className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-tinta-media transition-colors hover:bg-nevoa hover:text-tinta"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>

            {rodape && (
              <footer className="border-t border-borda bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                {rodape}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
