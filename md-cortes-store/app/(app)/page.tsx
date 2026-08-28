"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Boxes,
  ClipboardCheck,
  DollarSign,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useCatalogo } from "@/hooks/useCatalogo";
import {
  dailySeries,
  itemsOfSales,
  lowStockEntries,
  quickSellOrder,
  rankProducts,
  salesInRange,
  summarize,
  totalPieces,
} from "@/lib/selectors";
import { rangeFor } from "@/lib/date";
import { money, pieces } from "@/lib/format";
import { relativeTime } from "@/lib/date";
import { TopBar } from "@/components/layout/TopBar";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { AtivarLembretes } from "@/components/dashboard/AtivarLembretes";
import { AlertaEstoque } from "@/components/dashboard/AlertaEstoque";
import { VendiAgora } from "@/components/dashboard/VendiAgora";
import { ResumoRapido } from "@/components/dashboard/ResumoRapido";
import { GraficoDiario } from "@/components/financeiro/GraficoDiario";
import { ProductThumb } from "@/components/ui/ProductThumb";

export default function DashboardPage() {
  const ownerName = useStore((s) => s.ownerName);
  const sales = useStore((s) => s.sales);
  const saleItems = useStore((s) => s.saleItems);
  const expenses = useStore((s) => s.expenses);
  const inventory = useStore((s) => s.inventory);
  const movements = useStore((s) => s.movements);
  const catalogo = useCatalogo();

  const hoje = useMemo(() => {
    const { start, end } = rangeFor("hoje");
    return summarize(sales, saleItems, expenses, start, end);
  }, [sales, saleItems, expenses]);

  const serie = useMemo(() => {
    const { start, end } = rangeFor("7d");
    return dailySeries(sales, expenses, start, end);
  }, [sales, expenses]);

  const semana = useMemo(() => {
    const { start, end } = rangeFor("7d");
    return rankProducts(itemsOfSales(saleItems, salesInRange(sales, start, end)));
  }, [sales, saleItems]);

  const alertas = useMemo(() => lowStockEntries(catalogo), [catalogo]);
  const sugestoes = useMemo(() => quickSellOrder(catalogo, saleItems, sales, 8), [catalogo, saleItems, sales]);

  const campeao = semana[0];
  const capaCampeao = campeao?.variantId
    ? catalogo.find((v) => v.variant.id === campeao.variantId)?.variant.imageUrl ?? null
    : null;

  const ultimaEntrada = movements.find((m) => m.kind === "entrada" || m.kind === "cadastro");
  const ultimaVenda = sales.find((s) => s.status === "concluida");

  return (
    <>
      <TopBar alertas={alertas.length} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.01em] text-tinta">
          Olá, {ownerName} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 text-[14px] text-cinza">Visão geral da loja hoje</p>
      </motion.div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatCard
          icon={<DollarSign size={19} />}
          label="Faturamento hoje"
          value={hoje.revenueCents}
          format={money}
          tone="verde"
          delay={0}
        />
        <StatCard
          icon={<TrendingUp size={19} />}
          label="Lucro estimado"
          value={hoje.netProfitCents}
          format={money}
          tone="ouro"
          delay={0.05}
        />
        <StatCard
          icon={<ShoppingBag size={19} />}
          label="Peças vendidas"
          value={hoje.itemsSold}
          format={(v) => String(v)}
          tone="azul"
          delay={0.1}
        />
        <StatCard
          icon={<Boxes size={19} />}
          label="Peças em estoque"
          value={totalPieces(inventory)}
          format={(v) => String(v)}
          tone="roxo"
          delay={0.15}
        />
      </div>

      <ButtonLink href="/venda" variant="principal" size="lg" full className="mt-5 uppercase tracking-wide">
        <Plus size={21} strokeWidth={2.6} />
        Registrar venda
      </ButtonLink>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <ButtonLink href="/entrada" variant="contorno" size="compacto" className="whitespace-nowrap">
          <Plus size={16} />
          Entrada de estoque
        </ButtonLink>
        <ButtonLink href="/estoque" variant="suave" size="compacto" className="whitespace-nowrap">
          <Package size={16} />
          Ver estoque
        </ButtonLink>
      </div>

      <div className="mt-5 space-y-5">
        <AtivarLembretes />
        <AlertaEstoque entradas={alertas} />
        <VendiAgora sugestoes={sugestoes} />

        <ResumoRapido
          maisVendido={campeao ? `${campeao.name} · ${campeao.colorName}` : null}
          emAlerta={alertas.length}
          ultimaEntrada={ultimaEntrada ? relativeTime(ultimaEntrada.createdAt) : null}
          ultimaVenda={ultimaVenda ? relativeTime(ultimaVenda.soldAt) : null}
        />

        <Card>
          <CardHeader
            title="Gráfico de vendas"
            action={<span className="text-[13px] text-cinza">7 dias</span>}
          />
          <div className="px-2 pb-3">
            <GraficoDiario dados={serie} titulo="Faturamento por dia nos últimos 7 dias" />
          </div>
        </Card>

        {campeao ? (
          <Link
            href="/relatorios"
            className="flex items-center gap-3 rounded-card border border-ouro-borda bg-ouro-suave p-3.5 transition-colors hover:bg-[#fbf0d9]"
          >
            <ProductThumb src={capaCampeao} alt={campeao.name} size={58} />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-grafite">Produto mais vendido da semana</span>
              <span className="block truncate text-[15px] font-bold text-tinta">
                {campeao.name} · {campeao.colorName}
              </span>
              <span className="tabular block text-[13px] text-cinza">{pieces(campeao.quantity)} vendidas</span>
            </span>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ouro text-branco">
              <Trophy size={20} />
            </span>
          </Link>
        ) : null}

        <ButtonLink href="/fechamento" variant="suave" size="md" full>
          <ClipboardCheck size={18} />
          Fechamento do dia
        </ButtonLink>
      </div>
    </>
  );
}
