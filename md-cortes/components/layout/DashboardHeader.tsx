'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Marca } from './Marca';
import { Icone } from '@/components/ui/Icone';
import type { Profile } from '@/lib/types';

interface Props {
  perfil: Profile;
  /** Sino do Maicon, quando houver. */
  direita?: ReactNode;
  /** Saudação alternativa ("Olá, Maicon"). Sem isso, sai "Nome — Cargo". */
  saudacao?: string;
}

/** Iniciais no lugar da foto: não existe retrato dos três, e inventar um seria pior. */
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const segunda = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '';
  return (primeira + segunda).toUpperCase();
}

export function DashboardHeader({ perfil, direita, saudacao }: Props) {
  const admin = perfil.role === 'developer';

  return (
    <header className="topo-seguro px-4 pb-1">
      <div className="flex items-center justify-between">
        <Marca tamanho="pequeno" />
        {direita}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 flex items-center gap-3"
      >
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-ouro/45 bg-carvao-alto">
          <span className="texto-ouro text-[1.15rem] font-extrabold">
            {iniciais(perfil.name)}
          </span>
          {admin ? (
            <span className="absolute -top-1.5 -right-1 text-ouro" aria-hidden="true">
              <Icone nome="coroa" tamanho={15} />
            </span>
          ) : null}
        </span>

        <div className="min-w-0">
          <h1 className="truncate text-[1.35rem] leading-tight font-extrabold text-neve">
            {saudacao ?? perfil.name}
          </h1>
          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-ouro/30 bg-ouro/8 px-2.5 py-1 text-[0.75rem] font-medium text-ouro">
            <Icone nome={admin ? 'escudo' : 'pessoa'} tamanho={13} />
            {perfil.jobTitle ?? (admin ? 'Desenvolvedor' : 'Funcionário')}
          </span>
        </div>
      </motion.div>
    </header>
  );
}
