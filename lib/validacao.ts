import type { Order } from "@/types";
import { enderecoValido } from "@/lib/endereco";
import { lerValor } from "@/lib/format";

/** Um problema que impede o envio, com o texto que o cliente le na tela. */
export type Pendencia = {
  campo: string;
  mensagem: string;
};

/**
 * Confere tudo que falta antes de enviar o pedido. Lista vazia = pode enviar.
 * As mensagens sao escritas para o cliente, nao para o desenvolvedor.
 */
export function pendenciasDoPedido(pedido: Order): Pendencia[] {
  const pendencias: Pendencia[] = [];

  if (pedido.items.length === 0) {
    pendencias.push({
      campo: "carrinho",
      mensagem: "Seu pedido está vazio. Escolha ao menos um item no cardápio.",
    });
  }

  if (!pedido.orderType) {
    pendencias.push({
      campo: "tipo",
      mensagem: "Escolha entre entrega e retirada.",
    });
  }

  if (!pedido.customer.nome.trim()) {
    pendencias.push({ campo: "nome", mensagem: "Informe seu nome." });
  }

  if (pedido.orderType === "entrega" && !enderecoValido(pedido.address)) {
    pendencias.push({
      campo: "endereco",
      mensagem: "Complete o endereço de entrega: rua, número, bairro e cidade.",
    });
  }

  if (!pedido.payment) {
    pendencias.push({
      campo: "pagamento",
      mensagem: "Escolha a forma de pagamento.",
    });
  }

  if (pedido.payment === "dinheiro" && pedido.precisaTroco) {
    const valor = lerValor(pedido.trocoPara);
    if (valor === null || valor <= 0) {
      pendencias.push({
        campo: "troco",
        mensagem: "Informe para quanto você precisa de troco.",
      });
    } else if (valor < pedido.total) {
      pendencias.push({
        campo: "troco",
        mensagem: "O valor do troco precisa ser maior que o total do pedido.",
      });
    }
  }

  return pendencias;
}

export function pedidoPodeSerEnviado(pedido: Order): boolean {
  return pendenciasDoPedido(pedido).length === 0;
}
