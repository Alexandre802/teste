'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { productsById, formatPrice, type Product } from './catalog';
import { ENDERECO_VAZIO, enderecoEmLinha, enderecoValido, type Endereco } from './endereco';
import { ESCOLHA_PADRAO, type EscolhaPagamento } from './pagamento';
import { totalComEntrega } from './entrega';

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
  /** Vazio quando o cliente entrou como convidado sem informar telefone. */
  phone: string;
  /** Como o cliente se identificou. */
  provider: 'telefone' | 'email' | 'google' | 'facebook' | 'convidado';
  email?: string;
  /**
   * Endereço em texto corrido.
   *
   * Mantido por compatibilidade com pedidos já gravados no navegador do
   * cliente. O endereço de verdade vive em `ShopState.address`, com campos
   * separados — este aqui é derivado dele na hora de gravar.
   */
  address?: string;
}

interface ShopState {
  lines: CartLine[];
  customer: Customer | null;
  history: PastOrder[];
  mode: FulfillmentMode;
  /** Endereço de entrega, com campos. Persiste entre pedidos. */
  address: Endereco;
  /** Forma de pagamento escolhida no checkout. */
  payment: EscolhaPagamento;

  add: (productId: string, qty?: number, note?: string) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  setNote: (productId: string, note: string) => void;
  clear: () => void;
  setMode: (mode: FulfillmentMode) => void;
  setAddress: (patch: Partial<Endereco>) => void;
  setPayment: (patch: Partial<EscolhaPagamento>) => void;
  signIn: (customer: Customer) => void;
  signOut: () => void;
  recordOrder: () => PastOrder | null;
}

/** O recorte de `ShopState` que vai para o armazenamento do navegador. */
type PersistidoShop = Pick<ShopState, 'lines' | 'customer' | 'history' | 'address'>;

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      lines: [],
      customer: null,
      history: [],
      mode: 'entrega',
      address: ENDERECO_VAZIO,
      payment: ESCOLHA_PADRAO,

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

      setAddress: (patch) => set((s) => ({ address: { ...s.address, ...patch } })),

      setPayment: (patch) =>
        set((s) => {
          const payment = { ...s.payment, ...patch };
          // trocar para Pix ou cartão zera o troco: ele só existe no dinheiro,
          // e um valor esquecido apareceria na mensagem da cozinha
          if (payment.forma !== 'dinheiro') {
            payment.precisaTroco = false;
            payment.trocoPara = null;
          }
          if (!payment.precisaTroco) payment.trocoPara = null;
          // dinheiro não passa pelo gateway
          if (payment.forma === 'dinheiro') payment.momento = 'na-entrega';
          return { payment };
        }),

      signIn: (customer) => set({ customer }),
      // sair apaga a identidade, nunca a sacola: o cliente não perde o pedido
      signOut: () => set({ customer: null }),

      recordOrder: () => {
        const { lines, mode, history, address, customer } = get();
        if (lines.length === 0) return null;
        const order: PastOrder = {
          id: `${Date.now()}`,
          createdAt: Date.now(),
          lines: lines.map((l) => ({ ...l })),
          total: orderTotal(lines, mode),
          mode,
        };
        set({
          history: [order, ...history].slice(0, 20),
          lines: [],
          // espelha o endereço estruturado no campo antigo, para o histórico
          // gravado continuar legível
          customer:
            customer && mode === 'entrega' && enderecoValido(address)
              ? { ...customer, address: enderecoEmLinha(address) }
              : customer,
        });
        return order;
      },
    }),
    {
      name: 'mfh-shop-v1',
      // Sobrevive ao refresh: sacola, identidade, histórico e endereço. O
      // endereço entra porque redigitar rua e número no celular é o passo em
      // que mais se desiste do pedido.
      partialize: (s) => ({
        lines: s.lines,
        customer: s.customer,
        history: s.history,
        address: s.address,
      }),
      // versão nova do estado: quem já tinha sacola gravada não perde nada,
      // só ganha os campos que faltavam
      version: 2,
      migrate: (persisted) => {
        const antigo = (persisted ?? {}) as Partial<PersistidoShop>;
        return {
          lines: antigo.lines ?? [],
          customer: antigo.customer ?? null,
          history: antigo.history ?? [],
          address: { ...ENDERECO_VAZIO, ...(antigo.address ?? {}) },
        };
      },
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

/**
 * Total do pedido: itens + taxa de entrega, quando houver.
 *
 * Enquanto a casa não confirmar a taxa (lib/entrega.ts), isto é igual ao
 * subtotal — nada é somado por conta própria.
 */
export function orderTotal(lines: CartLine[], mode: FulfillmentMode): number {
  return totalComEntrega(cartTotal(lines), mode);
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
