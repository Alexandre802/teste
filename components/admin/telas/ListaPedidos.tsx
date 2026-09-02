'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Search } from 'lucide-react';
import { carregarPedidos } from '@/lib/admin/consultas';
import { baixarCsv, paraCsv } from '@/lib/admin/csv';
import { reais, reaisSemSimbolo } from '@/lib/admin/dinheiro';
import { dataHora, hora, isoDia, type PeriodoId } from '@/lib/admin/datas';
import { FORMA_PAGAMENTO, STATUS_PAGAMENTO, STATUS_PEDIDO, TIPO_PEDIDO } from '@/lib/admin/rotulos';
import type { StatusPedido } from '@/lib/admin/tipos';
import FiltroPeriodo, { useFiltroPeriodo } from '../FiltroPeriodo';
import TituloPagina from '../TituloPagina';
import { useAoVivo } from '../PedidosAoVivo';
import { useConsulta } from '../useConsulta';
import { Botao } from '../ui/Botao';
import { Cartao } from '../ui/Cartao';
import { Erro, EsqueletoLista, Vazio } from '../ui/Estados';
import { Pilula } from '../ui/Pilula';

/**
 * Lista de pedidos.
 *
 * No celular cada pedido é um cartão; no computador, uma linha de tabela. É a
 * mesma informação em dois formatos, e não uma tabela apertada que sai da
 * tela — no celular, tabela larga esconde justamente a coluna do valor.
 */

const FILTROS_RAPIDOS: PeriodoId[] = ['hoje', 'ontem', 'sete-dias', 'trinta-dias', 'personalizado'];

const STATUS_FILTRAVEIS: { id: '' | StatusPedido; rotulo: string }[] = [
  { id: '', rotulo: 'Todos' },
  { id: 'pending', rotulo: 'Pendentes' },
  { id: 'confirmed', rotulo: 'Confirmados' },
  { id: 'preparing', rotulo: 'Preparando' },
  { id: 'out_for_delivery', rotulo: 'Saíram' },
  { id: 'completed', rotulo: 'Concluídos' },
  { id: 'cancelled', rotulo: 'Cancelados' },
];

export default function ListaPedidos() {
  const filtro = useFiltroPeriodo('hoje');
  const [status, setStatus] = useState<'' | StatusPedido>('');
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const { versao } = useAoVivo();

  const { de, ate } = filtro.periodo;

  /**
   * Com busca ativa, o período é ignorado de propósito.
   *
   * Quem digita "#312" ou um telefone quer ACHAR aquele pedido, não "aquele
   * pedido se tiver sido hoje". Limitar ao período faria a busca voltar vazia
   * e parecer que o pedido sumiu.
   */
  const pedidos = useConsulta(
    (sb) =>
      carregarPedidos(sb, {
        de: buscaAplicada ? undefined : de,
        ate: buscaAplicada ? undefined : ate,
        status: status || undefined,
        busca: buscaAplicada || undefined,
        limite: 200,
      }),
    [de.toISOString(), ate.toISOString(), status, buscaAplicada, versao],
  );

  const exportar = () => {
    if (!pedidos.dados?.length) return;
    const csv = paraCsv(
      ['Pedido', 'Data', 'Cliente', 'Telefone', 'Tipo', 'Pagamento', 'Situação', 'Status', 'Total'],
      pedidos.dados.map((p) => [
        p.order_number,
        dataHora(p.created_at),
        p.customer_name,
        p.customer_phone,
        TIPO_PEDIDO[p.order_type],
        FORMA_PAGAMENTO[p.payment_method],
        STATUS_PAGAMENTO[p.payment_status].rotulo,
        STATUS_PEDIDO[p.status].rotulo,
        reaisSemSimbolo(p.total_cents),
      ]),
    );
    baixarCsv(`pedidos-${isoDia()}`, csv);
  };

  return (
    <>
      <TituloPagina
        titulo="Pedidos"
        acao={
          <div className="flex items-center gap-2">
            <FiltroPeriodo
              id={filtro.id}
              aoTrocar={filtro.setId}
              intervalo={filtro.intervalo}
              aoTrocarIntervalo={filtro.setIntervalo}
              periodo={filtro.periodo}
              opcoes={FILTROS_RAPIDOS}
            />
            <Botao
              variante="secundario"
              tamanho="sm"
              onClick={exportar}
              disabled={!pedidos.dados?.length}
            >
              <Download className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">CSV</span>
            </Botao>
          </div>
        }
      />

      {/* ─────────────── busca ─────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setBuscaAplicada(busca.trim());
        }}
        className="mb-3 flex gap-2"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <label htmlFor="busca-pedido" className="sr-only">
            Buscar pedido por número, nome ou telefone
          </label>
          <input
            id="busca-pedido"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              // apagar o campo volta à lista do período, sem precisar enviar
              if (e.target.value.trim() === '') setBuscaAplicada('');
            }}
            placeholder="Buscar pedido, cliente ou telefone…"
            className="admin-campo pl-9"
          />
        </div>
        <Botao type="submit" variante="secundario">
          Buscar
        </Botao>
      </form>

      {buscaAplicada && (
        <p className="mb-3 text-xs text-[var(--admin-tinta-suave)]">
          Buscando “{buscaAplicada}” em todos os períodos.{' '}
          <button
            type="button"
            onClick={() => {
              setBusca('');
              setBuscaAplicada('');
            }}
            className="font-semibold text-[var(--admin-laranja)] hover:underline"
          >
            Limpar busca
          </button>
        </p>
      )}

      {/* ─────────────── status ─────────────── */}
      <div className="admin-rolagem-x mb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2">
          {STATUS_FILTRAVEIS.map((s) => (
            <button
              key={s.id || 'todos'}
              type="button"
              onClick={() => setStatus(s.id)}
              aria-pressed={status === s.id}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                status === s.id
                  ? 'bg-[var(--admin-laranja)] text-white'
                  : 'bg-white text-[var(--admin-tinta-suave)] ring-1 ring-inset ring-[var(--admin-borda)] hover:text-[var(--admin-tinta)]'
              }`}
            >
              {s.rotulo}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────── resultado ─────────────── */}
      {pedidos.carregando ? (
        <EsqueletoLista linhas={6} />
      ) : pedidos.erro ? (
        <Erro mensagem={pedidos.erro} aoTentarDeNovo={pedidos.recarregar} />
      ) : !pedidos.dados || pedidos.dados.length === 0 ? (
        <Cartao>
          <Vazio
            titulo={buscaAplicada ? 'Nenhum pedido encontrado' : 'Nenhum pedido ainda'}
            descricao={
              buscaAplicada
                ? 'Confira o número, o nome ou o telefone digitado.'
                : 'Os pedidos feitos pelo site entram aqui sozinhos, no momento em que o cliente finaliza.'
            }
          />
        </Cartao>
      ) : (
        <>
          {/* celular: cartões */}
          <ul className="flex flex-col gap-2 lg:hidden">
            {pedidos.dados.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/pedidos/${p.id}`} className="admin-card block p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[var(--admin-tinta)]">#{p.order_number}</span>
                    <span className="text-xs text-[var(--admin-tinta-suave)]">
                      {hora(p.created_at)}
                    </span>
                    <span className="ml-auto font-bold tabular-nums text-[var(--admin-tinta)]">
                      {reais(p.total_cents)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[var(--admin-tinta-suave)]">
                    {p.customer_name || 'Cliente não identificado'} ·{' '}
                    {FORMA_PAGAMENTO[p.payment_method]}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pilula aparencia={STATUS_PEDIDO[p.status]} />
                    <Pilula aparencia={STATUS_PAGAMENTO[p.payment_status]} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* computador: tabela */}
          <Cartao className="hidden overflow-hidden lg:block">
            <div className="admin-rolagem-x">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--admin-borda)] bg-slate-50 text-left text-xs uppercase tracking-wide text-[var(--admin-tinta-suave)]">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Pedido</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Hora</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Cliente</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Tipo</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Pagamento</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">Valor</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-borda)]">
                  {pedidos.dados.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/admin/pedidos/${p.id}`}
                          className="font-bold text-[var(--admin-laranja)] hover:underline"
                        >
                          #{p.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-[var(--admin-tinta-suave)]">
                        {hora(p.created_at)}
                      </td>
                      <td className="max-w-[16rem] truncate px-4 py-2.5">
                        {p.customer_name || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--admin-tinta-suave)]">
                        {TIPO_PEDIDO[p.order_type]}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--admin-tinta-suave)]">
                        {FORMA_PAGAMENTO[p.payment_method]}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                        {reais(p.total_cents)}
                      </td>
                      <td className="px-4 py-2.5">
                        <Pilula aparencia={STATUS_PEDIDO[p.status]} />
                      </td>
                      <td className="px-4 py-2.5">
                        <Pilula aparencia={STATUS_PAGAMENTO[p.payment_status]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Cartao>
        </>
      )}
    </>
  );
}
