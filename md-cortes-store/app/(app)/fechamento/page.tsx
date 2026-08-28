"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { PAYMENT_METHODS, paymentLabel } from "@/lib/constants";
import { money, pieces } from "@/lib/format";
import { longDate, rangeFor, toDateKey } from "@/lib/date";
import { closingFor, itemsOfSales, rankProducts, salesInRange, summarize } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PagamentoIcone } from "@/components/venda/PagamentoIcone";

/**
 * Fechamento do dia: quanto entrou, quanto custou, quanto sobrou.
 *
 * Fechar não trava nada — é um retrato guardado do dia. Uma venda registrada
 * depois continua entrando normalmente, e refazer o fechamento atualiza o
 * retrato do mesmo dia em vez de criar outro.
 */
export default function FechamentoPage() {
  const sales = useStore((s) => s.sales);
  const saleItems = useStore((s) => s.saleItems);
  const expenses = useStore((s) => s.expenses);
  const closings = useStore((s) => s.closings);
  const closeDay = useStore((s) => s.closeDay);
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);

  const hoje = new Date();
  const chave = toDateKey(hoje);
  const jaFechado = closingFor(closings, chave);

  const { resumo, ranking } = useMemo(() => {
    const { start, end } = rangeFor("hoje", hoje);
    const vendas = salesInRange(sales, start, end);
    return {
      resumo: summarize(sales, saleItems, expenses, start, end),
      ranking: rankProducts(itemsOfSales(saleItems, vendas)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, saleItems, expenses]);

  async function fechar() {
    setEnviando(true);
    await closeDay({
      closingDate: chave,
      revenueCents: resumo.revenueCents,
      costCents: resumo.costCents,
      expensesCents: resumo.expensesCents,
      profitCents: resumo.netProfitCents,
      itemsSold: resumo.itemsSold,
      salesCount: resumo.salesCount,
      byPayment: resumo.byPayment,
      topProducts: ranking.slice(0, 3).map((p) => ({ name: `${p.name} · ${p.colorName}`, quantity: p.quantity })),
    });
    toast({ tone: "sucesso", title: "Dia fechado", description: "O resumo ficou guardado." });
    setEnviando(false);
  }

  return (
    <>
      <PageHeader title="Fechamento do dia" />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[15px] text-cinza">{longDate(hoje)}</p>
          {jaFechado ? <Badge tone="verde">Fechado</Badge> : <Badge tone="neutro">Em aberto</Badge>}
        </div>

        <Card className="p-5 text-center">
          <p className="text-[14px] text-cinza">Hoje você vendeu</p>
          <p className="tabular mt-1 text-[34px] font-bold leading-tight text-tinta">
            {pieces(resumo.itemsSold)}
          </p>
          <p className="tabular mt-1 text-[15px] text-cinza">
            em {resumo.salesCount} {resumo.salesCount === 1 ? "venda" : "vendas"}
          </p>
        </Card>

        <Card className="mt-3">
          <ul className="px-4 py-1">
            <Linha rotulo="Faturamento" valor={money(resumo.revenueCents)} tom="verde" />
            <Linha rotulo="Custo das peças" valor={money(resumo.costCents)} />
            <Linha rotulo="Despesas do dia" valor={money(resumo.expensesCents)} tom="laranja" />
            <Linha rotulo="Lucro estimado" valor={money(resumo.netProfitCents)} tom="ouro" forte />
          </ul>
        </Card>

        <Card className="mt-3">
          <CardHeader title="Formas de pagamento" />
          <ul className="px-4 pb-3">
            {PAYMENT_METHODS.map((forma) => (
              <li key={forma.id} className="flex items-center gap-2.5 border-b border-borda py-2.5 last:border-b-0">
                <span className="text-cinza">
                  <PagamentoIcone forma={forma.id} size={17} />
                </span>
                <span className="flex-1 text-[14px] text-grafite">{paymentLabel(forma.id)}</span>
                <span className="tabular text-[14px] font-semibold text-tinta">
                  {money(resumo.byPayment[forma.id])}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {ranking.length > 0 ? (
          <Card className="mt-3">
            <CardHeader title="Produtos mais vendidos hoje" />
            <ol className="px-4 pb-3">
              {ranking.slice(0, 3).map((item, indice) => (
                <li key={`${item.variantId}-${item.colorName}`} className="flex items-center gap-3 border-b border-borda py-2.5 last:border-b-0">
                  <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-ouro-suave text-[13px] font-bold text-ouro">
                    {indice + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] text-tinta">
                    {item.name} · {item.colorName}
                  </span>
                  <span className="tabular shrink-0 text-[14px] font-semibold text-tinta">{item.quantity}</span>
                </li>
              ))}
            </ol>
          </Card>
        ) : null}

        {jaFechado ? (
          <div className="mt-5 flex items-center gap-3 rounded-card border border-[#cdeed8] bg-verde-suave p-4">
            <CheckCircle2 size={20} className="shrink-0 text-verde" />
            <p className="text-[14px] leading-relaxed text-grafite">
              Dia já fechado. Se registrar mais vendas hoje, feche de novo para atualizar o resumo.
            </p>
          </div>
        ) : null}

        <Button variant="principal" size="lg" full loading={enviando} onClick={fechar} className="mt-4">
          {enviando ? null : <ClipboardCheck size={19} />}
          {jaFechado ? "Atualizar fechamento" : "Fechar dia"}
        </Button>
      </motion.div>
    </>
  );
}

function Linha({
  rotulo,
  valor,
  tom,
  forte = false,
}: {
  rotulo: string;
  valor: string;
  tom?: "verde" | "laranja" | "ouro";
  forte?: boolean;
}) {
  const cor = tom === "verde" ? "text-verde" : tom === "laranja" ? "text-laranja" : tom === "ouro" ? "text-ouro" : "text-tinta";
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-borda py-3 last:border-b-0">
      <span className="text-[14px] text-grafite">{rotulo}</span>
      <span className={`tabular font-bold ${forte ? "text-[19px]" : "text-[15px]"} ${cor}`}>{valor}</span>
    </li>
  );
}
