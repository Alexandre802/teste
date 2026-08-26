'use client';

import { useEffect, useMemo, useState } from 'react';
import { dados } from '@/lib/data';
import type { Profile } from '@/lib/types';

/** Os perfis que a sessão atual tem direito de ver. Só o Maicon vê os três. */
export function usePerfis({ ativo = true }: { ativo?: boolean } = {}) {
  const [lista, setLista] = useState<Profile[] | null>(null);

  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    dados
      .perfis()
      .then((p) => {
        if (vivo) setLista(p);
      })
      .catch(() => {
        if (vivo) setLista([]);
      });
    return () => {
      vivo = false;
    };
  }, [ativo]);

  const perfis = useMemo(() => lista ?? [], [lista]);
  const funcionarios = useMemo(() => perfis.filter((p) => p.role === 'employee'), [perfis]);

  return { perfis, funcionarios, carregando: ativo && lista === null };
}
