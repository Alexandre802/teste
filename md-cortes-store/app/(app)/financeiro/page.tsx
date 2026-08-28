"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Coins, Receipt, TrendingUp, Wallet } from "lucide-react";
import { RANGES, rangeFor, type RangeId } from "@/lib/date";
import { dailySeries, summarize } from "@/lib/selectors";
import { PAYMENT_METHODS } from "@/lib/constants";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ScreenTitle } from "@/components/ui/PageHeader";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ButtonLink } from "@/components/ui/Button";
import { GraficoDiario } from "@/components/financeiro/GraficoDiario";
import { PagamentoIcone } from "@/components/venda/PagamentoIcone";

/**
 * Faturamento e lucro nunca aparecem como sinônimos aqui.
 *   lucro bruto   = venda − custo da peça
 *   lucro líquido = lucro bruto − despesas
 */
export default function FinanceiroPage() {
  const sales = useStore((s) => s.sales);
  const saleItems = useStore((s) => s.saleItems);
  const expenses = useStore((s) => s.expenses);
  const [periodo, setPeriodo] = useState<RangeId>("30d");

  const { resumo, serie } = useMemo(() => {
    const { start, end } = rangeFor(periodo);
    return {
      resumo: summarize(sales, saleItems, expenses, start, end),
      serie: dailySeries(sales, expenses, start, end),
    };
  }, [sales, saleItems, expenses, periodo]);

  const totalPagamentos = Object.values(resumo.byPayment).reduce((soma, v) => soma + v, 0);

  return (
    <>
      <ScreenTitle title="Financeiro" subtitle="Entradas, custos e o que sobra" />

      <ChipRow>
        {RANGES.map((r) => (
          <Chip key={r.id} active={periodo === r.id} onClick={() => setPeriodo(r.id)}>
            {r.label}
          </Chip>
        ))}
      </ChipRow>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard icon={<Coins size={19} />} label="Faturamento" value={resumo.revenueCents} format={money} tone="verde" />
        <StatCard icon={<Wallet size={19} />} label="Custo das peças" value={resumo.costCents} format={money} tone="azul" delay={0.05} />
        <StatCard icon={<Receipt size={19} />} label="Despesas" value={resumo.expensesCents} format={money} tone="laranja" delay={0.1} />
        <StatCard icon={<TrendingUp size={19} />} label="Lucro líquido" value={resumo.netProfitCents} format={money} tone="ouro" delay={0.15} />
      </div>

      <div className="mt-3 rounded-card border border-borda bg-areia px-4 py-3">
        <p className="tabular text-[13px] leading-relaxed text-grafite">
          Lucro bruto <strong className="text-tinta">{money(resumo.grossProfitCents)}</strong> = faturamento −
          custo das peças. Tirando as despesas, sobram{" "}
          <strong className={resumo.netProfitCents >= 0 ? "text-verde" : "text-vermelho"}>
            {money(resumo.netProfitCents)}
          </strong>
          .
        </p>
      </div>

      <Card className="mt-5">
        <CardHeader title="Faturamento por dia" />
        <div className="px-2 pb-3">
          <GraficoDiario dados={serie} chave="revenue" titulo="Faturamento por dia" altura={200} />
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Lucro líquido por dia" />
        <div className="px-2 pb-3">
          <GraficoDiario dados={serie} chave="profit" titulo="Lucro líquido por dia" altura={200} />
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Como você recebeu" />
        <ul className="px-4 pb-4">
          {PAYMENT_METHODS.map((forma) => {
            const valor = resumo.byPayment[forma.id];
            const fatia = totalPagamentos > 0 ? (valor / totalPagamentos) * 100 : 0;
            return (
              <li key={forma.id} className="border-b border-borda py-3 last:border-b-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-cinza">
                    <PagamentoIcone forma={forma.id} size={17} />
                  </span>
                  <span className="flex-1 text-[14px] text-grafite">{forma.label}</span>
                  <span className="tabular text-[14px] font-semibold text-tinta">{money(valor)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-areia">
                  <div className="h-full rounded-pill bg-ouro" style={{ width: `${fatia}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <ButtonLink href="/despesas" variant="suave" size="md" full>
          <Receipt size={17} />
          Despesas
        </ButtonLink>
        <ButtonLink href="/relatorios" variant="contorno" size="md" full>
          <ArrowRight size={17} />
          Relatórios
        </ButtonLink>
      </div>
    </>
  );
}
