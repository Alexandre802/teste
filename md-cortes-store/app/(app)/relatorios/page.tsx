"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Coins, Hash, Ruler, ShoppingBag, Palette, TrendingUp, TrendingDown } from "lucide-react";
import { RANGES, rangeFor, type RangeId } from "@/lib/date";
import {
  itemsOfSales,
  neverSoldInRange,
  rankBy,
  rankProducts,
  salesInRange,
  staleVariants,
  summarize,
} from "@/lib/selectors";
import { STALE_PRODUCT_DAYS } from "@/lib/constants";
import { money, pieces } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useCatalogo } from "@/hooks/useCatalogo";
import { ScreenTitle } from "@/components/ui/PageHeader";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductThumb, ColorDot } from "@/components/ui/ProductThumb";

export default function RelatoriosPage() {
  const sales = useStore((s) => s.sales);
  const saleItems = useStore((s) => s.saleItems);
  const expenses = useStore((s) => s.expenses);
  const catalogo = useCatalogo();
  const [periodo, setPeriodo] = useState<RangeId>("30d");

  const dados = useMemo(() => {
    const { start, end } = rangeFor(periodo);
    const vendas = salesInRange(sales, start, end);
    const itens = itemsOfSales(saleItems, vendas);
    const ranking = rankProducts(itens);
    return {
      resumo: summarize(sales, saleItems, expenses, start, end),
      ranking,
      porLucro: [...ranking].sort((a, b) => b.profitCents - a.profitCents),
      tamanhos: rankBy(itens, "size"),
      cores: rankBy(itens, "colorName"),
      semVenda: neverSoldInRange(catalogo, itens),
    };
  }, [sales, saleItems, expenses, periodo, catalogo]);

  const parados = useMemo(() => staleVariants(catalogo, STALE_PRODUCT_DAYS), [catalogo]);

  const maisVendido = dados.ranking[0];
  const menosVendido = dados.ranking.length > 1 ? dados.ranking[dados.ranking.length - 1] : undefined;
  const maiorLucro = dados.porLucro[0];

  return (
    <>
      <ScreenTitle title="Relatórios" subtitle="O que vende, o que sobra e o que parou" />

      <ChipRow>
        {RANGES.filter((r) => r.id !== "hoje").map((r) => (
          <Chip key={r.id} active={periodo === r.id} onClick={() => setPeriodo(r.id)}>
            {r.label}
          </Chip>
        ))}
      </ChipRow>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard icon={<Coins size={19} />} label="Faturamento" value={dados.resumo.revenueCents} format={money} tone="verde" />
        <StatCard icon={<TrendingUp size={19} />} label="Lucro líquido" value={dados.resumo.netProfitCents} format={money} tone="ouro" delay={0.05} />
        <StatCard icon={<Hash size={19} />} label="Vendas" value={dados.resumo.salesCount} format={(v) => String(v)} tone="azul" delay={0.1} />
        <StatCard icon={<ShoppingBag size={19} />} label="Ticket médio" value={dados.resumo.averageTicketCents} format={money} tone="roxo" delay={0.15} />
      </div>

      {dados.ranking.length === 0 ? (
        <Card className="mt-5">
          <EmptyState
            icon={<ShoppingBag size={26} />}
            title="Sem vendas no período"
            description="Escolha um período maior ou registre a primeira venda."
          />
        </Card>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Destaque
              titulo="Mais vendido"
              icone={<TrendingUp size={17} />}
              tom="verde"
              nome={maisVendido ? `${maisVendido.name} · ${maisVendido.colorName}` : "—"}
              detalhe={maisVendido ? pieces(maisVendido.quantity) : ""}
            />
            <Destaque
              titulo="Menos vendido"
              icone={<TrendingDown size={17} />}
              tom="laranja"
              nome={menosVendido ? `${menosVendido.name} · ${menosVendido.colorName}` : "—"}
              detalhe={menosVendido ? pieces(menosVendido.quantity) : ""}
            />
            <Destaque
              titulo="Maior lucro"
              icone={<Coins size={17} />}
              tom="ouro"
              nome={maiorLucro ? `${maiorLucro.name} · ${maiorLucro.colorName}` : "—"}
              detalhe={maiorLucro ? money(maiorLucro.profitCents) : ""}
            />
          </div>

          <Card className="mt-4">
            <CardHeader title="Ranking de vendas" />
            <ol className="px-4 pb-3">
              {dados.ranking.slice(0, 8).map((item, indice) => (
                <li key={`${item.variantId}-${item.colorName}`} className="flex items-center gap-3 border-b border-borda py-2.5 last:border-b-0">
                  <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-areia text-[13px] font-bold text-cinza">
                    {indice + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-tinta">{item.name}</span>
                    <span className="block truncate text-[12px] text-cinza">{item.colorName}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="tabular block text-[14px] font-bold text-tinta">{item.quantity}</span>
                    <span className="tabular block text-[12px] text-verde">{money(item.profitCents)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ListaSimples titulo="Tamanhos mais vendidos" icone={<Ruler size={16} />} itens={dados.tamanhos} />
            <ListaSimples titulo="Cores mais vendidas" icone={<Palette size={16} />} itens={dados.cores} />
          </div>
        </>
      )}

      <Card className="mt-4">
        <CardHeader
          title="Produtos parados"
          action={<span className="text-[13px] text-cinza">{STALE_PRODUCT_DAYS}+ dias</span>}
        />
        {parados.length === 0 ? (
          <p className="px-4 pb-4 text-[14px] text-cinza">
            Nenhuma peça parada há mais de {STALE_PRODUCT_DAYS} dias.
          </p>
        ) : (
          <ul className="px-4 pb-3">
            {parados.slice(0, 10).map((entrada) => (
              <li key={entrada.view.variant.id} className="border-b border-borda last:border-b-0">
                <Link href={`/estoque/${entrada.view.variant.id}`} className="flex items-center gap-3 py-2.5">
                  <ProductThumb src={entrada.view.variant.imageUrl} alt={entrada.view.product.name} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-tinta">
                      {entrada.view.product.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-cinza">
                      <ColorDot hex={entrada.view.variant.colorHex} size={10} />
                      {entrada.view.variant.colorName} · {entrada.view.total} em estoque
                    </span>
                  </span>
                  <span className="tabular flex shrink-0 items-center gap-1 text-[13px] font-semibold text-laranja">
                    <Clock size={13} />
                    {entrada.days} dias
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {dados.semVenda.length > 0 ? (
        <p className="mt-3 text-center text-[13px] text-cinza">
          {dados.semVenda.length} {dados.semVenda.length === 1 ? "peça não vendeu" : "peças não venderam"} nada no
          período escolhido.
        </p>
      ) : null}
    </>
  );
}

function Destaque({
  titulo,
  icone,
  nome,
  detalhe,
  tom,
}: {
  titulo: string;
  icone: React.ReactNode;
  nome: string;
  detalhe: string;
  tom: "verde" | "laranja" | "ouro";
}) {
  const cores = {
    verde: "bg-verde-suave text-verde",
    laranja: "bg-laranja-suave text-laranja",
    ouro: "bg-ouro-suave text-ouro",
  } as const;
  return (
    <div className="rounded-card border border-borda bg-branco p-4 shadow-card">
      <span className={`mb-2 flex size-8 items-center justify-center rounded-full ${cores[tom]}`}>{icone}</span>
      <span className="block text-[12px] font-semibold uppercase tracking-wide text-cinza">{titulo}</span>
      <span className="mt-0.5 block truncate text-[15px] font-bold text-tinta">{nome}</span>
      <span className="tabular block text-[13px] text-cinza">{detalhe}</span>
    </div>
  );
}

function ListaSimples({
  titulo,
  icone,
  itens,
}: {
  titulo: string;
  icone: React.ReactNode;
  itens: { label: string; quantity: number }[];
}) {
  const maior = itens[0]?.quantity ?? 1;
  return (
    <Card>
      <CardHeader title={<span className="flex items-center gap-2">{icone}{titulo}</span>} />
      {itens.length === 0 ? (
        <p className="px-4 pb-4 text-[14px] text-cinza">Sem dados no período.</p>
      ) : (
        <ul className="px-4 pb-4">
          {itens.slice(0, 5).map((item) => (
            <li key={item.label} className="py-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[14px] text-grafite">{item.label}</span>
                <span className="tabular text-[14px] font-semibold text-tinta">{item.quantity}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-areia">
                <div className="h-full rounded-pill bg-ouro" style={{ width: `${(item.quantity / maior) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
