'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { dados } from '@/lib/data';
import {
  chaveDoDia,
  fimDoDia,
  hojeEmSaoPaulo,
  inicioDaSemana,
  inicioDoDia,
  inicioDoMes,
} from '@/lib/date';
import type { Haircut } from '@/lib/types';

export type Recorte = 'hoje' | 'semana' | 'mes' | 'personalizado';

export interface FiltroHistorico {
  recorte: Recorte;
  /** 'YYYY-MM-DD', usados só quando o recorte é personalizado. */
  de?: string;
  ate?: string;
  employeeId?: string;
}

export interface DiaAgrupado {
  dayKey: string;
  cortes: Haircut[];
  total: number;
}

/** Traduz o filtro escolhido na tela em um intervalo de datas de São Paulo. */
export function faixaDoFiltro(filtro: FiltroHistorico): { primeiro: string; ultimo: string } {
  const hoje = hojeEmSaoPaulo();
  switch (filtro.recorte) {
    case 'hoje':
      return { primeiro: hoje, ultimo: hoje };
    case 'semana':
      return { primeiro: inicioDaSemana(hoje), ultimo: hoje };
    case 'mes':
      return { primeiro: inicioDoMes(hoje), ultimo: hoje };
    case 'personalizado': {
      const primeiro = filtro.de || hoje;
      const ultimo = filtro.ate || hoje;
      // Datas invertidas pelo usuário não podem virar intervalo vazio.
      return primeiro <= ultimo ? { primeiro, ultimo } : { primeiro: ultimo, ultimo: primeiro };
    }
  }
}

/**
 * O histórico da página "Lançamentos".
 *
 * Consulta própria, separada da janela do painel: aqui o período é escolhido a
 * dedo e pode ser bem mais largo que os 40 dias que a tela inicial carrega.
 */
interface Carga {
  /** Identifica o filtro que produziu esta lista. */
  chave: string;
  lista: Haircut[];
  erro: string | null;
}

const VAZIA: Haircut[] = [];

export function useHistorico(filtro: FiltroHistorico, ativo = true) {
  const [carga, setCarga] = useState<Carga | null>(null);
  const [versao, setVersao] = useState(0);

  const { primeiro, ultimo } = faixaDoFiltro(filtro);
  const employeeId = filtro.employeeId;
  const chave = `${primeiro}|${ultimo}|${employeeId ?? ''}|${versao}`;

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    let vivo = true;
    dados
      .cortes({ from: inicioDoDia(primeiro), to: fimDoDia(ultimo), employeeId })
      .then((lista) => {
        if (vivo) setCarga({ chave, lista, erro: null });
      })
      .catch((e: unknown) => {
        if (!vivo) return;
        const msg = e instanceof Error ? e.message : 'Não foi possível carregar o histórico.';
        setCarga({ chave, lista: [], erro: msg });
      });
    return () => {
      vivo = false;
    };
  }, [primeiro, ultimo, employeeId, chave]);

  // Um corte lançado enquanto a lista está aberta entra nela na hora.
  useEffect(() => {
    if (!ativo) return;
    return dados.escutar({
      aoCorte: (evento) => {
        if (evento.tipo === 'DELETE') {
          setCarga((atual) =>
            atual ? { ...atual, lista: atual.lista.filter((c) => c.id !== evento.id) } : atual,
          );
          return;
        }
        const corte = evento.corte;
        if (!corte) return;
        const dia = chaveDoDia(corte.createdAt);
        if (dia < primeiro || dia > ultimo) return;
        if (employeeId && corte.employeeId !== employeeId) return;
        setCarga((atual) => {
          if (!atual) return atual;
          const lista = atual.lista.some((c) => c.id === corte.id)
            ? atual.lista.map((c) => (c.id === corte.id ? corte : c))
            : [corte, ...atual.lista].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          return { ...atual, lista };
        });
      },
    });
  }, [ativo, primeiro, ultimo, employeeId]);

  const cortes = carga?.lista ?? VAZIA;
  // Aqui o esqueleto reaparece a cada troca de filtro — foi o usuário que pediu
  // outro período, e ver a lista antiga com o filtro novo confundiria.
  const carregando = carga?.chave !== chave;
  const erro = carga?.chave === chave ? carga.erro : null;

  const porDia = useMemo<DiaAgrupado[]>(() => {
    const mapa = new Map<string, Haircut[]>();
    for (const corte of cortes) {
      const dia = chaveDoDia(corte.createdAt);
      const lista = mapa.get(dia);
      if (lista) lista.push(corte);
      else mapa.set(dia, [corte]);
    }
    return [...mapa.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([dayKey, lista]) => ({
        dayKey,
        cortes: lista,
        total: lista.reduce((s, c) => s + c.price, 0),
      }));
  }, [cortes]);

  const total = useMemo(() => cortes.reduce((s, c) => s + c.price, 0), [cortes]);

  return { cortes, porDia, total, carregando, erro, recarregar };
}
