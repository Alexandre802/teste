'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { CartaoIndicador } from '@/components/ui/MetricCard';
import { EsqueletoGrafico, EsqueletoIndicadores } from '@/components/ui/Esqueleto';
import { Icone } from '@/components/ui/Icone';
import { ResultsChart, type Metrica } from '@/components/graficos/ResultsChart';
import { TodayTransactions } from '@/components/cortes/TodayTransactions';
import { EmployeeCard } from '@/components/equipe/EmployeeCard';
import { RelatorioIndividual } from '@/components/equipe/RelatorioIndividual';
import { NotificationBell } from '@/components/notificacoes/NotificationBell';
import { NotificationPanel } from '@/components/notificacoes/NotificationPanel';
import { useCortes } from '@/lib/hooks/use-cortes';
import { usePerfis } from '@/lib/hooks/use-perfis';
import { useCentral } from '@/lib/hooks/use-central';
import { moeda, plural } from '@/lib/format';
import { RESUMO_ZERO, resumirPorFuncionario } from '@/lib/resumo';
import type { Profile } from '@/lib/types';

/**
 * O painel do Maicon: a barbearia inteira numa tela.
 *
 * Mesma origem de dados do painel do funcionário — só que sem filtro de autor,
 * porque a RLS já devolve tudo para quem é `developer`. Os recortes por pessoa
 * saem da mesma lista, sem consulta extra.
 */
export function PainelAdmin({ perfil }: { perfil: Profile }) {
  const { hoje, semana, mes, cortes, cortesDeHoje, carregando, erro, serie, serieDoMes } =
    useCortes();
  const { funcionarios, carregando: carregandoPerfis } = usePerfis();
  const central = useCentral();

  const [periodo, setPeriodo] = useState('7');
  const [metrica, setMetrica] = useState<Metrica>('cortes');
  const [sinoAberto, setSinoAberto] = useState(false);
  const [emFoco, setEmFoco] = useState<Profile | null>(null);

  const resumos = useMemo(() => resumirPorFuncionario(cortes), [cortes]);
  const pontos = periodo === 'mes' ? serieDoMes() : serie(periodo === '30' ? 30 : 7);

  return (
    <>
      <DashboardHeader
        perfil={perfil}
        saudacao={`Olá, ${perfil.name}`}
        direita={
          <NotificationBell
            naoLidas={central.naoLidas}
            aberto={sinoAberto}
            aoAlternar={() => setSinoAberto((v) => !v)}
          />
        }
      />

      <div className="mt-5 flex flex-col gap-3.5 px-4">
        {erro ? (
          <p className="flex items-start gap-2 rounded-xl border border-alerta/40 bg-alerta/8 px-3 py-2.5 text-[0.8rem] text-alerta">
            <Icone nome="alerta" tamanho={15} className="mt-0.5 shrink-0" />
            {erro}
          </p>
        ) : null}

        {carregando ? (
          <>
            <EsqueletoIndicadores colunas={2} />
            <EsqueletoIndicadores colunas={2} />
            <EsqueletoGrafico />
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <CartaoIndicador
                rotulo="Cortes hoje"
                valor={hoje.cortes}
                unidade={plural(hoje.cortes, 'corte da equipe', 'cortes da equipe')}
                icone="tesoura"
                ordem={0}
              />
              <CartaoIndicador
                rotulo="Faturamento hoje"
                valor={hoje.faturamento}
                formatar={moeda}
                icone="dinheiro"
                ordem={1}
                destaque
              />
              <CartaoIndicador
                rotulo="Cortes esta semana"
                valor={semana.cortes}
                unidade={plural(semana.cortes, 'corte', 'cortes')}
                icone="semana"
                ordem={2}
              />
              <CartaoIndicador
                rotulo="Faturamento do mês"
                valor={mes.faturamento}
                formatar={moeda}
                icone="barras"
                ordem={3}
                destaque
              />
            </div>

            <ResultsChart
              titulo="Resultados da barbearia"
              serie={pontos}
              metrica={metrica}
              altura={196}
              alternaMetrica
              aoTrocarMetrica={setMetrica}
              periodos={[
                { id: '7', rotulo: '7 dias' },
                { id: '30', rotulo: '30 dias' },
                { id: 'mes', rotulo: 'Mês atual' },
              ]}
              periodoAtivo={periodo}
              aoTrocarPeriodo={setPeriodo}
            />
          </>
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold text-neve">
              <Icone nome="equipe" tamanho={17} className="text-ouro" />
              Equipe
            </h2>
            <Link
              href="/equipe"
              className="text-[0.8rem] font-medium text-ouro transition-opacity hover:opacity-80"
            >
              Ver tudo
            </Link>
          </div>

          {carregandoPerfis ? (
            <div className="cartao h-40" />
          ) : funcionarios.length === 0 ? (
            <p className="cartao px-4 py-5 text-center text-[0.82rem] text-fumaca">
              Nenhum funcionário cadastrado ainda.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {funcionarios.map((f, i) => (
                <EmployeeCard
                  key={f.id}
                  perfil={f}
                  resumo={resumos.get(f.id) ?? RESUMO_ZERO}
                  ordem={i}
                  aoAbrir={() => setEmFoco(f)}
                />
              ))}
            </div>
          )}
        </motion.section>

        <TodayTransactions
          cortes={cortesDeHoje}
          carregando={carregando}
          mostrarAutor
          titulo="Lançamentos de hoje"
        />

      </div>

      <NotificationPanel
        aberto={sinoAberto}
        notificacoes={central.notificacoes}
        carregando={central.carregando}
        aoFechar={() => setSinoAberto(false)}
        aoMarcarLida={central.marcarLida}
        aoMarcarTodasLidas={central.marcarTodasLidas}
      />

      <RelatorioIndividual perfil={emFoco} aoFechar={() => setEmFoco(null)} />
    </>
  );
}
