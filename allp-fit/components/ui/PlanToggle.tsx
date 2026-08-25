'use client';

/**
 * Seletor Mensal | Anual. A pílula desliza com `layoutId` — sem recarregar
 * nada e sem trocar o layout dos cartões.
 *
 * O selo de economia só aparece quando `descontoAnual` estiver configurado em
 * data/plans.ts. Enquanto for `null`, nenhum desconto é sugerido.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { descontoAnual, rotuloPeriodo, type Periodo } from '@/data/plans';
import { cn } from '@/lib/utils';

const periodos: Periodo[] = ['mensal', 'anual'];

export function PlanToggle({
  valor,
  onChange,
}: {
  valor: Periodo;
  onChange: (periodo: Periodo) => void;
}) {
  const semMovimento = useReducedMotion();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div
        role="tablist"
        aria-label="Periodicidade do plano"
        className="glass relative inline-flex rounded-full p-1"
      >
        {periodos.map((periodo) => {
          const ativo = valor === periodo;
          return (
            <button
              key={periodo}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => onChange(periodo)}
              className={cn(
                'relative z-10 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-300',
                ativo ? 'text-void' : 'text-cinza hover:text-white',
              )}
            >
              {ativo && (
                <motion.span
                  layoutId="pilula-periodo"
                  className="absolute inset-0 -z-10 rounded-full bg-white"
                  transition={
                    semMovimento ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }
                  }
                />
              )}
              {rotuloPeriodo[periodo]}
            </button>
          );
        })}
      </div>

      {descontoAnual !== null && (
        <span className="rounded-full border border-lima/40 bg-lima/10 px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-lima">
          Economize {descontoAnual}% no anual
        </span>
      )}
    </div>
  );
}
