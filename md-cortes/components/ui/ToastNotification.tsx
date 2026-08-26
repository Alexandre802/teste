'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useToasts, type Toast } from '@/lib/hooks/use-toasts';
import { Icone, type NomeDoIcone } from './Icone';

const ICONE: Record<Toast['tipo'], NomeDoIcone> = {
  sucesso: 'check',
  erro: 'alerta',
  aviso: 'sino',
};

const COR: Record<Toast['tipo'], string> = {
  sucesso: 'text-ouro',
  erro: 'text-alerta',
  aviso: 'text-ouro',
};

const ANEL: Record<Toast['tipo'], string> = {
  sucesso: 'border-ouro/35 bg-ouro/10',
  erro: 'border-alerta/40 bg-alerta/10',
  aviso: 'border-ouro/35 bg-ouro/10',
};

/**
 * Os avisos do app. Entram por cima, somem sozinhos.
 *
 * Ficam no topo porque no celular o rodapé é da barra de navegação, e um aviso
 * que nasce embaixo do dedo do funcionário atrapalha justamente quem acabou de
 * tocar em "Adicionar corte".
 */
export function PilhaDeToasts() {
  const { toasts, fechar } = useToasts();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-3 sm:items-end sm:px-5"
      style={{ top: 'calc(var(--seguro-alto) + 0.75rem)' }}
      role="status"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 460, damping: 34, mass: 0.7 }}
            className="pointer-events-auto w-full max-w-sm"
          >
            <div className="cartao flex items-start gap-3 border-grafite/90 bg-carvao-alto/95 p-3.5 backdrop-blur-xl">
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${ANEL[toast.tipo]} ${COR[toast.tipo]}`}
              >
                <Icone nome={ICONE[toast.tipo]} tamanho={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9rem] leading-snug font-semibold text-neve">{toast.titulo}</p>
                {toast.descricao ? (
                  <p className="mt-0.5 text-[0.8rem] leading-snug text-fumaca">{toast.descricao}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => fechar(toast.id)}
                aria-label="Fechar aviso"
                className="-m-1 shrink-0 rounded-lg p-1 text-fumaca-fraca transition-colors hover:text-neve"
              >
                <Icone nome="fechar" tamanho={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
