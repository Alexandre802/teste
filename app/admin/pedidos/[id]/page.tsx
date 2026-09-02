import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, StickyNote, User } from "lucide-react";

import { SeloPagamento, SeloStatus } from "@/components/admin/Selo";
import { AcoesPedido } from "@/components/admin/AcoesPedido";
import { buscarPedido } from "@/lib/admin/consultas";
import { formatarData, formatarHora } from "@/lib/admin/periodo";
import { formatarCentavos } from "@/lib/dinheiro";
import { ROTULO_FORMA, ROTULO_TIPO } from "@/lib/admin/tipos";

export const dynamic = "force-dynamic";

export default async function PaginaPedido({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dados = await buscarPedido(id);

  if (!dados) notFound();
  const { pedido, itens } = dados;
  const endereco = pedido.address_json;

  return (
    <div className="space-y-5">
      <Link
        href="/admin/pedidos"
        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-laranja"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para os pedidos
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="fonte-titulo text-2xl font-extrabold text-tinta">
            Pedido #{pedido.order_number}
          </h1>
          <p className="mt-0.5 text-sm text-tinta-media">
            {formatarData(pedido.created_at)} às {formatarHora(pedido.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <SeloStatus status={pedido.status} />
          <SeloPagamento status={pedido.payment_status} />
        </div>
      </header>

      {pedido.status === "cancelled" && pedido.cancel_reason && (
        <p className="rounded-carta border border-vermelho/25 bg-vermelho/5 px-4 py-3 text-sm text-vermelho">
          Cancelado: {pedido.cancel_reason}
        </p>
      )}

      <AcoesPedido
        id={pedido.id}
        status={pedido.status}
        pagamento={pedido.payment_status}
      />

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
          <h2 className="fonte-titulo mb-3 text-[16px] font-bold text-tinta">
            Cliente
          </h2>
          <dl className="space-y-2 text-[14px]">
            <Campo icone={User} termo="Nome">
              {pedido.customer_name}
            </Campo>
            <Campo icone={Phone} termo="Telefone">
              {pedido.customer_phone || "não informado"}
            </Campo>
            <Campo icone={MapPin} termo="Tipo">
              {ROTULO_TIPO[pedido.order_type]}
            </Campo>
          </dl>

          {pedido.order_type === "delivery" && endereco && (
            <div className="mt-4 border-t border-borda pt-3">
              <h3 className="text-[12px] font-bold uppercase tracking-wide text-tinta-suave">
                Endereço de entrega
              </h3>
              <address className="mt-1 not-italic text-[14px] leading-relaxed text-tinta">
                {[endereco.rua, endereco.numero].filter(Boolean).join(", ")}
                {endereco.complemento && <> — {endereco.complemento}</>}
                <br />
                {[endereco.bairro, endereco.cidade].filter(Boolean).join(" · ")}
                {endereco.cep && (
                  <>
                    <br />
                    CEP {endereco.cep}
                  </>
                )}
                {endereco.referencia && (
                  <>
                    <br />
                    Referência: {endereco.referencia}
                  </>
                )}
              </address>
            </div>
          )}
        </div>

        <div className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
          <h2 className="fonte-titulo mb-3 text-[16px] font-bold text-tinta">
            Pagamento
          </h2>
          <dl className="space-y-2 text-[14px]">
            <Campo termo="Forma">{ROTULO_FORMA[pedido.payment_method]}</Campo>
            {pedido.payment_method === "cash" && (
              <Campo termo="Troco">
                {pedido.troco_para_cents
                  ? `para ${formatarCentavos(pedido.troco_para_cents)}`
                  : "não precisa"}
              </Campo>
            )}
            <Campo termo="Origem">
              {pedido.source === "site" ? "Pedido do site" : "Lançado no painel"}
            </Campo>
            {pedido.paid_at && (
              <Campo termo="Pago em">
                {formatarData(pedido.paid_at)} às {formatarHora(pedido.paid_at)}
              </Campo>
            )}
          </dl>
        </div>
      </section>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <h2 className="fonte-titulo mb-3 text-[16px] font-bold text-tinta">
          Itens
        </h2>
        <ul className="divide-y divide-borda">
          {itens.map((item) => (
            <li key={item.id} className="flex gap-3 py-3">
              <span className="shrink-0 rounded-full bg-creme px-2.5 py-1 text-[13px] font-bold text-laranja">
                {item.quantity}x
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-tinta">
                  {item.product_name_snapshot}
                </p>
                {item.options_json.map((opcao, indice) => (
                  <p key={indice} className="text-[12px] text-tinta-suave">
                    {opcao.grupo}: {opcao.nome}
                  </p>
                ))}
                {item.observacao && (
                  <p className="text-[12px] italic text-tinta-suave">
                    Obs.: {item.observacao}
                  </p>
                )}
                <p className="text-[12px] text-tinta-suave">
                  {formatarCentavos(item.unit_price_cents + item.addons_cents)}{" "}
                  cada
                </p>
              </div>
              <span className="shrink-0 text-[15px] font-bold text-tinta">
                {formatarCentavos(item.total_cents)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-3 space-y-1.5 border-t border-borda pt-3 text-[14px]">
          <Total termo="Subtotal" valor={pedido.subtotal_cents} />
          {pedido.order_type === "delivery" && (
            <div className="flex justify-between">
              <dt className="text-tinta-media">Taxa de entrega</dt>
              <dd className="font-semibold text-tinta">
                {pedido.delivery_fee_cents === null
                  ? "a combinar"
                  : formatarCentavos(pedido.delivery_fee_cents)}
              </dd>
            </div>
          )}
          {pedido.discount_cents > 0 && (
            <Total termo="Desconto" valor={-pedido.discount_cents} />
          )}
          <div className="flex justify-between border-t border-borda pt-2">
            <dt className="fonte-titulo text-[16px] font-bold text-laranja">
              Total
            </dt>
            <dd className="text-[18px] font-extrabold text-laranja">
              {formatarCentavos(pedido.total_cents)}
            </dd>
          </div>
          {/* O custo é informação interna: nunca sai desta tela. */}
          <div className="flex justify-between pt-1 text-[12px] text-tinta-suave">
            <dt>Custo dos produtos (interno)</dt>
            <dd>{formatarCentavos(pedido.cost_cents)}</dd>
          </div>
          <div className="flex justify-between text-[12px] text-tinta-suave">
            <dt>Lucro bruto deste pedido</dt>
            <dd>{formatarCentavos(pedido.total_cents - pedido.cost_cents)}</dd>
          </div>
        </dl>
      </section>

      {pedido.notes && (
        <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
          <h2 className="fonte-titulo mb-2 flex items-center gap-2 text-[16px] font-bold text-tinta">
            <StickyNote className="h-4 w-4 text-laranja" aria-hidden="true" />
            Observação do cliente
          </h2>
          <p className="text-[14px] leading-relaxed text-tinta-media">
            {pedido.notes}
          </p>
        </section>
      )}
    </div>
  );
}

function Campo({
  icone: Icone,
  termo,
  children,
}: {
  icone?: typeof User;
  termo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      {Icone && (
        <Icone
          className="mt-0.5 h-4 w-4 shrink-0 text-tinta-suave"
          aria-hidden="true"
        />
      )}
      <dt className="shrink-0 text-tinta-media">{termo}:</dt>
      <dd className="min-w-0 break-words font-semibold text-tinta">{children}</dd>
    </div>
  );
}

function Total({ termo, valor }: { termo: string; valor: number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-tinta-media">{termo}</dt>
      <dd className="font-semibold text-tinta">{formatarCentavos(valor)}</dd>
    </div>
  );
}
