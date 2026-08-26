'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { CartaoIndicador } from '@/components/ui/MetricCard';
import { CartaoFaturamento } from '@/components/ui/CartaoFaturamento';
import { EsqueletoGrafico, EsqueletoIndicadores } from '@/components/ui/Esqueleto';
import { Icone } from '@/components/ui/Icone';
import { ResultsChart } from '@/components/graficos/ResultsChart';
import { RegisterHaircutForm } from '@/components/cortes/RegisterHaircutForm';
import { TodayTransactions } from '@/components/cortes/TodayTransactions';
import { AvisoDeModo } from '@/components/pwa/AvisoDeModo';
import { useCortes } from '@/lib/hooks/use-cortes';
import { useServicos } from '@/lib/hooks/use-servicos';
import { plural } from '@/lib/format';
import type { Profile } from '@/lib/types';

/**
 * O painel do Gabriel e do Nino.
 *
 * A ordem da tela responde à pergunta "como foi hoje?" e em seguida entrega o
 * formulário — que é o motivo real de o funcionário abrir o app. Tudo que está
 * acima do formulário se recalcula sozinho quando ele lança o corte.
 */
export function PainelFuncionario({ perfil }: { perfil: Profile }) {
  const { hoje, semana, mes, cortesDeHoje, carregando, erro, serie, registrar } = useCortes();
  const { servicos } = useServicos();
  const [periodo, setPeriodo] = useState('7');
  const formularioRef = useRef<HTMLDivElement>(null);

  const dias = periodo === '30' ? 30 : 7;
  const pontos = serie(dias);
  const serieFaturamento = serie(7).map((p) => p.revenue);

  return (
    <>
      <DashboardHeader perfil={perfil} saudacao={`${perfil.name} — ${perfil.jobTitle ?? ''}`.trim()} />

      <div className="mt-5 grid gap-3.5 px-4 lg:grid-cols-2 lg:items-start">
        {erro ? (
          <p className="flex items-start gap-2 rounded-xl border border-alerta/40 bg-alerta/8 px-3 py-2.5 text-[0.8rem] text-alerta lg:col-span-2">
            <Icone nome="alerta" tamanho={15} className="mt-0.5 shrink-0" />
            {erro}
          </p>
        ) : null}

        {carregando ? (
          <div className="flex flex-col gap-3.5">
            <EsqueletoIndicadores colunas={3} />
            <div className="cartao h-[5.5rem]" />
            <EsqueletoGrafico />
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
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
              rotulo="Faturado hoje"
              valor={hoje.faturamento}
              serie={serieFaturamento}
            />

            <ResultsChart
              titulo="Atividade de cortes"
              serie={pontos}
              metrica="cortes"
              periodos={[
                { id: '7', rotulo: '7 dias' },
                { id: '30', rotulo: '30 dias' },
              ]}
              periodoAtivo={periodo}
              aoTrocarPeriodo={setPeriodo}
            />
          </div>
        )}

        <div className="flex flex-col gap-3.5">
          <div ref={formularioRef} className="scroll-mt-4">
            <RegisterHaircutForm servicos={servicos} registrar={registrar} />
          </div>

          <TodayTransactions
            cortes={cortesDeHoje}
            carregando={carregando}
            aoRegistrarPrimeiro={() =>
              formularioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2.5 rounded-2xl border border-ouro/22 bg-ouro/[0.04] px-4 py-3 text-center text-[0.8rem] leading-snug text-ouro/85 lg:col-span-2"
        >
          <Icone nome="nuvem" tamanho={19} className="shrink-0" />
          Todos os registros são enviados ao painel do Desenvolvedor Maicon
        </motion.p>

        <div className="lg:col-span-2">
          <AvisoDeModo />
        </div>
      </div>
    </>
  );
}
