'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produtoPorId, type Produto } from '@/data/products';
import { precoVisivel } from './format';

/**
 * Carrinho do front-end. Guarda só id e quantidade no localStorage — nome,
 * preço e foto vêm sempre do catálogo, então corrigir um produto em
 * data/products.ts corrige na hora o que o cliente já tinha no carrinho.
 *
 * Quando existir back-end, troque `adicionar/remover/limpar` por chamadas à
 * API e mantenha esta mesma interface: nenhum componente precisa mudar.
 */

export type ItemCarrinho = { id: string; quantidade: number };

type EstadoCarrinho = {
  itens: ItemCarrinho[];
  adicionar: (id: string, quantidade?: number) => void;
  definirQuantidade: (id: string, quantidade: number) => void;
  remover: (id: string) => void;
  limpar: () => void;
};

const LIMITE_POR_ITEM = 99;

export const useCarrinho = create<EstadoCarrinho>()(
  persist(
    (set) => ({
      itens: [],

      adicionar: (id, quantidade = 1) =>
        set((estado) => {
          const existente = estado.itens.find((i) => i.id === id);
          if (!existente) return { itens: [...estado.itens, { id, quantidade }] };
          return {
            itens: estado.itens.map((i) =>
              i.id === id
                ? { ...i, quantidade: Math.min(i.quantidade + quantidade, LIMITE_POR_ITEM) }
                : i,
            ),
          };
        }),

      definirQuantidade: (id, quantidade) =>
        set((estado) => {
          if (quantidade <= 0) return { itens: estado.itens.filter((i) => i.id !== id) };
          return {
            itens: estado.itens.map((i) =>
              i.id === id ? { ...i, quantidade: Math.min(quantidade, LIMITE_POR_ITEM) } : i,
            ),
          };
        }),

      remover: (id) => set((estado) => ({ itens: estado.itens.filter((i) => i.id !== id) })),

      limpar: () => set({ itens: [] }),
    }),
    {
      name: 'bandeira-branca-carrinho',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      /* Produto que saiu do catálogo não pode voltar do localStorage como
         item fantasma sem nome nem preço. */
      migrate: (estado) => {
        const anterior = estado as { itens?: ItemCarrinho[] } | undefined;
        return { itens: (anterior?.itens ?? []).filter((i) => produtoPorId.has(i.id)) };
      },
    },
  ),
);

export type LinhaCarrinho = { produto: Produto; quantidade: number };

/** Junta o que está no carrinho com o catálogo, descartando ids desconhecidos. */
export function linhasDoCarrinho(itens: ItemCarrinho[]): LinhaCarrinho[] {
  return itens.flatMap(({ id, quantidade }) => {
    const produto = produtoPorId.get(id);
    return produto ? [{ produto, quantidade }] : [];
  });
}

export function totalDeItens(itens: ItemCarrinho[]): number {
  return itens.reduce((soma, i) => soma + i.quantidade, 0);
}

/**
 * Subtotal em reais. Enquanto os preços não estiverem confirmados
 * (ver data/products.ts) devolve `null` e a página mostra "a combinar".
 */
export function subtotal(linhas: LinhaCarrinho[]): number | null {
  let soma = 0;
  for (const { produto, quantidade } of linhas) {
    const preco = precoVisivel(produto);
    if (preco === null) return null;
    soma += preco * quantidade;
  }
  return soma;
}
