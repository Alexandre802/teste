'use client';

import { useEffect, useMemo, useState } from 'react';
import { dados } from '@/lib/data';
import { SERVICOS_PADRAO } from '@/lib/constants';
import type { Service } from '@/lib/types';

/** Catálogo de serviços do formulário. Cai no padrão se o banco vier vazio. */
export function useServicos() {
  const [lista, setLista] = useState<Service[] | null>(null);

  useEffect(() => {
    let vivo = true;
    dados
      .servicos()
      .then((s) => {
        if (vivo) setLista(s.length > 0 ? s : padrao());
      })
      .catch(() => {
        if (vivo) setLista(padrao());
      });
    return () => {
      vivo = false;
    };
  }, []);

  // Antes da resposta o formulário já mostra o catálogo padrão: o funcionário
  // não fica olhando um "Selecione o serviço" que não abre nada.
  const servicos = useMemo(() => lista ?? padrao(), [lista]);
  return { servicos, carregando: lista === null };
}

function padrao(): Service[] {
  return SERVICOS_PADRAO.map((nome, i) => ({
    id: `local-servico-${i}`,
    name: nome,
    defaultPrice: 0,
    active: true,
    sortOrder: i,
  }));
}
