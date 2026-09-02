'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Plus } from 'lucide-react';
import { carregarLancamentos } from '@/lib/admin/consultas';
import { baixarCsv, paraCsv } from '@/lib/admin/csv';
import { reais, reaisSemSimbolo } from '@/lib/admin/dinheiro';
import { dataHora, hora, isoDia, type PeriodoId } from '@/lib/admin/datas';
import { FORMA_PAGAMENTO, TIPO_LANCAMENTO } from '@/lib/admin/rotulos';
import FiltroPeriodo, { useFiltroPeriodo } from '../FiltroPeriodo';
import FormularioReceita from '../formularios/FormularioReceita';
import TituloPagina from '../TituloPagina';
import { useConsulta } from '../useConsulta';
import { Botao } from '../ui/Botao';
import { Cartao } from '../ui/Cartao';
import { Erro, EsqueletoLista, Vazio } from '../ui/Estados';

/**
 * Receitas — o dinheiro que entrou.
 *
 * Duas origens na mesma lista, e a coluna de tipo é o que as separa:
 *
 *   Pedido        gerado sozinho quando a casa marca o pedido como pago;
 *   Receita manual lançado à mão, para venda que não passou pelo site;
 *   Estorno       valor negativo, devolvido ao cliente.
 *
 * O total do período é a SOMA de tudo, estorno incluído. É o valor que
 * realmente ficou.
 */

const FILTROS: PeriodoId[] = ['hoje', 'ontem', 'sete-dias', 'trinta-dias', 'este-mes', 'personalizado'];

export default function Receitas() {
  const filtro = useFiltroPeriodo('hoje');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [recarga, setRecarga] = useState(0);

  const { de, ate } = filtro.periodo;
  const lancamentos = useConsulta(
    (sb) => carregarLancamentos(sb, de, ate),
    [de.toISOString(), ate.toISOString(), recarga],
  );

  const total = (lancamentos.dados ?? []).reduce((s, l) => s + l.amount_cents, 0);

  const exportar = () => {
    if (!lancamentos.dados?.length) return;
    const csv = paraCsv(
      ['Data', 'Tipo', 'Descrição', 'Forma de pagamento', 'Valor', 'Observação'],
      lancamentos.dados.map((l) => [
        dataHora(l.occurred_at),
        TIPO_LANCAMENTO[l.kind],
        l.description,
        FORMA_PAGAMENTO[l.method],
        reaisSemSimbolo(l.amount_cents),
        l.notes,
      ]),
    );
    baixarCsv(`receitas-${isoDia()}`, csv);
  };

  return (
    <>
      <TituloPagina
        titulo="Receitas"
        acao={
          <div className="flex items-center gap-2">
            <FiltroPeriodo
              id={filtro.id}
              aoTrocar={filtro.setId}
              intervalo={filtro.intervalo}
              aoTrocarIntervalo={filtro.setIntervalo}
              periodo={filtro.periodo}
              opcoes={FILTROS}
            />
            <Botao
              variante="secundario"
              tamanho="sm"
              onClick={exportar}
              disabled={!lancamentos.dados?.length}
            >
              <Download className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">CSV</span>
            </Botao>
            <Botao tamanho="sm" onClick={() => setFormularioAberto(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Nova receita</span>
            </Botao>
          </div>
        }
      />

      <Cartao className="mb-4 flex items-baseline justify-between gap-3 p-4">
        <span className="text-sm font-medium text-[var(--admin-tinta-suave)]">Total do período</span>
        <span className="text-xl font-extrabold tabular-nums text-[var(--admin-verde)] sm:text-2xl">
          {reais(total)}
        </span>
      </Cartao>

      {lancamentos.carregando ? (
        <EsqueletoLista linhas={6} />
      ) : lancamentos.erro ? (
        <Erro mensagem={lancamentos.erro} aoTentarDeNovo={lancamentos.recarregar} />
      ) : !lancamentos.dados || lancamentos.dados.length === 0 ? (
        <Cartao>
          <Vazio
            titulo="Nenhuma receita neste período"
            descricao="Pedidos marcados como pagos entram aqui sozinhos. Venda no balcão você lança pelo botão “Nova receita”."
            acao={
              <Botao tamanho="sm" onClick={() => setFormularioAberto(true)}>
                <Plus className="h-4 w-4" aria-hidden />
                Nova receita
              </Botao>
            }
          />
        </Cartao>
      ) : (
        <Cartao className="overflow-hidden">
          <ul className="divide-y divide-[var(--admin-borda)]">
            {lancamentos.dados.map((l) => {
              const negativo = l.amount_cents < 0;
              return (
                <li key={l.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span
                    aria-hidden
                    className={`h-8 w-1 shrink-0 rounded-full ${
                      negativo ? 'bg-[var(--admin-vermelho)]' : 'bg-[var(--admin-verde)]'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--admin-tinta)]">
                      {l.description || TIPO_LANCAMENTO[l.kind]}
                    </p>
                    <p className="truncate text-xs text-[var(--admin-tinta-suave)]">
                      {hora(l.occurred_at)} · {FORMA_PAGAMENTO[l.method]} ·{' '}
                      {TIPO_LANCAMENTO[l.kind]}
                    </p>
                  </div>
                  {l.order_id && (
                    <Link
                      href={`/admin/pedidos/${l.order_id}`}
                      className="hidden shrink-0 text-xs font-semibold text-[var(--admin-laranja)] hover:underline sm:inline"
                    >
                      ver pedido
                    </Link>
                  )}
                  <span
                    className={`shrink-0 font-bold tabular-nums ${
                      negativo ? 'text-[var(--admin-vermelho)]' : 'text-[var(--admin-tinta)]'
                    }`}
                  >
                    {reais(l.amount_cents)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Cartao>
      )}

      <FormularioReceita
        aberto={formularioAberto}
        aoFechar={() => setFormularioAberto(false)}
        aoSalvar={() => setRecarga((r) => r + 1)}
      />
    </>
  );
}
