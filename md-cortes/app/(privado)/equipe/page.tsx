'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';
import { CartaoIndicador } from '@/components/ui/MetricCard';
import { EsqueletoIndicadores } from '@/components/ui/Esqueleto';
import { EmployeeCard } from '@/components/equipe/EmployeeCard';
import { RelatorioIndividual } from '@/components/equipe/RelatorioIndividual';
import { EstadoVazio } from '@/components/ui/EstadoVazio';
import { useCortes } from '@/lib/hooks/use-cortes';
import { usePerfis } from '@/lib/hooks/use-perfis';
import { useSessao } from '@/lib/hooks/use-sessao';
import { RESUMO_ZERO, resumirPorFuncionario } from '@/lib/resumo';
import { moeda, plural } from '@/lib/format';
import type { Profile } from '@/lib/types';

/** Página da equipe. Só o Maicon chega aqui — os outros voltam para o início. */
export default function PaginaEquipe() {
  const router = useRouter();
  const { ehAdmin, carregando: carregandoSessao } = useSessao();
  const { funcionarios, carregando: carregandoPerfis } = usePerfis({ ativo: ehAdmin });
  const { cortes, hoje, semana, mes, carregando } = useCortes({ ativo: ehAdmin });
  const [emFoco, setEmFoco] = useState<Profile | null>(null);

  useEffect(() => {
    if (!carregandoSessao && !ehAdmin) router.replace('/inicio');
  }, [carregandoSessao, ehAdmin, router]);

  const resumos = useMemo(() => resumirPorFuncionario(cortes), [cortes]);

  if (!ehAdmin) return null;

  return (
    <>
      <header className="topo-seguro px-4 pb-1">
        <h1 className="flex items-center gap-2 text-[1.4rem] font-extrabold text-neve">
          <Icone nome="equipe" tamanho={21} className="text-ouro" />
          Equipe
        </h1>
        <p className="mt-1 text-[0.82rem] text-fumaca">
          Toque em um funcionário para abrir o relatório dele.
        </p>
      </header>

      <div className="mt-4 flex flex-col gap-3.5 px-4">
        {carregando ? (
          <EsqueletoIndicadores colunas={3} />
        ) : (
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
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.14 }}
          className="cartao-ouro flex items-center justify-between p-4"
        >
          <span className="text-[0.82rem] text-fumaca">Faturamento do mês (equipe)</span>
          <strong className="numero text-[1.2rem] font-extrabold text-ouro-claro">
            {moeda(mes.faturamento)}
          </strong>
        </motion.div>

        {carregandoPerfis ? (
          <div className="cartao h-44" />
        ) : funcionarios.length === 0 ? (
          <div className="cartao">
            <EstadoVazio
              icone="equipe"
              titulo="Nenhum funcionário cadastrado"
              descricao="Cadastre Gabriel e Nino no Supabase e rode o seed.sql para definir os cargos."
            />
          </div>
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
      </div>

      <RelatorioIndividual perfil={emFoco} aoFechar={() => setEmFoco(null)} />
    </>
  );
}
