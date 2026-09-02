import { Suspense } from "react";

import { FiltroPeriodo } from "@/components/admin/FiltroPeriodo";
import { BarrasHorizontais } from "@/components/admin/graficos/BarrasHorizontais";
import { GraficoVendas } from "@/components/admin/graficos/GraficoVendas";
import { EsqueletoCards } from "@/components/admin/EstadoPainel";
import {
  buscarEntregaXRetirada,
  buscarMaisVendidos,
  buscarPorFormaPagamento,
  buscarPorHora,
  buscarResumo,
  buscarVendasPorDia,
} from "@/lib/admin/consultas";
import {
  diaCurto,
  resolverPeriodo,
  type ChavePeriodo,
} from "@/lib/admin/periodo";
import { formatarCentavos } from "@/lib/dinheiro";
import { ROTULO_FORMA, ROTULO_TIPO } from "@/lib/admin/tipos";

export const dynamic = "force-dynamic";

export default async function PaginaRelatorios({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; de?: string; ate?: string }>;
}) {
  const parametros = await searchParams;
  const periodo = resolverPeriodo(
    (parametros.p ?? "30dias") as ChavePeriodo,
    parametros.de,
    parametros.ate,
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="fonte-titulo text-2xl font-extrabold text-tinta">
          Relatórios
        </h1>
        <p className="mt-0.5 text-sm text-tinta-media">
          O período inteiro, número por número
        </p>
      </header>

      <FiltroPeriodo />

      <Suspense fallback={<EsqueletoCards quantidade={8} />}>
        <Conteudo periodo={periodo} />
      </Suspense>
    </div>
  );
}

async function Conteudo({
  periodo,
}: {
  periodo: ReturnType<typeof resolverPeriodo>;
}) {
  const [resumo, serie, formas, produtos, horas, tipos] = await Promise.all([
    buscarResumo(periodo),
    buscarVendasPorDia(periodo),
    buscarPorFormaPagamento(periodo),
    buscarMaisVendidos(periodo, 10),
    buscarPorHora(periodo),
    buscarEntregaXRetirada(periodo),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <h2 className="fonte-titulo text-[16px] font-bold text-tinta">
          Fechamento do período
        </h2>
        <p className="mb-3 text-[12px] text-tinta-suave">{periodo.rotulo}</p>
        <dl className="grid gap-x-6 sm:grid-cols-2">
          <Linha termo="Faturamento bruto" valor={resumo.faturamento_cents} />
          <Linha termo="Recebimentos" valor={resumo.recebimentos_cents} />
          <Linha termo="A receber" valor={resumo.pendente_cents} />
          <Linha termo="Custo dos produtos" valor={resumo.custo_cents} />
          <Linha termo="Despesas" valor={resumo.despesas_cents} />
          <Linha termo="Ticket médio" valor={resumo.ticket_medio_cents} />
          <Linha termo="Lucro bruto" valor={resumo.lucro_bruto_cents} destaque />
          <Linha
            termo="Lucro líquido"
            valor={resumo.lucro_liquido_cents}
            destaque
          />
          <div className="flex justify-between border-t border-borda py-2 text-[14px] sm:col-span-2">
            <dt className="text-tinta-media">Pedidos</dt>
            <dd className="font-semibold text-tinta">
              {resumo.pedidos} no período · {resumo.pedidos_faturados}{" "}
              faturado(s) · {resumo.cancelados} cancelado(s)
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-[11px] leading-relaxed text-tinta-suave">
          Faturamento bruto: pedidos pagos ou concluídos. Recebimentos:
          dinheiro que entrou de fato, já descontando reembolso. Lucro bruto:
          faturamento − custo. Lucro líquido: recebimentos − custo − despesas.
        </p>
      </section>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <h2 className="fonte-titulo text-[16px] font-bold text-tinta">
          Vendas por dia
        </h2>
        <p className="mb-2 text-[12px] text-tinta-suave">Em reais</p>
        <GraficoVendas
          dados={serie.map((linha) => ({
            rotulo: diaCurto(linha.dia),
            valor_cents: Number(linha.faturamento_cents),
            pedidos: Number(linha.pedidos),
          }))}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
          <h2 className="fonte-titulo mb-3 text-[16px] font-bold text-tinta">
            Produtos mais vendidos
          </h2>
          <BarrasHorizontais
            vazio="Nenhum produto vendido no período."
            itens={produtos.map((produto) => ({
              id: produto.product_id,
              rotulo: produto.produto,
              valor_cents: Number(produto.faturamento_cents),
              detalhe: `${produto.quantidade} un.`,
            }))}
          />
        </section>

        <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
          <h2 className="fonte-titulo mb-3 text-[16px] font-bold text-tinta">
            Formas de pagamento
          </h2>
          <BarrasHorizontais
            vazio="Nenhum pagamento confirmado."
            itens={formas.map((linha) => ({
              id: linha.forma,
              rotulo: ROTULO_FORMA[linha.forma],
              valor_cents: Number(linha.valor_cents),
              detalhe: `${linha.pedidos} ped.`,
            }))}
          />
        </section>

        <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
          <h2 className="fonte-titulo mb-3 text-[16px] font-bold text-tinta">
            Horários com mais pedidos
          </h2>
          <BarrasHorizontais
            vazio="Sem pedidos no período."
            itens={horas.map((linha) => ({
              id: String(linha.hora),
              rotulo: `${String(linha.hora).padStart(2, "0")}h–${String(
                linha.hora + 1,
              ).padStart(2, "0")}h`,
              valor_cents: Number(linha.faturamento_cents),
              detalhe: `${linha.pedidos} ped.`,
            }))}
          />
        </section>

        <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
          <h2 className="fonte-titulo mb-3 text-[16px] font-bold text-tinta">
            Entrega x retirada
          </h2>
          <BarrasHorizontais
            vazio="Sem pedidos no período."
            itens={tipos.map((linha) => ({
              id: linha.tipo,
              rotulo: ROTULO_TIPO[linha.tipo],
              valor_cents: Number(linha.faturamento_cents),
              detalhe: `${linha.pedidos} ped.`,
            }))}
          />
        </section>
      </div>
    </div>
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
      className={`flex justify-between gap-3 py-1.5 text-[14px] ${
        destaque ? "border-t border-borda pt-2 font-bold" : ""
      }`}
    >
      <dt className={destaque ? "text-tinta" : "text-tinta-media"}>{termo}</dt>
      <dd
        className={
          valor < 0 ? "font-semibold text-vermelho" : "font-semibold text-tinta"
        }
      >
        {formatarCentavos(valor)}
      </dd>
    </div>
  );
}
