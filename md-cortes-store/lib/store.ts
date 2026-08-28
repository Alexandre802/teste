"use client";

/**
 * Estado da loja.
 *
 * Toda mudança acontece primeiro aqui e no espelho local; só depois vira uma
 * operação na fila para o Supabase. É isso que dá o "confirmar venda" instantâneo
 * e o que garante que uma venda feita sem sinal não se perde: ela fica na fila
 * até o app conseguir enviar.
 *
 * As três operações que mexem em estoque (venda, cancelamento, movimentação)
 * são reenviáveis: o id vem do cliente e o banco ignora a segunda chegada.
 */

import { create } from "zustand";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CategoryId,
  DailyClosing,
  Expense,
  ExpenseCategory,
  InventoryRow,
  Movement,
  MovementKind,
  PaymentMethod,
  Product,
  Sale,
  SaleItem,
  Settings,
  Supplier,
  Uuid,
  Variant,
} from "@/types";
import type {
  DataSnapshot,
  MovementPayload,
  OutboxOp,
  SalePayload,
  SyncState,
} from "@/types/sync";
import { localDb } from "@/lib/local/idb";
import { pullAll, pushOp } from "@/services/repository";
import { DEFAULT_SETTINGS, EMPTY_SNAPSHOT, settingsToRow } from "@/services/mappers";
import { toDateKey } from "@/lib/date";

const uuid = (): Uuid =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const nowIso = () => new Date().toISOString();

export interface SaleDraftItem {
  variantId: Uuid;
  productId: Uuid;
  productName: string;
  colorName: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  unitCostCents: number;
}

export interface ProductDraftVariant {
  id?: Uuid;
  colorName: string;
  colorHex: string;
  imageUrl: string | null;
  sku: string | null;
  /** Quantidade desejada por tamanho; a diferença vira movimentação. */
  quantities: Record<string, number>;
}

export interface ProductDraft {
  id?: Uuid;
  name: string;
  category: CategoryId;
  supplierId: Uuid | null;
  sku: string | null;
  costCents: number;
  priceCents: number;
  minStock: number;
  variants: ProductDraftVariant[];
}

export interface EntryDraft {
  variantId: Uuid;
  supplierId: Uuid | null;
  unitCostCents: number | null;
  note: string | null;
  lines: { size: string; quantity: number }[];
}

interface StoreState extends DataSnapshot {
  ready: boolean;
  userId: string | null;
  supabase: SupabaseClient | null;
  outbox: OutboxOp[];
  online: boolean;
  syncState: SyncState;
  lastSyncAt: string | null;
  syncError: string | null;

  hydrate: () => Promise<void>;
  attach: (supabase: SupabaseClient | null, userId: string | null, ownerName?: string) => void;
  setOnline: (online: boolean) => void;
  sync: (options?: { silent?: boolean }) => Promise<void>;
  reset: () => Promise<void>;

  registerSale: (input: {
    items: SaleDraftItem[];
    paymentMethod: PaymentMethod;
    note?: string | null;
  }) => Promise<Sale>;
  cancelSale: (saleId: Uuid) => Promise<void>;
  addEntry: (draft: EntryDraft) => Promise<number>;
  saveProduct: (draft: ProductDraft) => Promise<Uuid>;
  archiveVariant: (variantId: Uuid) => Promise<void>;
  saveExpense: (input: {
    id?: Uuid;
    description: string;
    amountCents: number;
    category: ExpenseCategory;
    spentOn: string;
  }) => Promise<void>;
  removeExpense: (id: Uuid) => Promise<void>;
  saveSupplier: (input: { id?: Uuid; name: string; phone: string | null; notes: string | null }) => Promise<Uuid>;
  removeSupplier: (id: Uuid) => Promise<void>;
  saveSettings: (patch: Partial<Settings>) => Promise<void>;
  closeDay: (closing: Omit<DailyClosing, "id" | "closedAt">) => Promise<void>;
}

// --------------------------------------------------------------- persistência

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist(get: () => StoreState) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const s = get();
    const snapshot: DataSnapshot = {
      products: s.products,
      variants: s.variants,
      inventory: s.inventory,
      sales: s.sales,
      saleItems: s.saleItems,
      movements: s.movements,
      expenses: s.expenses,
      suppliers: s.suppliers,
      closings: s.closings,
      settings: s.settings,
      ownerName: s.ownerName,
    };
    void localDb.writeSnapshot(snapshot);
    void localDb.writeOutbox(s.outbox);
  }, 120);
}

/** Aplica deltas ao espelho local do mesmo jeito que o banco aplica. */
function applyDeltas(inventory: InventoryRow[], deltas: { variantId: Uuid; size: string; delta: number; position?: number }[]): InventoryRow[] {
  const next = inventory.map((row) => ({ ...row }));
  for (const d of deltas) {
    const found = next.find((row) => row.variantId === d.variantId && row.size === d.size);
    if (found) {
      found.quantity = Math.max(0, found.quantity + d.delta);
      found.updatedAt = nowIso();
    } else {
      next.push({
        id: uuid(),
        variantId: d.variantId,
        size: d.size,
        quantity: Math.max(0, d.delta),
        position: d.position ?? 0,
        updatedAt: nowIso(),
      });
    }
  }
  return next;
}

export const useStore = create<StoreState>((set, get) => ({
  ...EMPTY_SNAPSHOT,
  ready: false,
  userId: null,
  supabase: null,
  outbox: [],
  online: true,
  syncState: "ocioso",
  lastSyncAt: null,
  syncError: null,

  async hydrate() {
    const [snapshot, outbox] = await Promise.all([
      localDb.readSnapshot<DataSnapshot>(),
      localDb.readOutbox<OutboxOp[]>(),
    ]);
    set({
      ...(snapshot ?? EMPTY_SNAPSHOT),
      settings: { ...DEFAULT_SETTINGS, ...(snapshot?.settings ?? {}) },
      outbox: outbox ?? [],
      ready: true,
      online: typeof navigator === "undefined" ? true : navigator.onLine,
    });
  },

  attach(supabase, userId, ownerName) {
    set({ supabase, userId, ...(ownerName ? { ownerName } : {}) });
  },

  setOnline(online) {
    set({ online, syncState: online ? get().syncState : "offline" });
    if (online && get().outbox.length > 0) void get().sync({ silent: true });
  },

  async sync(options) {
    const { supabase, userId } = get();
    if (!supabase || !userId) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      set({ syncState: get().outbox.length ? "pendente" : "offline" });
      return;
    }
    if (get().syncState === "sincronizando") return;
    set({ syncState: "sincronizando", syncError: null });

    // 1. Esvazia a fila em ordem: uma venda sempre chega antes do seu cancelamento.
    let queue = [...get().outbox];
    const remaining: OutboxOp[] = [];
    for (const op of queue) {
      try {
        await pushOp(supabase, op, userId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "falha ao sincronizar";
        remaining.push({ ...op, attempts: op.attempts + 1 });
        set({ syncError: message });
      }
    }
    queue = remaining;
    set({ outbox: queue });

    // 2. Só troca o retrato local quando não sobrou nada pendente — senão a
    //    resposta do servidor apagaria da tela uma venda ainda não enviada.
    if (queue.length === 0) {
      try {
        const snapshot = await pullAll(supabase, userId);
        set({ ...snapshot, lastSyncAt: nowIso(), syncState: "ocioso", syncError: null });
      } catch (error) {
        set({
          syncState: "erro",
          syncError: error instanceof Error ? error.message : "falha ao carregar",
        });
      }
    } else {
      set({ syncState: "pendente" });
    }
    if (!options?.silent) schedulePersist(get);
    schedulePersist(get);
  },

  async reset() {
    await localDb.clear();
    set({ ...EMPTY_SNAPSHOT, outbox: [], userId: null, lastSyncAt: null, syncState: "ocioso" });
  },

  // ------------------------------------------------------------------ vendas

  async registerSale({ items, paymentMethod, note }) {
    const saleId = uuid();
    const soldAt = nowIso();
    const total = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
    const cost = items.reduce((sum, i) => sum + i.unitCostCents * i.quantity, 0);

    const sale: Sale = {
      id: saleId,
      totalCents: total,
      costCents: cost,
      paymentMethod,
      status: "concluida",
      note: note ?? null,
      soldAt,
      cancelledAt: null,
      createdAt: soldAt,
    };

    const saleItems: SaleItem[] = items.map((item) => ({
      id: uuid(),
      saleId,
      variantId: item.variantId,
      productId: item.productId,
      productName: item.productName,
      colorName: item.colorName,
      size: item.size,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      unitCostCents: item.unitCostCents,
    }));

    const movements: Movement[] = saleItems.map((item) => ({
      id: uuid(),
      variantId: item.variantId as Uuid,
      size: item.size,
      delta: -item.quantity,
      kind: "venda" as MovementKind,
      unitCostCents: item.unitCostCents,
      supplierId: null,
      saleId,
      note: null,
      createdAt: soldAt,
    }));

    const payload: SalePayload = {
      id: saleId,
      payment_method: paymentMethod,
      note: note ?? null,
      sold_at: soldAt,
      items: saleItems.map((item) => ({
        id: item.id,
        variant_id: item.variantId as Uuid,
        product_id: item.productId as Uuid,
        product_name: item.productName,
        color_name: item.colorName,
        size: item.size,
        quantity: item.quantity,
        unit_price_cents: item.unitPriceCents,
        unit_cost_cents: item.unitCostCents,
      })),
    };

    const state = get();
    set({
      sales: [sale, ...state.sales],
      saleItems: [...saleItems, ...state.saleItems],
      movements: [...movements, ...state.movements],
      inventory: applyDeltas(
        state.inventory,
        saleItems.map((i) => ({ variantId: i.variantId as Uuid, size: i.size, delta: -i.quantity })),
      ),
      settings: { ...state.settings, lastSaleAt: soldAt },
      outbox: [...state.outbox, { id: uuid(), createdAt: soldAt, attempts: 0, kind: "sale", payload }],
    });
    schedulePersist(get);
    void get().sync({ silent: true });
    return sale;
  },

  async cancelSale(saleId) {
    const state = get();
    const sale = state.sales.find((s) => s.id === saleId);
    if (!sale || sale.status === "cancelada") return;
    const items = state.saleItems.filter((i) => i.saleId === saleId);
    const cancelledAt = nowIso();

    const movements: Movement[] = items
      .filter((i) => i.variantId)
      .map((item) => ({
        id: uuid(),
        variantId: item.variantId as Uuid,
        size: item.size,
        delta: item.quantity,
        kind: "cancelamento" as MovementKind,
        unitCostCents: item.unitCostCents,
        supplierId: null,
        saleId,
        note: "Venda cancelada",
        createdAt: cancelledAt,
      }));

    set({
      // A venda nunca some do histórico: fica marcada como cancelada.
      sales: state.sales.map((s) => (s.id === saleId ? { ...s, status: "cancelada", cancelledAt } : s)),
      movements: [...movements, ...state.movements],
      inventory: applyDeltas(
        state.inventory,
        movements.map((m) => ({ variantId: m.variantId, size: m.size, delta: m.delta })),
      ),
      settings: { ...state.settings, lastStockUpdateAt: cancelledAt },
      outbox: [...state.outbox, { id: uuid(), createdAt: cancelledAt, attempts: 0, kind: "cancel_sale", saleId }],
    });
    schedulePersist(get);
    void get().sync({ silent: true });
  },

  // ----------------------------------------------------------------- estoque

  async addEntry(draft) {
    const createdAt = nowIso();
    const lines = draft.lines.filter((l) => l.quantity > 0);
    if (lines.length === 0) return 0;

    const payload: MovementPayload[] = lines.map((line, index) => ({
      id: uuid(),
      variant_id: draft.variantId,
      size: line.size,
      delta: line.quantity,
      kind: "entrada",
      unit_cost_cents: draft.unitCostCents,
      supplier_id: draft.supplierId,
      note: draft.note,
      position: index,
      created_at: createdAt,
    }));

    const state = get();
    set({
      movements: [
        ...payload.map<Movement>((m) => ({
          id: m.id,
          variantId: m.variant_id,
          size: m.size,
          delta: m.delta,
          kind: "entrada",
          unitCostCents: m.unit_cost_cents,
          supplierId: m.supplier_id,
          saleId: null,
          note: m.note,
          createdAt: m.created_at,
        })),
        ...state.movements,
      ],
      inventory: applyDeltas(
        state.inventory,
        payload.map((m) => ({ variantId: m.variant_id, size: m.size, delta: m.delta, position: m.position })),
      ),
      settings: { ...state.settings, lastStockUpdateAt: createdAt },
      outbox: [...state.outbox, { id: uuid(), createdAt, attempts: 0, kind: "movements", movements: payload }],
    });
    schedulePersist(get);
    void get().sync({ silent: true });
    return lines.reduce((sum, l) => sum + l.quantity, 0);
  },

  // ---------------------------------------------------------------- produtos

  async saveProduct(draft) {
    const state = get();
    const createdAt = nowIso();
    const productId = draft.id ?? uuid();
    const existing = state.products.find((p) => p.id === productId);

    const product: Product = {
      id: productId,
      name: draft.name.trim(),
      category: draft.category,
      supplierId: draft.supplierId,
      sku: draft.sku?.trim() || null,
      costCents: draft.costCents,
      priceCents: draft.priceCents,
      minStock: draft.minStock,
      archived: false,
      createdAt: existing?.createdAt ?? createdAt,
      updatedAt: createdAt,
    };

    const variants: Variant[] = [];
    const movements: MovementPayload[] = [];
    const ops: OutboxOp[] = [
      {
        id: uuid(),
        createdAt,
        attempts: 0,
        kind: "upsert",
        table: "products",
        row: {
          id: product.id,
          name: product.name,
          category: product.category,
          supplier_id: product.supplierId,
          sku: product.sku,
          cost_cents: product.costCents,
          price_cents: product.priceCents,
          min_stock: product.minStock,
          archived: false,
          updated_at: createdAt,
        },
      },
    ];

    draft.variants.forEach((v) => {
      const variantId = v.id ?? uuid();
      const previous = state.variants.find((existingVariant) => existingVariant.id === variantId);
      variants.push({
        id: variantId,
        productId,
        colorName: v.colorName.trim(),
        colorHex: v.colorHex,
        sku: v.sku?.trim() || null,
        imageUrl: v.imageUrl,
        archived: false,
        createdAt: previous?.createdAt ?? createdAt,
        updatedAt: createdAt,
      });
      ops.push({
        id: uuid(),
        createdAt,
        attempts: 0,
        kind: "upsert",
        table: "product_variants",
        row: {
          id: variantId,
          product_id: productId,
          color_name: v.colorName.trim(),
          color_hex: v.colorHex,
          sku: v.sku?.trim() || null,
          image_url: v.imageUrl,
          archived: false,
          updated_at: createdAt,
        },
      });

      // Estoque não é sobrescrito: a diferença entre o que está no formulário e
      // o que existe hoje vira movimentação, para o histórico continuar batendo.
      Object.entries(v.quantities).forEach(([size, wanted], index) => {
        const current = state.inventory.find((row) => row.variantId === variantId && row.size === size);
        const delta = wanted - (current?.quantity ?? 0);
        if (delta === 0 && current) return;
        movements.push({
          id: uuid(),
          variant_id: variantId,
          size,
          delta,
          kind: existing ? "ajuste" : "cadastro",
          unit_cost_cents: draft.costCents,
          supplier_id: draft.supplierId,
          note: existing ? "Ajuste no cadastro" : "Estoque inicial",
          position: index,
          created_at: createdAt,
        });
      });
    });

    if (movements.length > 0) {
      ops.push({ id: uuid(), createdAt, attempts: 0, kind: "movements", movements });
    }

    const otherVariants = state.variants.filter((v) => v.productId !== productId);
    set({
      products: [product, ...state.products.filter((p) => p.id !== productId)],
      variants: [...variants, ...otherVariants],
      inventory: applyDeltas(
        state.inventory,
        movements.map((m) => ({ variantId: m.variant_id, size: m.size, delta: m.delta, position: m.position })),
      ),
      movements: [
        ...movements.map<Movement>((m) => ({
          id: m.id,
          variantId: m.variant_id,
          size: m.size,
          delta: m.delta,
          kind: m.kind as MovementKind,
          unitCostCents: m.unit_cost_cents,
          supplierId: m.supplier_id,
          saleId: null,
          note: m.note,
          createdAt: m.created_at,
        })),
        ...state.movements,
      ],
      settings: { ...state.settings, lastStockUpdateAt: createdAt },
      outbox: [...state.outbox, ...ops],
    });
    schedulePersist(get);
    void get().sync({ silent: true });
    return productId;
  },

  async archiveVariant(variantId) {
    const state = get();
    const variant = state.variants.find((v) => v.id === variantId);
    if (!variant) return;
    const updatedAt = nowIso();
    set({
      variants: state.variants.map((v) => (v.id === variantId ? { ...v, archived: true, updatedAt } : v)),
      outbox: [
        ...state.outbox,
        {
          id: uuid(),
          createdAt: updatedAt,
          attempts: 0,
          kind: "upsert",
          table: "product_variants",
          row: { id: variantId, product_id: variant.productId, color_name: variant.colorName, color_hex: variant.colorHex, archived: true, updated_at: updatedAt },
        },
      ],
    });
    schedulePersist(get);
    void get().sync({ silent: true });
  },

  // ---------------------------------------------------------------- despesas

  async saveExpense(input) {
    const state = get();
    const id = input.id ?? uuid();
    const createdAt = nowIso();
    const expense: Expense = {
      id,
      description: input.description.trim(),
      amountCents: input.amountCents,
      category: input.category,
      spentOn: input.spentOn,
      createdAt: state.expenses.find((e) => e.id === id)?.createdAt ?? createdAt,
    };
    set({
      expenses: [expense, ...state.expenses.filter((e) => e.id !== id)],
      outbox: [
        ...state.outbox,
        {
          id: uuid(),
          createdAt,
          attempts: 0,
          kind: "upsert",
          table: "expenses",
          row: {
            id,
            description: expense.description,
            amount_cents: expense.amountCents,
            category: expense.category,
            spent_on: expense.spentOn,
            updated_at: createdAt,
          },
        },
      ],
    });
    schedulePersist(get);
    void get().sync({ silent: true });
  },

  async removeExpense(id) {
    const state = get();
    set({
      expenses: state.expenses.filter((e) => e.id !== id),
      outbox: [...state.outbox, { id: uuid(), createdAt: nowIso(), attempts: 0, kind: "delete", table: "expenses", rowId: id }],
    });
    schedulePersist(get);
    void get().sync({ silent: true });
  },

  // ------------------------------------------------------------ fornecedores

  async saveSupplier(input) {
    const state = get();
    const id = input.id ?? uuid();
    const createdAt = nowIso();
    const supplier: Supplier = {
      id,
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      notes: input.notes?.trim() || null,
      archived: false,
      createdAt: state.suppliers.find((s) => s.id === id)?.createdAt ?? createdAt,
    };
    set({
      suppliers: [...state.suppliers.filter((s) => s.id !== id), supplier].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      ),
      outbox: [
        ...state.outbox,
        {
          id: uuid(),
          createdAt,
          attempts: 0,
          kind: "upsert",
          table: "suppliers",
          row: { id, name: supplier.name, phone: supplier.phone, notes: supplier.notes, archived: false, updated_at: createdAt },
        },
      ],
    });
    schedulePersist(get);
    void get().sync({ silent: true });
    return id;
  },

  async removeSupplier(id) {
    const state = get();
    set({
      suppliers: state.suppliers.filter((s) => s.id !== id),
      outbox: [...state.outbox, { id: uuid(), createdAt: nowIso(), attempts: 0, kind: "delete", table: "suppliers", rowId: id }],
    });
    schedulePersist(get);
    void get().sync({ silent: true });
  },

  // ------------------------------------------------------------- preferências

  async saveSettings(patch) {
    const state = get();
    const settings = { ...state.settings, ...patch };
    const userId = state.userId;
    set({
      settings,
      outbox: userId
        ? [
            ...state.outbox,
            {
              id: uuid(),
              createdAt: nowIso(),
              attempts: 0,
              kind: "upsert",
              table: "settings",
              row: settingsToRow(settings, userId),
            },
          ]
        : state.outbox,
    });
    schedulePersist(get);
    void get().sync({ silent: true });
  },

  // -------------------------------------------------------- fechamento do dia

  async closeDay(input) {
    const state = get();
    const id = state.closings.find((c) => c.closingDate === input.closingDate)?.id ?? uuid();
    const closedAt = nowIso();
    const closing: DailyClosing = { ...input, id, closedAt };
    set({
      closings: [closing, ...state.closings.filter((c) => c.closingDate !== input.closingDate)],
      outbox: [
        ...state.outbox,
        {
          id: uuid(),
          createdAt: closedAt,
          attempts: 0,
          kind: "upsert",
          table: "daily_closings",
          row: {
            id,
            closing_date: input.closingDate,
            revenue_cents: input.revenueCents,
            cost_cents: input.costCents,
            expenses_cents: input.expensesCents,
            profit_cents: input.profitCents,
            items_sold: input.itemsSold,
            sales_count: input.salesCount,
            by_payment: input.byPayment,
            top_products: input.topProducts,
            closed_at: closedAt,
          },
        },
      ],
    });
    schedulePersist(get);
    void get().sync({ silent: true });
  },
}));

/** O fechamento de hoje já foi feito? */
export function isDayClosed(closings: DailyClosing[], now = new Date()): boolean {
  return closings.some((c) => c.closingDate === toDateKey(now));
}
