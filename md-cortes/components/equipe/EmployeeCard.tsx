'use client';

import { motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';
import { ContadorAnimado } from '@/components/ui/AnimatedCounter';
import { moeda } from '@/lib/format';
import type { ResumoFuncionario } from '@/lib/resumo';
import type { Profile } from '@/lib/types';

interface Props {
  perfil: Profile;
  resumo: ResumoFuncionario;
  ordem?: number;
  aoAbrir: () => void;
}

/** Cartão de um funcionário no painel do Maicon. Toca e abre o relatório dele. */
export function EmployeeCard({ perfil, resumo, ordem = 0, aoAbrir }: Props) {
  return (
    <motion.button
      type="button"
      onClick={aoAbrir}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: ordem * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="cartao w-full p-4 text-left transition-colors hover:border-ouro/30"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ouro/35 bg-ouro/8 text-ouro">
          <Icone nome="pessoa" tamanho={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[1rem] font-bold text-neve">{perfil.name}</p>
          <p className="text-[0.75rem] text-fumaca-fraca">{perfil.jobTitle ?? 'Funcionário'}</p>
        </div>
        <Icone nome="seta-direita" tamanho={17} className="shrink-0 text-fumaca-fraca" />
      </div>

      <dl className="mt-3.5 grid grid-cols-3 gap-2 border-t border-grafite/70 pt-3">
        <Coluna rotulo="Hoje" valor={resumo.hojeCortes} />
        <Coluna rotulo="Semana" valor={resumo.semanaCortes} />
        <Coluna rotulo="Mês" valor={resumo.mesCortes} />
      </dl>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-carvao-alto px-3 py-2.5">
        <span className="text-[0.78rem] text-fumaca">Faturamento do mês</span>
        <ContadorAnimado
          valor={resumo.mesFaturamento}
          formatar={moeda}
          className="numero text-[0.95rem] font-bold text-ouro"
        />
      </div>
    </motion.button>
  );
}

function Coluna({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div>
      <dt className="text-[0.7rem] text-fumaca-fraca">{rotulo}</dt>
      <dd className="mt-0.5 flex items-baseline gap-1">
        <ContadorAnimado valor={valor} className="numero text-[1.15rem] font-extrabold text-neve" />
        <span className="text-[0.68rem] text-fumaca-fraca">cortes</span>
      </dd>
    </div>
  );
}
