'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { dados } from '@/lib/data';
import { JANELA_DIAS } from '@/lib/constants';
import {
  chaveDoDia,
  fimDoDia,
  hojeEmSaoPaulo,
  inicioDaSemana,
  inicioDoDia,
  inicioDoMes,
  intervaloDeDias,
  rotuloDataCurta,
  rotuloDiaSemana,
  somaDias,
} from '@/lib/date';
import type { DayPoint, Haircut, NewHaircut } from '@/lib/types';

export interface Resumo {
  cortes: number;
  faturamento: number;
}

const VAZIO: Resumo = { cortes: 0, faturamento: 0 };
/** Mesma referência sempre: evita recalcular tudo enquanto não há carga. */
const VAZIA: Haircut[] = [];

interface Carga {
  /** Identifica a consulta que produziu esta lista. */
  chave: string;
  lista: Haircut[];
  erro: string | null;
}

/** Insere ou substitui mantendo a ordem por data decrescente. */
function inserirEmOrdem(lista: Haircut[], corte: Haircut): Haircut[] {
  const semEle = lista.filter((c) => c.id !== corte.id);
  const posicao = semEle.findIndex((c) => c.createdAt <= corte.createdAt);
  if (posicao === -1) return [...semEle, corte];
  return [...semEle.slice(0, posicao), corte, ...semEle.slice(posicao)];
}

export interface RetornoCortes {
  /** Janela dos últimos dias, do mais novo para o mais antigo. */
  cortes: Haircut[];
  carregando: boolean;
  erro: string | null;
  hoje: Resumo;
  semana: Resumo;
  mes: Resumo;
  cortesDeHoje: Haircut[];
  porDia: Map<string, Resumo>;
  /** Série pronta para o gráfico: os últimos `dias` dias, inclusive hoje. */
  serie: (dias: number) => DayPoint[];
  /** Série do primeiro dia do mês corrente até hoje. */
  serieDoMes: () => DayPoint[];
  registrar: (novo: NewHaircut) => Promise<Haircut>;
  recarregar: () => void;
}

function acumular(lista: Haircut[]): Map<string, Resumo> {
  const mapa = new Map<string, Resumo>();
  for (const corte of lista) {
    const chave = chaveDoDia(corte.createdAt);
    const atual = mapa.get(chave) ?? { cortes: 0, faturamento: 0 };
    mapa.set(chave, {
      cortes: atual.cortes + 1,
      faturamento: atual.faturamento + corte.price,
    });
  }
  return mapa;
}

function somar(mapa: Map<string, Resumo>, dias: string[]): Resumo {
  return dias.reduce<Resumo>(
    (acc, dia) => {
      const r = mapa.get(dia);
      return r ? { cortes: acc.cortes + r.cortes, faturamento: acc.faturamento + r.faturamento } : acc;
    },
    { cortes: 0, faturamento: 0 },
  );
}

/**
 * Carrega uma janela de dias de cortes e mantém ela viva.
 *
 * Uma consulta só, e todos os indicadores saem dela: hoje, semana, mês e a
 * série do gráfico. Quando chega um corte pelo Realtime, ele entra na mesma
 * lista e os números se recalculam — não há segunda ida ao banco, e por isso a
 * tela atualiza sem piscar.
 *
 * @param employeeId  restringe a um funcionário (relatório individual do Maicon).
 *                    Sem ele, vem tudo o que a sessão tem direito de ver.
 * @param ativo       false enquanto a sessão ainda não existe.
 */
export function useCortes({
  employeeId,
  ativo = true,
}: { employeeId?: string; ativo?: boolean } = {}): RetornoCortes {
  // Lista, erro e a consulta que os produziu andam juntos. Guardá-los num
  // estado só faz o "carregando" ser deduzido em vez de mantido à mão — e
  // nenhum setState precisa acontecer no corpo do efeito.
  const [carga, setCarga] = useState<Carga | null>(null);
  const [versao, setVersao] = useState(0);

  // Vira a data sozinho: sem isto, um celular aberto desde ontem continuaria
  // mostrando os números de ontem em "Hoje".
  const [diaCorrente, setDiaCorrente] = useState(hojeEmSaoPaulo);
  useEffect(() => {
    const t = setInterval(() => {
      const agora = hojeEmSaoPaulo();
      setDiaCorrente((anterior) => (anterior === agora ? anterior : agora));
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  const chave = `${employeeId ?? ''}|${diaCorrente}|${versao}`;
  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    if (!ativo) return;
    let vivo = true;

    const primeiroDia = somaDias(diaCorrente, -(JANELA_DIAS - 1));
    dados
      .cortes({ from: inicioDoDia(primeiroDia), to: fimDoDia(diaCorrente), employeeId })
      .then((lista) => {
        if (vivo) setCarga({ chave, lista, erro: null });
      })
      .catch((e: unknown) => {
        if (!vivo) return;
        const msg = e instanceof Error ? e.message : 'Não foi possível carregar os cortes.';
        setCarga({ chave, lista: [], erro: msg });
      });

    return () => {
      vivo = false;
    };
  }, [ativo, employeeId, diaCorrente, chave]);

  // Tempo real: entra, sai ou muda um corte sem recarregar a página.
  useEffect(() => {
    if (!ativo) return;
    return dados.escutar({
      aoCorte: (evento) => {
        setCarga((atual) => {
          if (!atual) return atual;
          if (evento.tipo === 'DELETE') {
            return { ...atual, lista: atual.lista.filter((c) => c.id !== evento.id) };
          }
          const corte = evento.corte;
          if (!corte) return atual;
          if (employeeId && corte.employeeId !== employeeId) return atual;
          return { ...atual, lista: inserirEmOrdem(atual.lista, corte) };
        });
      },
    });
  }, [ativo, employeeId]);

  const cortes = carga?.lista ?? VAZIA;
  const erro = carga?.erro ?? null;
  // Só a primeira carga mostra esqueleto: numa releitura, a tela continua com
  // os números antigos até os novos chegarem, em vez de piscar.
  const carregando = ativo && carga === null;

  const porDia = useMemo(() => acumular(cortes), [cortes]);

  const hoje = useMemo(() => porDia.get(diaCorrente) ?? VAZIO, [porDia, diaCorrente]);

  const semana = useMemo(
    () => somar(porDia, intervaloDeDias(inicioDaSemana(diaCorrente), diaCorrente)),
    [porDia, diaCorrente],
  );

  const mes = useMemo(
    () => somar(porDia, intervaloDeDias(inicioDoMes(diaCorrente), diaCorrente)),
    [porDia, diaCorrente],
  );

  const cortesDeHoje = useMemo(
    () => cortes.filter((c) => chaveDoDia(c.createdAt) === diaCorrente),
    [cortes, diaCorrente],
  );

  const montarSerie = useCallback(
    (primeiro: string, ultimo: string, longa: boolean): DayPoint[] =>
      intervaloDeDias(primeiro, ultimo).map((dia) => {
        const r = porDia.get(dia) ?? VAZIO;
        return {
          dayKey: dia,
          label: longa ? rotuloDataCurta(dia) : rotuloDiaSemana(dia),
          count: r.cortes,
          revenue: r.faturamento,
        };
      }),
    [porDia],
  );

  const serie = useCallback(
    (dias: number) => montarSerie(somaDias(diaCorrente, -(dias - 1)), diaCorrente, dias > 10),
    [montarSerie, diaCorrente],
  );

  const serieDoMes = useCallback(
    () => montarSerie(inicioDoMes(diaCorrente), diaCorrente, true),
    [montarSerie, diaCorrente],
  );

  const registrar = useCallback(async (novo: NewHaircut) => {
    const corte = await dados.registrarCorte(novo);
    // Entra na hora, sem esperar o eco do Realtime. O merge por id evita duplicar.
    setCarga((atual) => (atual ? { ...atual, lista: inserirEmOrdem(atual.lista, corte) } : atual));
    return corte;
  }, []);

  return {
    cortes,
    carregando,
    erro,
    hoje,
    semana,
    mes,
    cortesDeHoje,
    porDia,
    serie,
    serieDoMes,
    registrar,
    recarregar,
  };
}
