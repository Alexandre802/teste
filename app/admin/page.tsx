import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  Banknote,
  Clock,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { CardMetrica } from "@/components/admin/CardMetrica";
import { FiltroPeriodo } from "@/components/admin/FiltroPeriodo";
import { SeloPagamento, SeloStatus } from "@/components/admin/Selo";
import {
  EsqueletoCards,
  PainelVazio,
} from "@/components/admin/EstadoPainel";
import { GraficoVendas } from "@/components/admin/graficos/GraficoVendas";
import { BarrasHorizontais } from "@/components/admin/graficos/BarrasHorizontais";
import { EscutaPedidos } from "@/components/admin/EscutaPedidos";
import {
  buscarPedidos,
  buscarPorFormaPagamento,
  buscarResumo,
  buscarVendasPorDia,
} from "@/lib/admin/consultas";
import {
  diaCurto,
  formatarHora,
  periodoAnterior,
  resolverPeriodo,
  type ChavePeriodo,
} from "@/lib/admin/periodo";
import { formatarCentavos, variacao } from "@/lib/dinheiro";
import { ROTULO_FORMA } from "@/lib/admin/tipos";

export const dynamic = "force-dynamic";

export default async function PaginaResumo({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; de?: string; ate?: string }>;
}) {
  const parametros = await searchParams;
  const periodo = resolverPeriodo(
    (parametros.p ?? "hoje") as ChavePeriodo,
    parametros.de,
    parametros.ate,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="fonte-titulo text-2xl font-extrabold text-tinta">
          Fluxo de caixa
        </h1>
        <p className="mt-0.5 text-sm text-tinta-media">
          Acompanhe suas vendas e movimentações
        </p>
      </header>

      <FiltroPeriodo />

      <Suspense fallback={<EsqueletoCards quantidade={6} />}>
        <Numeros periodo={periodo} />
      </Suspense>
    </div>
  );
}

async function Numeros({
  periodo,
}: {
  periodo: ReturnType<typeof resolverPeriodo>;
}) {
  const anterior = periodoAnterior(periodo);
  const [resumo, comparacao, serie, formas, ultimos] = await Promise.all([
    buscarResumo(periodo),
    buscarResumo(anterior),
    buscarVendasPorDia(periodo),
    buscarPorFormaPagamento(periodo),
    buscarPedidos({ limite: 8 }),
  ]);

  const dadosGrafico = serie.map((linha) => ({
    rotulo: diaCurto(linha.dia),
    valor_cents: Number(linha.faturamento_cents),
    pedidos: Number(linha.pedidos),
  }));

  return (
    <>
      <EscutaPedidos />

      <section aria-label="Resumo do período" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <CardMetrica
          titulo="Faturamento"
          centavos={resumo.faturamento_cents}
          icone={TrendingUp}
          formula="Pedidos pagos ou concluídos"
          variacaoPorcento={variacao(
            resumo.faturamento_cents,
            comparacao.faturamento_cents,
          )}
        />
        <CardMetrica
          titulo="Pedidos"
          quantidade={resumo.pedidos}
          icone={ShoppingBag}
          tom="info"
          formula={`${resumo.cancelados} cancelado(s)`}
          variacaoPorcento={variacao(resumo.pedidos, comparacao.pedidos)}
        />
        <CardMetrica
          titulo="Recebimentos"
          centavos={resumo.recebimentos_cents}
          icone={Wallet}
          tom="positivo"
          formula="Dinheiro que entrou de fato"
          variacaoPorcento={variacao(
            resumo.recebimentos_cents,
            comparacao.recebimentos_cents,
          )}
        />
        <CardMetrica
          titulo="A receber"
          centavos={resumo.pendente_cents}
          icone={Clock}
          formula="Pedidos ainda não pagos"
        />
        <CardMetrica
          titulo="Despesas"
          centavos={resumo.despesas_cents}
          icone={TrendingDown}
          tom="negativo"
          formula="Total gasto no período"
          variacaoPorcento={variacao(
            resumo.despesas_cents,
            comparacao.despesas_cents,
          )}
        />
        <CardMetrica
          titulo="Lucro líquido"
          centavos={resumo.lucro_liquido_cents}
          icone={Banknote}
          tom={resumo.lucro_liquido_cents >= 0 ? "positivo" : "negativo"}
          formula="Recebimentos − custo − despesas"
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-bloco border border-borda bg-white p-4 shadow-carta lg:col-span-2">
          <h2 className="fonte-titulo text-[16px] font-bold text-tinta">
            Vendas no período
          </h2>
          <p className="mb-2 text-[12px] text-tinta-suave">
            Faturamento por dia, em reais
          </p>
          <GraficoVendas dados={dadosGrafico} />
        </div>

        <div className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
          <h2 className="fonte-titulo text-[16px] font-bold text-tinta">
            Formas de pagamento
          </h2>
          <p className="mb-3 text-[12px] text-tinta-suave">
            Sobre o faturamento do período
          </p>
          <BarrasHorizontais
            vazio="Nenhum pagamento confirmado no período."
            itens={formas.map((linha) => ({
              id: linha.forma,
              rotulo: ROTULO_FORMA[linha.forma],
              valor_cents: Number(linha.valor_cents),
              detalhe: `${linha.pedidos} ped.`,
            }))}
          />
        </div>
      </section>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="fonte-titulo text-[16px] font-bold text-tinta">
            Últimos pedidos
          </h2>
          <Link
            href="/admin/pedidos"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-laranja"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {ultimos.length === 0 ? (
          <PainelVazio
            titulo="Nenhum pedido ainda"
            descricao="Assim que o primeiro pedido chegar pelo site, ele aparece aqui sozinho."
          />
        ) : (
          <ul className="divide-y divide-borda">
            {ultimos.map((pedido) => (
              <li key={pedido.id}>
                <Link
                  href={`/admin/pedidos/${pedido.id}`}
                  className="flex min-h-[64px] items-center gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-[15px] font-bold text-tinta">
                      #{pedido.order_number}
                      <span className="text-[12px] font-medium text-tinta-suave">
                        {formatarHora(pedido.created_at)}
                      </span>
                    </p>
                    <p className="truncate text-[13px] text-tinta-media">
                      {pedido.customer_name} ·{" "}
                      {ROTULO_FORMA[pedido.payment_method]}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[15px] font-extrabold text-tinta">
                      {formatarCentavos(pedido.total_cents)}
                    </span>
                    <span className="flex gap-1">
                      <SeloStatus status={pedido.status} />
                      <SeloPagamento status={pedido.payment_status} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <h2 className="fonte-titulo text-[16px] font-bold text-tinta">
          Como o período fecha
        </h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          <Linha termo="Faturamento bruto" valor={resumo.faturamento_cents} />
          <Linha termo="Recebimentos" valor={resumo.recebimentos_cents} />
          <Linha termo="Custo dos produtos" valor={resumo.custo_cents} />
          <Linha termo="Despesas" valor={resumo.despesas_cents} />
          <Linha
            termo="Lucro bruto"
            valor={resumo.lucro_bruto_cents}
            destaque
          />
          <Linha
            termo="Lucro líquido"
            valor={resumo.lucro_liquido_cents}
            destaque
          />
          <div className="flex justify-between gap-3 py-1 text-[14px] sm:col-span-2">
            <dt className="text-tinta-media">Ticket médio</dt>
            <dd className="font-semibold text-tinta">
              {formatarCentavos(resumo.ticket_medio_cents)}
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}

function Linha({
  termo,
  valor,
  destaque = false,
}: {
  termo: string;
  valor: number;
  destaque?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-3 py-1 text-[14px] ${
        destaque ? "border-t border-borda pt-2 font-bold" : ""
      }`}
    >
      <dt className={destaque ? "text-tinta" : "text-tinta-media"}>{termo}</dt>
      <dd
        className={
          destaque && valor < 0 ? "text-vermelho" : "font-semibold text-tinta"
        }
      >
        {formatarCentavos(valor)}
      </dd>
    </div>
  );
}
