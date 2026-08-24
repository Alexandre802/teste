'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { productsById, formatPrice, type Product } from './catalog';

export interface CartLine {
  productId: string;
  qty: number;
  note: string;
}

export interface PastOrder {
  id: string;
  createdAt: number;
  lines: CartLine[];
  total: number;
  mode: FulfillmentMode;
}

export type FulfillmentMode = 'entrega' | 'retirada';

export interface Customer {
  name: string;
  phone: string;
  /** Como o cliente se identificou. 'facebook' exige app Meta configurado. */
  provider: 'telefone' | 'facebook';
  address?: string;
}

interface ShopState {
  lines: CartLine[];
  customer: Customer | null;
  history: PastOrder[];
  mode: FulfillmentMode;

  add: (productId: string, qty?: number, note?: string) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  setNote: (productId: string, note: string) => void;
  clear: () => void;
  setMode: (mode: FulfillmentMode) => void;
  signIn: (customer: Customer) => void;
  signOut: () => void;
  recordOrder: () => PastOrder | null;
}

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      lines: [],
      customer: null,
      history: [],
      mode: 'entrega',

      add: (productId, qty = 1, note = '') =>
        set((s) => {
          const existing = s.lines.find((l) => l.productId === productId);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.productId === productId
                  ? { ...l, qty: l.qty + qty, note: note || l.note }
                  : l,
              ),
            };
          }
          return { lines: [...s.lines, { productId, qty, note }] };
        }),

      remove: (productId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),

      setQty: (productId, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.productId !== productId)
              : s.lines.map((l) => (l.productId === productId ? { ...l, qty } : l)),
        })),

      setNote: (productId, note) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.productId === productId ? { ...l, note } : l)),
        })),

      clear: () => set({ lines: [] }),
      setMode: (mode) => set({ mode }),
      signIn: (customer) => set({ customer }),
      signOut: () => set({ customer: null }),

      recordOrder: () => {
        const { lines, mode, history } = get();
        if (lines.length === 0) return null;
        const order: PastOrder = {
          id: `${Date.now()}`,
          createdAt: Date.now(),
          lines: lines.map((l) => ({ ...l })),
          total: cartTotal(lines),
          mode,
        };
        set({ history: [order, ...history].slice(0, 20), lines: [] });
        return order;
      },
    }),
    {
      name: 'mfh-shop-v1',
      // Só o que precisa sobreviver ao refresh. `mode` é decisão do momento.
      partialize: (s) => ({ lines: s.lines, customer: s.customer, history: s.history }),
    },
  ),
);

// ─────────────────────────── seletores puros ───────────────────────────

export function lineProduct(line: CartLine): Product | undefined {
  return productsById.get(line.productId);
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => {
    const p = productsById.get(l.productId);
    return p ? sum + p.price * l.qty : sum;
  }, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

/** Resumo do rodapé da sacola: "Sua sacola · 3 itens · R$ 72,50". */
export function cartSummary(lines: CartLine[]): string {
  const n = cartCount(lines);
  return `Sua sacola · ${n} ${n === 1 ? 'item' : 'itens'} · ${formatPrice(cartTotal(lines))}`;
}

/**
 * Produtos que o cliente mais pediu, do histórico local.
 * É o que sustenta "os seus favoritos" sem depender de backend.
 */
export function topProducts(history: PastOrder[], limit = 4): Product[] {
  const tally = new Map<string, number>();
  for (const order of history) {
    for (const line of order.lines) {
      tally.set(line.productId, (tally.get(line.productId) ?? 0) + line.qty);
    }
  }
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => productsById.get(id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, limit);
}
