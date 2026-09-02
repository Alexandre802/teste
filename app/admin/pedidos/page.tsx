import Link from "next/link";
import { Suspense } from "react";

import { FiltroPeriodo } from "@/components/admin/FiltroPeriodo";
import { BuscaPedidos } from "@/components/admin/BuscaPedidos";
import { SeloPagamento, SeloStatus } from "@/components/admin/Selo";
import {
  EsqueletoLista,
  PainelVazio,
} from "@/components/admin/EstadoPainel";
import { BotaoExportar } from "@/components/admin/BotaoExportar";
import { buscarPedidos } from "@/lib/admin/consultas";
import {
  formatarData,
  formatarHora,
  resolverPeriodo,
  type ChavePeriodo,
} from "@/lib/admin/periodo";
import { formatarCentavos } from "@/lib/dinheiro";
import { ROTULO_FORMA, ROTULO_TIPO } from "@/lib/admin/tipos";
import { linhasDePedidos } from "@/lib/admin/csv";

export const dynamic = "force-dynamic";

export default async function PaginaPedidos({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; de?: string; ate?: string; q?: string }>;
}) {
  const parametros = await searchParams;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="fonte-titulo text-2xl font-extrabold text-tinta">
          Pedidos
        </h1>
        <p className="mt-0.5 text-sm text-tinta-media">
          Tudo que entrou pelo site, na ordem de chegada
        </p>
      </header>

      <FiltroPeriodo />
      <BuscaPedidos />

      <Suspense fallback={<EsqueletoLista linhas={6} />}>
        <Lista parametros={parametros} />
      </Suspense>
    </div>
  );
}

async function Lista({
  parametros,
}: {
  parametros: { p?: string; de?: string; ate?: string; q?: string };
}) {
  const busca = parametros.q?.trim();
  // Buscar por nome ou número passa por cima do recorte de data: quem procura
  // o pedido #3287 não quer ouvir que ele não está no período selecionado.
  const periodo = busca
    ? undefined
    : resolverPeriodo(
        (parametros.p ?? "hoje") as ChavePeriodo,
        parametros.de,
        parametros.ate,
      );

  const pedidos = await buscarPedidos({ periodo, busca, limite: 200 });

  if (pedidos.length === 0) {
    return (
      <PainelVazio
        titulo={busca ? "Nenhum pedido encontrado" : "Nenhum pedido no período"}
        descricao={
          busca
            ? "Confira o número, o nome ou o telefone e tente de novo."
            : "Quando um pedido chegar pelo site, ele aparece aqui na hora."
        }
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-tinta-media">
          {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
        </p>
        <BotaoExportar
          nome={`pedidos-${periodo?.de ?? "busca"}`}
          linhas={linhasDePedidos(pedidos)}
        />
      </div>

      {/* No celular cada pedido é um card; no computador vira tabela. */}
      <ul className="space-y-2 lg:hidden">
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            <Link
              href={`/admin/pedidos/${pedido.id}`}
              className="block rounded-bloco border border-borda bg-white p-4 shadow-carta"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-extrabold text-tinta">
                    #{pedido.order_number}
                  </p>
                  <p className="truncate text-[13px] text-tinta-media">
                    {pedido.customer_name}
                  </p>
                  <p className="text-[12px] text-tinta-suave">
                    {formatarData(pedido.created_at)} ·{" "}
                    {formatarHora(pedido.created_at)} ·{" "}
                    {ROTULO_FORMA[pedido.payment_method]}
                  </p>
                </div>
                <span className="shrink-0 text-[16px] font-extrabold text-tinta">
                  {formatarCentavos(pedido.total_cents)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <SeloStatus status={pedido.status} />
                <SeloPagamento status={pedido.payment_status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-bloco border border-borda bg-white shadow-carta lg:block">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-borda bg-nevoa text-[12px] uppercase tracking-wide text-tinta-suave">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">Pedido</th>
              <th scope="col" className="px-4 py-3 font-bold">Data</th>
              <th scope="col" className="px-4 py-3 font-bold">Cliente</th>
              <th scope="col" className="px-4 py-3 font-bold">Tipo</th>
              <th scope="col" className="px-4 py-3 font-bold">Pagamento</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">Valor</th>
              <th scope="col" className="px-4 py-3 font-bold">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borda">
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-nevoa">
                <td className="px-4 py-3 font-bold">
                  <Link
                    href={`/admin/pedidos/${pedido.id}`}
                    className="text-laranja"
                  >
                    #{pedido.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-tinta-media">
                  {formatarData(pedido.created_at)}{" "}
                  {formatarHora(pedido.created_at)}
                </td>
                <td className="max-w-48 truncate px-4 py-3">
                  {pedido.customer_name}
                </td>
                <td className="px-4 py-3 text-tinta-media">
                  {ROTULO_TIPO[pedido.order_type]}
                </td>
                <td className="px-4 py-3 text-tinta-media">
                  {ROTULO_FORMA[pedido.payment_method]}
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  {formatarCentavos(pedido.total_cents)}
                </td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap gap-1">
                    <SeloStatus status={pedido.status} />
                    <SeloPagamento status={pedido.payment_status} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
