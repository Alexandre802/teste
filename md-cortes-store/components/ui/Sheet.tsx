"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/**
 * Folha que sobe de baixo. No celular é o gesto natural; no desktop ela vira
 * um cartão centralizado em vez de uma faixa colada no rodapé.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="absolute inset-0 bg-tinta/25 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 32, opacity: 0.6, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[26px] bg-branco shadow-flutuante sm:max-w-lg sm:rounded-card"
          >
            <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
              <h2 className="text-[18px] font-bold text-tinta">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex size-9 items-center justify-center rounded-full text-cinza hover:bg-areia"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-2">{children}</div>
            {footer ? (
              <div className="border-t border-borda bg-branco px-5 pt-3 pb-[calc(1rem+var(--area-segura))]">{footer}</div>
            ) : (
              <div className="pb-[var(--area-segura)]" />
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
