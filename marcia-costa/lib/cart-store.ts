"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type {
  Address,
  CartItem,
  Customer,
  OrderType,
  PaymentMethod,
  Product,
  SelectedOption,
} from "@/types";
import { enderecoVazio } from "@/lib/endereco";
import { taxaEmUso, useZonas } from "@/lib/zonas-store";
import { novoTokenDeCheckout } from "@/lib/checkout";

/**
 * Carrinho e dados do pedido, guardados no localStorage do proprio aparelho.
 * Recarregar a pagina nao perde o pedido.
 */

type EstadoPedido = {
  items: CartItem[];
  /**
   * Chave de idempotencia deste pedido em andamento. Enquanto ela nao muda,
   * mandar de novo devolve o mesmo pedido em vez de criar outro no caixa.
   */
  checkoutToken: string;
  /** Numero e id devolvidos pelo caixa depois que o pedido foi gravado. */
  pedidoRegistrado: { order_id: string; order_number: number } | null;
  orderType: OrderType | null;
  address: Address;
  customer: Customer;
  payment: PaymentMethod | null;
  precisaTroco: boolean;
  trocoPara: string;
  observation: string;
};

type AcoesPedido = {
  adicionar: (
    produto: Product,
    quantidade: number,
    opcoes: SelectedOption[],
    observacao?: string,
  ) => void;
  alterarQuantidade: (lineId: string, quantidade: number) => void;
  incrementar: (lineId: string) => void;
  decrementar: (lineId: string) => void;
  remover: (lineId: string) => void;
  limpar: () => void;
  definirTipo: (tipo: OrderType) => void;
  definirEndereco: (endereco: Partial<Address>) => void;
  definirCliente: (cliente: Partial<Customer>) => void;
  definirPagamento: (forma: PaymentMethod) => void;
  definirPrecisaTroco: (precisa: boolean) => void;
  definirTrocoPara: (valor: string) => void;
  definirObservacao: (texto: string) => void;
  definirPedidoRegistrado: (dados: { order_id: string; order_number: number }) => void;
};

const estadoInicial: EstadoPedido = {
  items: [],
  checkoutToken: "",
  pedidoRegistrado: null,
  orderType: null,
  address: enderecoVazio,
  customer: { nome: "", telefone: "" },
  payment: null,
  precisaTroco: false,
  trocoPara: "",
  observation: "",
};

/**
 * Mexer na sacola invalida o pedido que ja foi gravado no caixa e gera uma
 * chave nova. Sem isso, alterar o carrinho depois de enviar reaproveitaria o
 * token antigo e o caixa devolveria o pedido velho, com o total velho.
 */
function aposMudarItens(estado: EstadoPedido): Partial<EstadoPedido> {
  if (!estado.pedidoRegistrado) return {};
  return { pedidoRegistrado: null, checkoutToken: novoTokenDeCheckout() };
}

/** Duas linhas iguais (mesmo produto, mesmas opcoes, mesma observacao) somam. */
function chaveDaLinha(
  produtoId: string,
  opcoes: SelectedOption[],
  observacao: string,
): string {
  const assinatura = opcoes
    .map((opcao) => `${opcao.optionId}:${[...opcao.choiceIds].sort().join(",")}`)
    .sort()
    .join("|");
  return [produtoId, assinatura, observacao.trim()].join("#");
}

export const usePedido = create<EstadoPedido & AcoesPedido>()(
  persist(
    (set) => ({
      ...estadoInicial,

      adicionar: (produto, quantidade, opcoes, observacao = "") => {
        const qtd = Math.max(1, Math.floor(quantidade));
        const extras = opcoes.reduce((soma, opcao) => soma + opcao.priceDelta, 0);
        const lineId = chaveDaLinha(produto.id, opcoes, observacao);

        set((estado) => {
          const existente = estado.items.find((item) => item.lineId === lineId);
          if (existente) {
            return {
              ...aposMudarItens(estado),
              items: estado.items.map((item) =>
                item.lineId === lineId
                  ? { ...item, quantity: item.quantity + qtd }
                  : item,
              ),
            };
          }
          const novo: CartItem = {
            lineId,
            productId: produto.id,
            name: produto.name,
            image: produto.image,
            description: produto.description,
            unitPrice: produto.price + extras,
            quantity: qtd,
            selectedOptions: opcoes,
            observation: observacao.trim() || undefined,
          };
          return { ...aposMudarItens(estado), items: [...estado.items, novo] };
        });
      },

      alterarQuantidade: (lineId, quantidade) =>
        set((estado) => ({
          ...aposMudarItens(estado),
          items:
            quantidade <= 0
              ? estado.items.filter((item) => item.lineId !== lineId)
              : estado.items.map((item) =>
                  item.lineId === lineId
                    ? { ...item, quantity: Math.floor(quantidade) }
                    : item,
                ),
        })),

      incrementar: (lineId) =>
        set((estado) => ({
          ...aposMudarItens(estado),
          items: estado.items.map((item) =>
            item.lineId === lineId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        })),

      decrementar: (lineId) =>
        set((estado) => ({
          ...aposMudarItens(estado),
          items: estado.items
            .map((item) =>
              item.lineId === lineId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),

      remover: (lineId) =>
        set((estado) => ({
          ...aposMudarItens(estado),
          items: estado.items.filter((item) => item.lineId !== lineId),
        })),

      limpar: () =>
        set({
          ...estadoInicial,
          address: { ...enderecoVazio },
          checkoutToken: novoTokenDeCheckout(),
        }),

      definirPedidoRegistrado: (dados) => set({ pedidoRegistrado: dados }),

      definirTipo: (tipo) => set({ orderType: tipo }),

      definirEndereco: (endereco) =>
        set((estado) => ({ address: { ...estado.address, ...endereco } })),

      definirCliente: (cliente) =>
        set((estado) => ({ customer: { ...estado.customer, ...cliente } })),

      definirPagamento: (forma) =>
        set(
          forma === "dinheiro"
            ? { payment: forma }
            : { payment: forma, precisaTroco: false, trocoPara: "" },
        ),

      definirPrecisaTroco: (precisa) =>
        set(precisa ? { precisaTroco: true } : { precisaTroco: false, trocoPara: "" }),

      definirTrocoPara: (valor) => set({ trocoPara: valor }),

      definirObservacao: (texto) => set({ observation: texto }),
    }),
    {
      name: "comida-caseira-marcia-costa:pedido",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Um pedido salvo de antes da integracao com o caixa nao tem token.
      onRehydrateStorage: () => (estado) => {
        if (estado && !estado.checkoutToken) {
          estado.checkoutToken = novoTokenDeCheckout();
        }
      },
    },
  ),
);

export function contarItens(items: CartItem[]): number {
  return items.reduce((soma, item) => soma + item.quantity, 0);
}

export function calcularSubtotal(items: CartItem[]): number {
  return items.reduce((soma, item) => soma + item.unitPrice * item.quantity, 0);
}

/**
 * Taxa da entrega. null quando a casa ainda nao confirmou a taxa da regiao --
 * nesse caso o site escreve "a combinar" em vez de inventar valor.
 * Sempre 0 na retirada.
 *
 * A taxa sai da mesma configuracao que o servidor usa para gravar o pedido
 * (zonas-store, alimentado por /api/zonas). Nao existe uma segunda tabela de
 * taxa em lugar nenhum. Isto aqui e so o que a tela mostra: quem decide o
 * valor cobrado e o banco, na hora de criar o pedido.
 */
export function calcularTaxa(
  orderType: OrderType | null,
  address: Address,
): number | null {
  if (orderType !== "entrega") return 0;
  return taxaEmUso(useZonas.getState().zonas, address.cidade, address.bairro);
}

/** Total. Enquanto a taxa nao existir, o total e so o subtotal. */
export function calcularTotal(subtotal: number, taxa: number | null): number {
  return subtotal + (taxa ?? 0);
}
