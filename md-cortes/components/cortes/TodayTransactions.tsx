'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Icone, iconeDoServico } from '@/components/ui/Icone';
import { EstadoVazio } from '@/components/ui/EstadoVazio';
import { EsqueletoLista } from '@/components/ui/Esqueleto';
import { ROTULO_PAGAMENTO } from '@/lib/constants';
import { hora } from '@/lib/date';
import { moeda } from '@/lib/format';
import type { Haircut } from '@/lib/types';

interface Props {
  cortes: Haircut[];
  carregando?: boolean;
  /** No painel do Maicon a lista é da equipe: aí o nome de quem lançou importa. */
  mostrarAutor?: boolean;
  titulo?: string;
  limite?: number;
  aoRegistrarPrimeiro?: () => void;
}

export function TodayTransactions({
  cortes,
  carregando = false,
  mostrarAutor = false,
  titulo = 'Lançamentos de hoje',
  limite = 6,
  aoRegistrarPrimeiro,
}: Props) {
  const visiveis = cortes.slice(0, limite);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="cartao p-4"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-[0.95rem] font-semibold text-neve">{titulo}</h2>
        {cortes.length > 0 ? (
          <Link
            href="/lancamentos"
            className="text-[0.8rem] font-medium text-ouro transition-opacity hover:opacity-80"
          >
            Ver todos
          </Link>
        ) : null}
      </header>

      <div className="mt-3">
        {carregando ? (
          <EsqueletoLista linhas={3} />
        ) : cortes.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum corte registrado hoje"
            descricao="Assim que o primeiro entrar, os números e o gráfico acima se atualizam sozinhos."
            acao={
              aoRegistrarPrimeiro ? (
                <button
                  type="button"
                  onClick={aoRegistrarPrimeiro}
                  className="btn-ouro-fantasma flex items-center gap-2 px-4 py-2.5 text-[0.85rem]"
                >
                  <Icone nome="mais" tamanho={16} />
                  Registrar primeiro corte
                </button>
              ) : null
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {visiveis.map((corte) => (
                <motion.li
                  key={corte.id}
                  layout
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ type: 'spring', stiffness: 440, damping: 36 }}
                  className="flex items-center gap-3 rounded-2xl border border-grafite/70 bg-carvao-alto px-3 py-2.5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ouro/25 bg-ouro/8 text-ouro">
                    <Icone nome={iconeDoServico(corte.serviceName)} tamanho={18} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9rem] font-semibold text-neve">
                      {corte.serviceName}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[0.75rem] text-fumaca-fraca">
                      <span className="text-ouro/80">{hora(corte.createdAt)}</span>
                      <span aria-hidden="true">•</span>
                      <span>{ROTULO_PAGAMENTO[corte.paymentMethod]}</span>
                      {mostrarAutor ? (
                        <>
                          <span aria-hidden="true">•</span>
                          <span className="truncate">{corte.employeeName}</span>
                        </>
                      ) : null}
                    </p>
                  </div>

                  <span className="numero shrink-0 text-[0.92rem] font-bold text-neve">
                    {moeda(corte.price)}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {cortes.length > limite ? (
          <Link
            href="/lancamentos"
            className="mt-2.5 flex items-center justify-center gap-1.5 rounded-2xl border border-grafite/70 py-2.5 text-[0.82rem] font-medium text-fumaca transition-colors hover:text-neve"
          >
            Ver os outros {cortes.length - limite}
            <Icone nome="seta-direita" tamanho={14} />
          </Link>
        ) : null}
      </div>
    </motion.section>
  );
}
