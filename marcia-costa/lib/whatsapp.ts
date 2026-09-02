import type { Order } from "@/types";
import { restaurant } from "@/data/restaurant";
import { formatarPreco } from "@/lib/format";
import { enderecoEmLinhas } from "@/lib/endereco";

/** Rotulo de cada forma de pagamento na mensagem que a cozinha recebe. */
const rotuloPagamento = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  debito: "Cartão de débito",
  credito: "Cartão de crédito",
} as const;

const rotuloTipo = {
  entrega: "Entrega",
  retirada: "Retirada no balcão",
} as const;

/**
 * Monta a mensagem do pedido. Funcao pura: recebe o pedido e devolve texto.
 * Quando a taxa de entrega ainda nao foi confirmada pela casa, a mensagem diz
 * "a combinar" em vez de mostrar um valor que ninguem confirmou.
 */
export function montarMensagem(pedido: Order): string {
  const linhas: string[] = [];

  linhas.push(
    `Olá! Gostaria de fazer um pedido na ${restaurant.name} 🍽️`,
    "",
    "*PEDIDO*",
    "",
  );

  for (const item of pedido.items) {
    linhas.push(
      `${item.quantity}x ${item.name} — ${formatarPreco(item.unitPrice * item.quantity)}`,
    );
    for (const opcao of item.selectedOptions) {
      if (opcao.choiceNames.length === 0) continue;
      linhas.push(`   ${opcao.optionName}: ${opcao.choiceNames.join(", ")}`);
    }
    if (item.observation) {
      linhas.push(`   Obs.: ${item.observation}`);
    }
  }

  linhas.push("", `Subtotal: ${formatarPreco(pedido.subtotal)}`);

  if (pedido.orderType === "entrega") {
    linhas.push(
      pedido.deliveryFee === null
        ? "Entrega: a combinar"
        : `Entrega: ${formatarPreco(pedido.deliveryFee)}`,
    );
  }

  linhas.push("", `*TOTAL: ${formatarPreco(pedido.total)}*`);

  if (pedido.orderType === "entrega" && pedido.deliveryFee === null) {
    linhas.push("(total sem a taxa de entrega, que ainda vamos combinar)");
  }

  if (pedido.customer.nome.trim()) {
    linhas.push("", "*Cliente:*", pedido.customer.nome.trim());
    if (pedido.customer.telefone.trim()) {
      linhas.push(pedido.customer.telefone.trim());
    }
  }

  if (pedido.orderType) {
    linhas.push("", "*Tipo:*", rotuloTipo[pedido.orderType]);
  }

  if (pedido.orderType === "entrega") {
    const endereco = enderecoEmLinhas(pedido.address);
    if (endereco.length > 0) {
      linhas.push("", "*Endereço:*", ...endereco);
    }
  }

  if (pedido.payment) {
    linhas.push("", "*Pagamento:*", rotuloPagamento[pedido.payment]);
    if (pedido.payment === "dinheiro") {
      if (pedido.precisaTroco && pedido.trocoPara.trim()) {
        linhas.push(`Troco para ${pedido.trocoPara.trim()}`);
      } else if (!pedido.precisaTroco) {
        linhas.push("Não precisa de troco");
      }
    }
  }

  if (pedido.observation.trim()) {
    linhas.push("", "*Observação:*", pedido.observation.trim());
  }

  return linhas.join("\n");
}

/**
 * Link wa.me pronto. Devolve null quando o numero da casa ainda nao foi
 * cadastrado -- a tela entao explica isso em vez de abrir um link quebrado.
 */
export function linkWhatsapp(pedido: Order): string | null {
  const numero = restaurant.whatsapp.replace(/\D/g, "");
  if (numero.length < 12) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(montarMensagem(pedido))}`;
}

/** Link de conversa simples, sem pedido. null se nao houver numero. */
export function linkConversa(texto?: string): string | null {
  const numero = restaurant.whatsapp.replace(/\D/g, "");
  if (numero.length < 12) return null;
  const base = `https://wa.me/${numero}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}
