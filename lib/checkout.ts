"use client";

import type { Order } from "@/types";
import { FORMA_SITE_PARA_BANCO } from "@/lib/admin/tipos";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { lerValor } from "@/lib/format";

/**
 * Registro do pedido no fluxo de caixa, antes de abrir o WhatsApp.
 *
 * O que sai daqui é só identificação: id do produto, quantidade e opções.
 * Preço e total NÃO são enviados — quem calcula é o banco. Se mandássemos o
 * total, bastaria abrir o inspetor do navegador para pagar R$ 0,01.
 */

/** true quando existe fluxo de caixa para registrar o pedido. */
export const caixaLigado = supabaseConfigurado;

export type PedidoRegistrado = {
  order_id: string;
  order_number: number;
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  duplicado: boolean;
};

export class ErroDeRegistro extends Error {}

/**
 * Gera a chave que impede pedido duplicado. Fica guardada no pedido em
 * andamento: tocar duas vezes em "enviar" reaproveita a mesma chave, e o
 * banco devolve o pedido que já existe em vez de criar outro.
 */
export function novoTokenDeCheckout(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function registrarPedido(
  pedido: Order,
  token: string,
): Promise<PedidoRegistrado> {
  const troco =
    pedido.payment === "dinheiro" && pedido.precisaTroco
      ? lerValor(pedido.trocoPara)
      : null;

  const resposta = await fetch("/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      checkout_token: token,
      customer_name: pedido.customer.nome,
      customer_phone: pedido.customer.telefone,
      order_type: pedido.orderType === "entrega" ? "delivery" : "pickup",
      payment_method: pedido.payment
        ? FORMA_SITE_PARA_BANCO[pedido.payment]
        : "pix",
      notes: pedido.observation,
      troco_para_cents: troco === null ? null : Math.round(troco * 100),
      address:
        pedido.orderType === "entrega"
          ? {
              cep: pedido.address.cep,
              rua: pedido.address.rua,
              numero: pedido.address.numero,
              bairro: pedido.address.bairro,
              complemento: pedido.address.complemento,
              cidade: pedido.address.cidade,
              referencia: pedido.address.referencia,
            }
          : null,
      items: pedido.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        option_ids: item.selectedOptions.flatMap((opcao) => opcao.choiceIds),
        observacao: item.observation ?? "",
      })),
    }),
  });

  if (resposta.status === 503) {
    // O caixa está desligado neste ambiente: segue sem registrar.
    throw new ErroDeRegistro("fluxo_de_caixa_desligado");
  }

  let corpo: { erro?: string } & Partial<PedidoRegistrado>;
  try {
    corpo = await resposta.json();
  } catch {
    throw new ErroDeRegistro(
      "Não foi possível registrar seu pedido. Tente novamente.",
    );
  }

  if (!resposta.ok || typeof corpo.order_number !== "number") {
    throw new ErroDeRegistro(
      corpo.erro ?? "Não foi possível registrar seu pedido. Tente novamente.",
    );
  }

  return corpo as PedidoRegistrado;
}
