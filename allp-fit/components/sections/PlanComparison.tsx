'use client';

/**
 * "Compare os planos". No desktop é tabela; no celular vira acordeão por
 * plano — a mesma informação, sem rolagem lateral.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Minus } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { comparacao, planos } from '@/data/plans';
import { cn } from '@/lib/utils';

function Marca({ valor }: { valor: boolean | string }) {
  if (typeof valor === 'string') {
    return <span className="text-sm text-white/85">{valor}</span>;
  }

  return valor ? (
    <>
      <Check size={17} className="mx-auto text-ciano" aria-hidden />
      <span className="sr-only">incluído</span>
    </>
  ) : (
    <>
      <Minus size={17} className="mx-auto text-white/25" aria-hidden />
      <span className="sr-only">não incluído</span>
    </>
  );
}

export function PlanComparison() {
  const [aberto, setAberto] = useState<string | null>(planos.find((p) => p.destaque)?.id ?? null);
  const semMovimento = useReducedMotion();

  return (
    <div className="mt-20">
      <Reveal>
        <h3 className="text-center font-display text-2xl font-extrabold tracking-[-0.03em] text-white md:text-3xl">
          Compare os planos
        </h3>
      </Reveal>

      {/* ── desktop: tabela ─────────────────────────────────────────────── */}
      <Reveal delay={0.08} className="mt-8 hidden md:block">
        <div className="card overflow-hidden">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Comparação dos recursos incluídos em cada plano da Allp Fit
            </caption>
            <thead>
              <tr className="border-b border-white/10">
                <th scope="col" className="px-6 py-5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cinza">
                  Recurso
                </th>
                {planos.map((plano) => (
                  <th
                    key={plano.id}
                    scope="col"
                    className={cn(
                      'px-4 py-5 text-center font-display text-base font-bold',
                      plano.destaque ? 'text-laranja' : 'text-white',
                    )}
                  >
                    {plano.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparacao.map((linha, i) => (
                <tr
                  key={linha.recurso}
                  className={cn('border-b border-white/6 last:border-0', i % 2 === 1 && 'bg-white/[0.015]')}
                >
                  <th scope="row" className="px-6 py-4 text-sm font-medium text-white/90">
                    {linha.recurso}
                  </th>
                  {planos.map((plano) => (
                    <td key={plano.id} className="px-4 py-4 text-center">
                      <Marca valor={linha.valores[plano.id] ?? false} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* ── celular: acordeão por plano ─────────────────────────────────── */}
      <div className="mt-8 grid gap-3 md:hidden">
        {planos.map((plano) => {
          const expandido = aberto === plano.id;

          return (
            <div key={plano.id} className="card">
              <button
                type="button"
                onClick={() => setAberto(expandido ? null : plano.id)}
                aria-expanded={expandido}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span
                  className={cn(
                    'font-display text-base font-bold',
                    plano.destaque ? 'text-laranja' : 'text-white',
                  )}
                >
                  Plano {plano.nome}
                </span>
                <ChevronDown
                  size={18}
                  aria-hidden
                  className={cn(
                    'shrink-0 text-cinza transition-transform duration-300',
                    expandido && 'rotate-180',
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {expandido && (
                  <motion.div
                    key="corpo"
                    initial={semMovimento ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={semMovimento ? { height: 'auto', opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <ul className="border-t border-white/8 px-5 py-2">
                      {comparacao.map((linha) => (
                        <li
                          key={linha.recurso}
                          className="flex items-center justify-between gap-4 border-b border-white/6 py-3 last:border-0"
                        >
                          <span className="text-sm text-white/85">{linha.recurso}</span>
                          <span className="shrink-0">
                            <Marca valor={linha.valores[plano.id] ?? false} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
