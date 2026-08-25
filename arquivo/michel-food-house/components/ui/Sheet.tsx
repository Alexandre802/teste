'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CloseIcon } from './Icons';

/**
 * Painel deslizante. No celular sobe do rodapé (bottom sheet); a partir de
 * `sm` entra pela direita como drawer, ou centralizado quando `centered`.
 *
 * Acessibilidade: role="dialog" + aria-modal, Esc fecha, foco vai para o
 * painel ao abrir e o scroll do fundo é travado enquanto estiver aberto.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  centered = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  centered?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const enter = reduce
    ? { opacity: 1 }
    : centered
      ? { opacity: 1, scale: 1, y: 0 }
      : { opacity: 1, y: 0, x: 0 };
  const exit = reduce
    ? { opacity: 0 }
    : centered
      ? { opacity: 0, scale: 0.96, y: 12 }
      : { opacity: 0, y: '100%' };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 h-full w-full cursor-default bg-ember-deep/70 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={exit}
            animate={enter}
            exit={exit}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className={
              centered
                ? 'panel absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-[2rem] outline-none sm:inset-0 sm:m-auto sm:h-fit sm:max-w-2xl sm:rounded-[2rem]'
                : 'panel absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-[2rem] outline-none sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[27rem] sm:rounded-l-[2rem] sm:rounded-tr-none'
            }
          >
            <header className="flex items-center justify-between gap-4 border-b border-white/25 px-6 py-5">
              <h2 className="text-lg font-extrabold text-white">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>

            {footer && <footer className="border-t border-white/25 px-6 py-5">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
