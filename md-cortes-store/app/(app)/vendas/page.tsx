"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Ban, ReceiptText, Undo2 } from "lucide-react";
import type { Sale } from "@/types";
import { paymentLabel } from "@/lib/constants";
import { money, units } from "@/lib/format";
import { dayLabel, timeOf, toDateKey } from "@/lib/date";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { PagamentoIcone } from "@/components/venda/PagamentoIcone";

/**
 * Histórico agrupado por dia. Cancelar repõe o estoque e mantém a linha no
 * histórico marcada como cancelada — nada é apagado.
 */
export default function VendasPage() {
  const sales = useStore((s) => s.sales);
  const saleItems = useStore((s) => s.saleItems);
  const cancelSale = useStore((s) => s.cancelSale);
  const toast = useToast();

  const [aberta, setAberta] = useState<Sale | null>(null);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);

  const porDia = useMemo(() => {
    const grupos = new Map<string, Sale[]>();
    for (const venda of sales) {
      const chave = toDateKey(new Date(venda.soldAt));
      const lista = grupos.get(chave);
      if (lista) lista.push(venda);
      else grupos.set(chave, [venda]);
    }
    return [...grupos.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [sales]);

  const itensDaAberta = aberta ? saleItems.filter((i) => i.saleId === aberta.id) : [];

  async function cancelar() {
    if (!aberta) return;
    await cancelSale(aberta.id);
    toast({ tone: "sucesso", title: "Venda cancelada", description: "As peças voltaram para o estoque." });
    setConfirmandoCancelamento(false);
    setAberta(null);
  }

  return (
    <>
      <PageHeader title="Vendas" />

      {sales.length === 0 ? (
        <EmptyState
          icon={<ReceiptText size={26} />}
          title="Nenhuma venda registrada"
          description="As vendas aparecem aqui assim que você registrar a primeira."
        />
      ) : (
        <div className="space-y-6">
          {porDia.map(([chave, vendas]) => {
            const total = vendas
              .filter((v) => v.status === "concluida")
              .reduce((soma, v) => soma + v.totalCents, 0);
            const primeira = vendas[0];
            return (
              <section key={chave}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-[15px] font-bold text-tinta">
                    {primeira ? dayLabel(primeira.soldAt) : chave}
                  </h2>
                  <span className="tabular text-[13px] font-semibold text-verde">{money(total)}</span>
                </div>
                <ul className="space-y-2">
                  {vendas.map((venda, indice) => {
                    const itens = saleItems.filter((i) => i.saleId === venda.id);
                    const primeiroItem = itens[0];
                    const cancelada = venda.status === "cancelada";
                    return (
                      <motion.li
                        key={venda.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: Math.min(indice * 0.02, 0.2) }}
                      >
                        <button
                          type="button"
                          onClick={() => setAberta(venda)}
                          className="flex w-full items-center gap-3 rounded-card border border-borda bg-branco p-3.5 text-left shadow-card transition-colors hover:bg-areia"
                        >
                          <span className="tabular w-12 shrink-0 text-[13px] text-cinza">
                            {timeOf(venda.soldAt)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-[15px] font-semibold ${
                                cancelada ? "text-cinza line-through" : "text-tinta"
                              }`}
                            >
                              {primeiroItem?.productName ?? "Venda"}
                              {itens.length > 1 ? ` +${itens.length - 1}` : ""}
                            </span>
                            <span className="mt-0.5 block truncate text-[13px] text-cinza">
                              {primeiroItem
                                ? `${primeiroItem.size} · ${primeiroItem.colorName} · ${units(primeiroItem.quantity)}`
                                : ""}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span
                              className={`tabular block text-[15px] font-bold ${
                                cancelada ? "text-cinza line-through" : "text-tinta"
                              }`}
                            >
                              {money(venda.totalCents)}
                            </span>
                            <span className="mt-0.5 flex items-center justify-end gap-1 text-[12px] text-cinza">
                              {cancelada ? (
                                <Badge tone="vermelho">Cancelada</Badge>
                              ) : (
                                <>
                                  <PagamentoIcone forma={venda.paymentMethod} size={13} />
                                  {paymentLabel(venda.paymentMethod)}
                                </>
                              )}
                            </span>
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <Sheet open={Boolean(aberta)} onClose={() => setAberta(null)} title="Detalhes da venda">
        {aberta ? (
          <div className="pb-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-cinza">
                {dayLabel(aberta.soldAt)} às {timeOf(aberta.soldAt)}
              </span>
              {aberta.status === "cancelada" ? <Badge tone="vermelho">Cancelada</Badge> : <Badge tone="verde">Concluída</Badge>}
            </div>

            <ul className="mt-4 space-y-2">
              {itensDaAberta.map((item) => (
                <li key={item.id} className="rounded-suave border border-borda px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-[15px] font-semibold text-tinta">{item.productName}</span>
                    <span className="tabular shrink-0 text-[15px] font-bold text-tinta">
                      {money(item.unitPriceCents * item.quantity)}
                    </span>
                  </div>
                  <p className="tabular mt-0.5 text-[13px] text-cinza">
                    {item.colorName} · {item.size} · {units(item.quantity)} × {money(item.unitPriceCents)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 rounded-suave bg-areia px-4 py-3.5 text-[14px]">
              <Linha rotulo="Forma de pagamento" valor={paymentLabel(aberta.paymentMethod)} />
              <Linha rotulo="Custo das peças" valor={money(aberta.costCents)} />
              <Linha
                rotulo="Lucro bruto"
                valor={money(aberta.totalCents - aberta.costCents)}
                destaque="verde"
              />
              <Linha rotulo="Total" valor={money(aberta.totalCents)} destaque="tinta" />
            </dl>

            {aberta.status === "concluida" ? (
              confirmandoCancelamento ? (
                <div className="mt-5 rounded-suave border border-[#f6d4d4] bg-vermelho-suave p-4">
                  <p className="text-[14px] leading-relaxed text-vermelho">
                    Cancelar esta venda devolve {units(itensDaAberta.reduce((s, i) => s + i.quantity, 0))} ao estoque.
                    A venda continua no histórico, marcada como cancelada.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="suave" size="sm" onClick={() => setConfirmandoCancelamento(false)}>
                      Voltar
                    </Button>
                    <Button variant="perigo" size="sm" onClick={cancelar}>
                      <Undo2 size={16} />
                      Confirmar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="perigo"
                  size="md"
                  full
                  className="mt-5"
                  onClick={() => setConfirmandoCancelamento(true)}
                >
                  <Ban size={17} />
                  Cancelar venda
                </Button>
              )
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </>
  );
}

function Linha({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: "verde" | "tinta";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-grafite">{rotulo}</dt>
      <dd
        className={`tabular font-semibold ${
          destaque === "verde" ? "text-verde" : destaque === "tinta" ? "text-[16px] text-tinta" : "text-tinta"
        }`}
      >
        {valor}
      </dd>
    </div>
  );
}
