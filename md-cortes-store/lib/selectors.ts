/**
 * Derivações puras. Nenhuma tela calcula lucro ou total por conta própria —
 * assim faturamento e lucro nunca aparecem trocados em dois lugares.
 *
 * Lucro bruto  = venda − custo da peça
 * Lucro líquido = lucro bruto − despesas do período
 */

import type {
  CategoryGroup,
  DailyClosing,
  Expense,
  InventoryRow,
  Movement,
  PaymentMethod,
  Product,
  Sale,
  SaleItem,
  Uuid,
  Variant,
  VariantView,
} from "@/types";
import { categoryGroup, compareSizes } from "@/lib/constants";
import { dayOf, isWithin, startOfDay, toDateKey, daysSince } from "@/lib/date";

export interface Catalog {
  products: Product[];
  variants: Variant[];
  inventory: InventoryRow[];
  movements: Movement[];
}

export function buildVariantViews(catalog: Catalog): VariantView[] {
  const productById = new Map(catalog.products.map((p) => [p.id, p]));

  const stockByVariant = new Map<Uuid, InventoryRow[]>();
  for (const row of catalog.inventory) {
    const list = stockByVariant.get(row.variantId);
    if (list) list.push(row);
    else stockByVariant.set(row.variantId, [row]);
  }

  const lastEntry = new Map<Uuid, string>();
  const lastSale = new Map<Uuid, string>();
  for (const m of catalog.movements) {
    if (m.kind === "entrada" || m.kind === "cadastro") {
      const current = lastEntry.get(m.variantId);
      if (!current || m.createdAt > current) lastEntry.set(m.variantId, m.createdAt);
    } else if (m.kind === "venda") {
      const current = lastSale.get(m.variantId);
      if (!current || m.createdAt > current) lastSale.set(m.variantId, m.createdAt);
    }
  }

  return catalog.variants
    .filter((v) => !v.archived)
    .map((variant) => {
      const product = productById.get(variant.productId);
      if (!product || product.archived) return null;
      const sizes = (stockByVariant.get(variant.id) ?? [])
        .map((row) => ({ size: row.size, quantity: row.quantity, position: row.position }))
        .sort((a, b) => compareSizes(a.size, b.size));
      const total = sizes.reduce((sum, s) => sum + s.quantity, 0);
      return {
        variant,
        product,
        sizes,
        total,
        lowStock: total > 0 && total <= product.minStock,
        outOfStock: total === 0,
        profitCents: product.priceCents - product.costCents,
        lastEntryAt: lastEntry.get(variant.id) ?? null,
        lastSaleAt: lastSale.get(variant.id) ?? null,
      } satisfies VariantView;
    })
    .filter((v): v is VariantView => v !== null)
    .sort((a, b) => a.product.name.localeCompare(b.product.name, "pt-BR") || a.variant.colorName.localeCompare(b.variant.colorName, "pt-BR"));
}

export function findVariantView(views: VariantView[], variantId: Uuid): VariantView | undefined {
  return views.find((v) => v.variant.id === variantId);
}

/** Busca por nome, cor, tamanho, categoria ou SKU. */
export function searchViews(views: VariantView[], query: string): VariantView[] {
  const q = query.trim().toLowerCase();
  if (!q) return views;
  const terms = q.split(/\s+/);
  return views.filter((view) => {
    const haystack = [
      view.product.name,
      view.variant.colorName,
      view.product.category,
      view.product.sku ?? "",
      view.variant.sku ?? "",
      ...view.sizes.filter((s) => s.quantity > 0).map((s) => s.size),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function filterByGroup(views: VariantView[], group: CategoryGroup | "todos"): VariantView[] {
  if (group === "todos") return views;
  return views.filter((v) => categoryGroup(v.product.category) === group);
}

// --------------------------------------------------------------------- vendas

export function concludedSales(sales: Sale[]): Sale[] {
  return sales.filter((s) => s.status === "concluida");
}

export function salesInRange(sales: Sale[], start: Date, end: Date): Sale[] {
  return concludedSales(sales).filter((s) => isWithin(s.soldAt, start, end));
}

export function itemsOfSales(saleItems: SaleItem[], sales: Sale[]): SaleItem[] {
  const ids = new Set(sales.map((s) => s.id));
  return saleItems.filter((item) => ids.has(item.saleId));
}

export interface PeriodSummary {
  revenueCents: number;
  costCents: number;
  expensesCents: number;
  grossProfitCents: number;
  netProfitCents: number;
  salesCount: number;
  itemsSold: number;
  averageTicketCents: number;
  byPayment: Record<PaymentMethod, number>;
}

export function summarize(
  sales: Sale[],
  saleItems: SaleItem[],
  expenses: Expense[],
  start: Date,
  end: Date,
): PeriodSummary {
  const inRange = salesInRange(sales, start, end);
  const items = itemsOfSales(saleItems, inRange);
  const revenueCents = inRange.reduce((sum, s) => sum + s.totalCents, 0);
  const costCents = inRange.reduce((sum, s) => sum + s.costCents, 0);
  const expensesCents = expenses
    .filter((e) => {
      const day = startOfDay(new Date(`${e.spentOn}T12:00:00`));
      return day >= startOfDay(start) && day < end;
    })
    .reduce((sum, e) => sum + e.amountCents, 0);
  const itemsSold = items.reduce((sum, i) => sum + i.quantity, 0);
  const byPayment: Record<PaymentMethod, number> = { pix: 0, dinheiro: 0, debito: 0, credito: 0 };
  for (const sale of inRange) byPayment[sale.paymentMethod] += sale.totalCents;

  return {
    revenueCents,
    costCents,
    expensesCents,
    grossProfitCents: revenueCents - costCents,
    netProfitCents: revenueCents - costCents - expensesCents,
    salesCount: inRange.length,
    itemsSold,
    averageTicketCents: inRange.length ? Math.round(revenueCents / inRange.length) : 0,
    byPayment,
  };
}

export interface DayPoint {
  key: string;
  label: string;
  revenue: number;
  cost: number;
  expenses: number;
  profit: number;
}

/** Série diária com todos os dias do intervalo, inclusive os sem venda. */
export function dailySeries(
  sales: Sale[],
  expenses: Expense[],
  start: Date,
  end: Date,
): DayPoint[] {
  const points = new Map<string, DayPoint>();
  for (let d = startOfDay(start); d < end; d.setDate(d.getDate() + 1)) {
    const key = toDateKey(d);
    points.set(key, { key, label: dayOf(d), revenue: 0, cost: 0, expenses: 0, profit: 0 });
  }
  for (const sale of salesInRange(sales, start, end)) {
    const point = points.get(toDateKey(new Date(sale.soldAt)));
    if (!point) continue;
    point.revenue += sale.totalCents;
    point.cost += sale.costCents;
  }
  for (const expense of expenses) {
    const point = points.get(expense.spentOn);
    if (point) point.expenses += expense.amountCents;
  }
  for (const point of points.values()) {
    point.profit = point.revenue - point.cost - point.expenses;
  }
  return [...points.values()];
}

// ------------------------------------------------------------------ estoque

export interface LowStockEntry {
  view: VariantView;
  size: string;
  quantity: number;
}

/** Tamanhos no limite ou abaixo do mínimo, do mais crítico para o menos. */
export function lowStockEntries(views: VariantView[]): LowStockEntry[] {
  const entries: LowStockEntry[] = [];
  for (const view of views) {
    for (const size of view.sizes) {
      if (size.quantity <= view.product.minStock) {
        entries.push({ view, size: size.size, quantity: size.quantity });
      }
    }
  }
  return entries.sort((a, b) => a.quantity - b.quantity);
}

export function totalPieces(inventory: InventoryRow[]): number {
  return inventory.reduce((sum, row) => sum + row.quantity, 0);
}

export function stockValueCents(views: VariantView[]): number {
  return views.reduce((sum, view) => sum + view.total * view.product.costCents, 0);
}

/** Peças com estoque e sem venda no período — candidatas a promoção. */
export function staleVariants(views: VariantView[], days: number, now = new Date()): { view: VariantView; days: number }[] {
  return views
    .filter((view) => view.total > 0)
    .map((view) => {
      const reference = view.lastSaleAt ?? view.lastEntryAt ?? view.variant.createdAt;
      return { view, days: daysSince(reference, now) };
    })
    .filter((entry) => entry.days >= days)
    .sort((a, b) => b.days - a.days);
}

// ---------------------------------------------------------------- relatórios

export interface ProductRanking {
  variantId: Uuid | null;
  name: string;
  colorName: string;
  quantity: number;
  revenueCents: number;
  profitCents: number;
}

export function rankProducts(items: SaleItem[]): ProductRanking[] {
  const map = new Map<string, ProductRanking>();
  for (const item of items) {
    const key = `${item.variantId ?? item.productName}-${item.colorName}`;
    const entry = map.get(key) ?? {
      variantId: item.variantId,
      name: item.productName,
      colorName: item.colorName,
      quantity: 0,
      revenueCents: 0,
      profitCents: 0,
    };
    entry.quantity += item.quantity;
    entry.revenueCents += item.unitPriceCents * item.quantity;
    entry.profitCents += (item.unitPriceCents - item.unitCostCents) * item.quantity;
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => b.quantity - a.quantity);
}

export function rankBy(items: SaleItem[], field: "size" | "colorName"): { label: string; quantity: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item[field];
    map.set(key, (map.get(key) ?? 0) + item.quantity);
  }
  return [...map.entries()]
    .map(([label, quantity]) => ({ label, quantity }))
    .sort((a, b) => b.quantity - a.quantity);
}

/** Produtos com estoque que não venderam nada no período. */
export function neverSoldInRange(views: VariantView[], items: SaleItem[]): VariantView[] {
  const sold = new Set(items.map((i) => i.variantId).filter(Boolean));
  return views.filter((view) => view.total > 0 && !sold.has(view.variant.id));
}

// -------------------------------------------------------------- venda rápida

/**
 * Ordem do "Vendi agora": o que saiu mais nos últimos dias primeiro, depois o
 * resto do estoque. Sem histórico, cai no que tem mais peça disponível.
 */
export function quickSellOrder(views: VariantView[], saleItems: SaleItem[], sales: Sale[], limit = 8): VariantView[] {
  const recentIds = new Set(
    concludedSales(sales)
      .slice(0, 60)
      .map((s) => s.id),
  );
  const score = new Map<Uuid, number>();
  saleItems.forEach((item) => {
    if (!item.variantId || !recentIds.has(item.saleId)) return;
    score.set(item.variantId, (score.get(item.variantId) ?? 0) + item.quantity);
  });

  return [...views]
    .filter((view) => view.total > 0)
    .sort((a, b) => {
      const diff = (score.get(b.variant.id) ?? 0) - (score.get(a.variant.id) ?? 0);
      if (diff !== 0) return diff;
      return b.total - a.total;
    })
    .slice(0, limit);
}

export function closingFor(closings: DailyClosing[], dateKey: string): DailyClosing | undefined {
  return closings.find((c) => c.closingDate === dateKey);
}
