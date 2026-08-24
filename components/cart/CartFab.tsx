'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cartSummary, useShop } from '@/lib/store';
import { useHydrated } from '@/lib/use-hydrated';
import { BagIcon } from '../ui/Icons';
import CartDrawer from './CartDrawer';

/** Botão flutuante da sacola. Só aparece quando existe item. */
export default function CartFab() {
  const lines = useShop((s) => s.lines);
  const [open, setOpen] = useState(false);
  // o estado vem do localStorage; só renderiza depois da hidratação
  const hydrated = useHydrated();

  const visible = hydrated && lines.length > 0;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-0"
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-7 py-4 font-extrabold text-cocoa shadow-[0_18px_46px_-12px_rgba(110,40,5,0.75)] transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <BagIcon className="h-5 w-5 text-flame" />
              {cartSummary(lines)}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
