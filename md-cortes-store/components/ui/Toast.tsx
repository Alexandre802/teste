"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Tone = "sucesso" | "erro" | "aviso";

interface ToastItem {
  id: string;
  tone: Tone;
  title: string;
  description?: string;
}

const ToastContext = createContext<{ toast: (item: Omit<ToastItem, "id">) => void } | null>(null);

const ICONS: Record<Tone, ReactNode> = {
  sucesso: <CheckCircle2 size={20} className="text-verde" />,
  erro: <AlertTriangle size={20} className="text-vermelho" />,
  aviso: <Info size={20} className="text-laranja" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setItems((current) => [...current, { ...item, id }]);
    setTimeout(() => setItems((current) => current.filter((i) => i.id !== id)), 3600);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              role="status"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-card border border-borda bg-branco px-4 py-3 shadow-flutuante"
            >
              <span className="mt-0.5">{ICONS[item.tone]}</span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-tinta">{item.title}</span>
                {item.description ? (
                  <span className="block text-[13px] text-cinza">{item.description}</span>
                ) : null}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast precisa do ToastProvider");
  return context.toast;
}
