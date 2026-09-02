'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowDownRight,
  Banknote,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { carregarPedidos, carregarRelatorio } from '@/lib/admin/consultas';
import { reais, variacao, variacaoTexto } from '@/lib/admin/dinheiro';
import { hora, periodoAnterior } from '@/lib/admin/datas';
import { STATUS_PAGAMENTO, FORMA_PAGAMENTO } from '@/lib/admin/rotulos';
import type { Relatorio } from '@/lib/admin/tipos';
import FiltroPeriodo, { useFiltroPeriodo } from '../FiltroPeriodo';
import TituloPagina from '../TituloPagina';
import { useAoVivo } from '../PedidosAoVivo';
import { useConsulta } from '../useConsulta';
import { Cartao, CabecalhoCartao, CartaoNumero } from '../ui/Cartao';
import { Pilula } from '../ui/Pilula';
import { Erro, Esqueleto, Vazio } from '../ui/Estados';

/**
 * Resumo — a tela principal do painel.
 *
 * Responde, de cima para baixo e sem rolar no celular: quanto vendi, quantos
 * pedidos, quanto recebi, quanto gastei, quanto sobrou.
 *
 * A distinção que atravessa a tela inteira:
 *
 *   VENDAS      o que foi faturado (pedido pago ou concluído).
 *   RECEBIMENTO o dinheiro que entrou de fato.
 *
 * Os dois quase nunca são iguais no mesmo dia, e mostrá-los como se fossem é
 * o erro que faz a dona achar que tem dinheiro que ainda está na rua.
 */

// O Recharts só existe no navegador e pesa: carregado sob demanda, o resumo
// pinta os números antes de o gráfico chegar — que é a ordem certa de leitura.
const GraficoVendas = dynamic(() => import('../graficos/GraficoVendas'), {
  ssr: false,
  loading: () => <Esqueleto className="mx-4 mb-4 h-56 sm:h-64" />,
});
const GraficoFormas = dynamic(() => import('../graficos/GraficoFormas'), {
  ssr: false,
  loading: () => <Esqueleto className="mx-4 mb-4 h-40" />,
});

type Granularidade = 'day' | 'week' | 'month';

const ABAS: { id: Granularidade; rotulo: string }[] = [
  { id: 'day', rotulo: 'Diário' },
  { id: 'week', rotulo: 'Semanal' },
  { id: 'month', rotulo: 'Mensal' },
];

export default function Resumo() {
  const filtro = useFiltroPeriodo('hoje');
  const [granularidade, setGranularidade] = useState<Granularidade>('day');
  const { versao } = useAoVivo();

  const { de, ate } = filtro.periodo;
  const anterior = useMemo(() => periodoAnterior(filtro.periodo), [filtro.periodo]);

  const chave = `${de.toISOString()}|${ate.toISOString()}|${granularidade}|${versao}`;

  const relatorio = useConsulta<Relatorio>(
    (sb) => carregarRelatorio(sb, de, ate, granularidade),
    [chave],
  );

  // O período anterior existe só para a comparação "+12% / −8%". Falhar aqui
  // não pode derrubar a tela: sem base, a comparação simplesmente não aparece.
  const comparacao = useConsulta<Relatorio | null>(
    (sb) => carregarRelatorio(sb, anterior.de, anterior.ate, 'day').catch(() => null),
    [chave],
  );

  const ultimos = useConsulta((sb) => carregarPedidos(sb, { limite: 5 }), [versao]);

  if (relatorio.erro) {
    return (
      <>
        <TituloPagina titulo="Fluxo de caixa" />
        <Erro mensagem={relatorio.erro} aoTentarDeNovo={relatorio.recarregar} />
      </>
    );
  }

  const r = relatorio.dados;
  const anteriorDados = comparacao.dados;

  const compara = (atual: number, base: number | undefined) => {
    if (base === undefined || !anteriorDados) return null;
    const pct = variacao(atual, base);
    const texto = variacaoTexto(pct);
    return texto === null ? null : { texto, positiva: (pct ?? 0) >= 0 };
  };

  return (
    <>
      <TituloPagina
        titulo="Fluxo de caixa"
        descricao="Acompanhe suas vendas e movimentações"
        acao={
          <FiltroPeriodo
            id={filtro.id}
            aoTrocar={filtro.setId}
            intervalo={filtro.intervalo}
            aoTrocarIntervalo={filtro.setIntervalo}
            periodo={filtro.periodo}
          />
        }
      />

      {/* ─────────────── cartões de número ─────────────── */}
      {relatorio.carregando || !r ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Esqueleto key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <CartaoNumero
            rotulo="Vendas do período"
            valor={reais(r.money.gross_cents)}
            tom="verde"
            icone={TrendingUp}
            variacao={compara(r.money.gross_cents, anteriorDados?.money.gross_cents)}
            detalhe="faturamento confirmado"
          />
          <CartaoNumero
            rotulo="Pedidos"
            valor={String(r.orders.total)}
            tom="azul"
            icone={ShoppingBag}
            variacao={compara(r.orders.total, anteriorDados?.orders.total)}
            detalhe={`${r.orders.billed} faturados`}
          />
          <CartaoNumero
            rotulo="Recebimentos"
            valor={reais(r.money.received_cents)}
            tom="laranja"
            icone={Wallet}
            variacao={compara(r.money.received_cents, anteriorDados?.money.received_cents)}
            detalhe={
              r.money.pending_cents > 0 ? `${reais(r.money.pending_cents)} a receber` : undefined
            }
          />
          <CartaoNumero
            rotulo="Despesas"
            valor={reais(r.money.expenses_cents)}
            tom="vermelho"
            icone={ArrowDownRight}
            variacao={compara(r.money.expenses_cents, anteriorDados?.money.expenses_cents)}
          />
          <CartaoNumero
            rotulo="Lucro líquido"
            valor={reais(r.money.net_profit_cents)}
            tom={r.money.net_profit_cents >= 0 ? 'verde' : 'vermelho'}
            icone={Banknote}
            detalhe="recebido − custos − despesas"
          />
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* ─────────────── gráfico ─────────────── */}
        <Cartao className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
            <h2 className="text-sm font-bold text-[var(--admin-tinta)] sm:text-base">Vendas</h2>
            <div
              role="tablist"
              aria-label="Agrupamento do gráfico"
              className="flex gap-1 rounded-lg bg-slate-100 p-0.5"
            >
              {ABAS.map((aba) => (
                <button
                  key={aba.id}
                  type="button"
                  role="tab"
                  aria-selected={granularidade === aba.id}
                  onClick={() => setGranularidade(aba.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    granularidade === aba.id
                      ? 'bg-white text-[var(--admin-laranja)] shadow-sm'
                      : 'text-[var(--admin-tinta-suave)] hover:text-[var(--admin-tinta)]'
                  }`}
                >
                  {aba.rotulo}
                </button>
              ))}
            </div>
          </div>
          {relatorio.carregando || !r ? (
            <Esqueleto className="mx-4 mb-4 h-56 sm:h-64" />
          ) : (
            <GraficoVendas relatorio={r} />
          )}
        </Cartao>

        {/* ─────────────── resumo do período ─────────────── */}
        <Cartao>
          <CabecalhoCartao titulo="Resumo do período" />
          {relatorio.carregando || !r ? (
            <div className="space-y-3 px-4 pb-4 sm:px-5">
              {Array.from({ length: 6 }, (_, i) => (
                <Esqueleto key={i} className="h-6" />
              ))}
            </div>
          ) : (
            <dl className="px-4 pb-4 sm:px-5">
              <Linha rotulo="Faturamento bruto" valor={reais(r.money.gross_cents)} />
              <Linha rotulo="Recebimentos" valor={reais(r.money.received_cents)} tom="verde" />
              <Linha rotulo="A receber" valor={reais(r.money.pending_cents)} tom="ambar" />
              <Linha rotulo="Custo dos produtos" valor={reais(r.money.cost_cents)} />
              <Linha rotulo="Despesas" valor={reais(r.money.expenses_cents)} tom="vermelho" />
              <Linha rotulo="Lucro bruto" valor={reais(r.money.gross_profit_cents)} />
              <Linha
                rotulo="Lucro líquido"
                valor={reais(r.money.net_profit_cents)}
                tom={r.money.net_profit_cents >= 0 ? 'verde' : 'vermelho'}
                destaque
              />
              <Linha rotulo="Ticket médio" valor={reais(r.money.ticket_cents)} />
            </dl>
          )}
        </Cartao>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* ─────────────── últimos pedidos ─────────────── */}
        <Cartao className="lg:col-span-2">
          <CabecalhoCartao
            titulo="Últimos pedidos"
            acao={
              <Link
                href="/admin/pedidos"
                className="text-xs font-bold text-[var(--admin-laranja)] hover:underline"
              >
                Ver todos
              </Link>
            }
          />
          {ultimos.carregando ? (
            <div className="space-y-2 px-4 pb-4 sm:px-5">
              {Array.from({ length: 4 }, (_, i) => (
                <Esqueleto key={i} className="h-12" />
              ))}
            </div>
          ) : ultimos.erro ? (
            <div className="px-4 pb-4 sm:px-5">
              <Erro mensagem={ultimos.erro} aoTentarDeNovo={ultimos.recarregar} />
            </div>
          ) : !ultimos.dados || ultimos.dados.length === 0 ? (
            <Vazio
              titulo="Nenhum pedido ainda"
              descricao="Os pedidos feitos pelo site aparecem aqui automaticamente, assim que o cliente finaliza."
            />
          ) : (
            <ul className="divide-y divide-[var(--admin-borda)] border-t border-[var(--admin-borda)]">
              {ultimos.dados.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/pedidos/${p.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:px-5"
                  >
                    <span className="w-16 shrink-0 font-bold text-[var(--admin-tinta)]">
                      #{p.order_number}
                    </span>
                    <span className="hidden w-14 shrink-0 text-sm text-[var(--admin-tinta-suave)] sm:inline">
                      {hora(p.created_at)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-[var(--admin-tinta-suave)]">
                      {p.customer_name || 'Cliente não identificado'}
                    </span>
                    <span className="hidden shrink-0 text-xs text-[var(--admin-tinta-suave)] sm:inline">
                      {FORMA_PAGAMENTO[p.payment_method]}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-[var(--admin-tinta)]">
                      {reais(p.total_cents)}
                    </span>
                    <Pilula aparencia={STATUS_PAGAMENTO[p.payment_status]} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="flex items-start gap-2 border-t border-[var(--admin-borda)] px-4 py-3 text-xs leading-relaxed text-[var(--admin-tinta-suave)] sm:px-5">
            <Receipt className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Todos os pedidos feitos pelo site são registrados automaticamente no fluxo de caixa,
            como <strong className="font-semibold">a receber</strong>. Marque como pago quando o
            dinheiro entrar.
          </p>
        </Cartao>

        {/* ─────────────── formas de pagamento ─────────────── */}
        <Cartao>
          <CabecalhoCartao titulo="Formas de pagamento" />
          <div className="px-4 pb-5 sm:px-5">
            {relatorio.carregando || !r ? (
              <Esqueleto className="h-40" />
            ) : (
              <GraficoFormas relatorio={r} />
            )}
          </div>
        </Cartao>
      </div>
    </>
  );
}

function Linha({
  rotulo,
  valor,
  tom = 'neutro',
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  tom?: 'neutro' | 'verde' | 'vermelho' | 'ambar';
  destaque?: boolean;
}) {
  const cores = {
    neutro: 'text-[var(--admin-tinta)]',
    verde: 'text-[var(--admin-verde)]',
    vermelho: 'text-[var(--admin-vermelho)]',
    ambar: 'text-amber-600',
  };
  return (
    <div
      className={`flex items-baseline justify-between gap-3 border-b border-[var(--admin-borda)] py-2.5 last:border-0 ${
        destaque ? 'mt-1 rounded-lg bg-emerald-50/60 px-2' : ''
      }`}
    >
      <dt className="text-sm text-[var(--admin-tinta-suave)]">{rotulo}</dt>
      <dd className={`shrink-0 font-bold tabular-nums ${cores[tom]}`}>{valor}</dd>
    </div>
  );
}
