'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';
import { CartaoIndicador } from '@/components/ui/MetricCard';
import { CartaoFaturamento } from '@/components/ui/CartaoFaturamento';
import { EsqueletoGrafico, EsqueletoIndicadores } from '@/components/ui/Esqueleto';
import { ResultsChart, type Metrica } from '@/components/graficos/ResultsChart';
import { TodayTransactions } from '@/components/cortes/TodayTransactions';
import { useCortes } from '@/lib/hooks/use-cortes';
import { moeda, plural } from '@/lib/format';
import type { Profile } from '@/lib/types';

interface Props {
  perfil: Profile | null;
  aoFechar: () => void;
}

/**
 * Relatório individual — o que o Maicon vê ao tocar num funcionário.
 *
 * Sobe como uma folha por cima do painel em vez de virar uma rota própria: o
 * app é estático e uma rota com o id do funcionário na URL precisaria ser
 * gerada na build, quando esses ids ainda nem existem.
 */
export function RelatorioIndividual({ perfil, aoFechar }: Props) {
  return (
    <AnimatePresence>
      {perfil ? <Conteudo key={perfil.id} perfil={perfil} aoFechar={aoFechar} /> : null}
    </AnimatePresence>
  );
}

function Conteudo({ perfil, aoFechar }: { perfil: Profile; aoFechar: () => void }) {
  const { hoje, semana, mes, cortesDeHoje, cortes, carregando, serie } = useCortes({
    employeeId: perfil.id,
  });
  const [periodo, setPeriodo] = useState('7');
  const [metrica, setMetrica] = useState<Metrica>('cortes');

  const dias = periodo === '30' ? 30 : 7;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={aoFechar}
        className="fixed inset-0 z-40 bg-noite/75 backdrop-blur-[2px]"
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-label={`Relatório de ${perfil.name}`}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 36 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-hidden rounded-t-3xl border-t border-grafite bg-noite"
      >
        <header className="flex items-center gap-3 border-b border-grafite px-4 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ouro/35 bg-ouro/8 text-ouro">
            <Icone nome="pessoa" tamanho={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[1.05rem] font-bold text-neve">{perfil.name}</h2>
            <p className="text-[0.75rem] text-fumaca-fraca">{perfil.jobTitle ?? 'Funcionário'}</p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar relatório"
            className="rounded-full border border-grafite p-2 text-fumaca transition-colors hover:text-neve"
          >
            <Icone nome="fechar" tamanho={16} />
          </button>
        </header>

        <div
          className="flex max-h-[calc(92dvh-4.5rem)] flex-col gap-3.5 overflow-y-auto overscroll-contain px-4 py-4"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
        >
          {carregando ? (
            <>
              <EsqueletoIndicadores colunas={3} />
              <EsqueletoGrafico />
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <CartaoIndicador
                  rotulo="Hoje"
                  valor={hoje.cortes}
                  unidade={plural(hoje.cortes, 'corte', 'cortes')}
                  icone="calendario"
                  ordem={0}
                />
                <CartaoIndicador
                  rotulo="Semana"
                  valor={semana.cortes}
                  unidade={plural(semana.cortes, 'corte', 'cortes')}
                  icone="semana"
                  ordem={1}
                />
                <CartaoIndicador
                  rotulo="Mês"
                  valor={mes.cortes}
                  unidade={plural(mes.cortes, 'corte', 'cortes')}
                  icone="barras"
                  ordem={2}
                />
              </div>

              <CartaoFaturamento
                rotulo="Faturamento do mês"
                valor={mes.faturamento}
                serie={serie(7).map((p) => p.revenue)}
              />

              <ResultsChart
                titulo={`Resultados de ${perfil.name}`}
                serie={serie(dias)}
                metrica={metrica}
                alternaMetrica
                aoTrocarMetrica={setMetrica}
                periodos={[
                  { id: '7', rotulo: '7 dias' },
                  { id: '30', rotulo: '30 dias' },
                ]}
                periodoAtivo={periodo}
                aoTrocarPeriodo={setPeriodo}
              />

              <div className="cartao flex items-center justify-between p-4">
                <span className="text-[0.82rem] text-fumaca">Faturado hoje</span>
                <strong className="numero text-[1.1rem] font-bold text-ouro">
                  {moeda(hoje.faturamento)}
                </strong>
              </div>

              <TodayTransactions
                cortes={cortesDeHoje.length > 0 ? cortesDeHoje : cortes.slice(0, 6)}
                titulo={cortesDeHoje.length > 0 ? 'Lançamentos de hoje' : 'Últimos lançamentos'}
                limite={6}
              />
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
