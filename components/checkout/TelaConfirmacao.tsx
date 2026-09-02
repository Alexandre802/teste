"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, MessageCircle, RotateCcw } from "lucide-react";

import type { Order } from "@/types";
import { Botao, BotaoLink } from "@/components/ui/Botao";
import { EstadoVazio, AvisoInformativo } from "@/components/ui/Estados";
import { Totais } from "@/components/cart/Totais";
import {
  calcularSubtotal,
  calcularTaxa,
  calcularTotal,
  usePedido,
} from "@/lib/cart-store";
import { useHidratado } from "@/lib/use-hidratado";
import { formatarPreco } from "@/lib/format";
import { linkWhatsapp } from "@/lib/whatsapp";
import { enderecoEmUmaLinha } from "@/lib/endereco";

const ROTULO_PAGAMENTO = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  debito: "Cartão de débito",
  credito: "Cartão de crédito",
} as const;

/**
 * Confirmacao. O site nao diz que o pedido foi aceito nem que foi pago: ele
 * confirma o que realmente aconteceu, que foi abrir a conversa no WhatsApp.
 * A cozinha responde por la.
 */
export function TelaConfirmacao() {
  const hidratado = useHidratado();
  const estado = usePedido();
  const limpar = usePedido((store) => store.limpar);
  const [limpo, setLimpo] = useState(false);

  const subtotal = calcularSubtotal(estado.items);
  const taxa = calcularTaxa(estado.orderType, estado.address);
  const total = calcularTotal(subtotal, taxa);

  const pedido: Order = useMemo(
    () => ({
      items: estado.items,
      orderType: estado.orderType,
      address: estado.address,
      customer: estado.customer,
      payment: estado.payment,
      precisaTroco: estado.precisaTroco,
      trocoPara: estado.trocoPara,
      observation: estado.observation,
      subtotal,
      deliveryFee: estado.orderType === "entrega" ? taxa : null,
      total,
    }),
    [estado, subtotal, taxa, total],
  );

  const link = linkWhatsapp(pedido, estado.pedidoRegistrado?.order_number);

  if (!hidratado) {
    return (
      <p className="py-16 text-center text-sm text-tinta-media">Carregando…</p>
    );
  }

  if (estado.items.length === 0) {
    return (
      <EstadoVazio
        titulo={limpo ? "Pedido finalizado" : "Nada por aqui"}
        descricao={
          limpo
            ? "Obrigado! Quando quiser pedir de novo, é só abrir o cardápio."
            : "Seu pedido está vazio. Monte um novo pedido no cardápio."
        }
        acao={<BotaoLink href="/cardapio">Ver cardápio</BotaoLink>}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-bloco border border-whatsapp/30 bg-whatsapp/5 p-6 text-center">
        <CheckCircle2
          className="mx-auto h-12 w-12 text-whatsapp-escuro"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <h2 className="fonte-titulo mt-3 text-xl font-extrabold text-tinta">
          {estado.pedidoRegistrado
            ? `Pedido #${estado.pedidoRegistrado.order_number} enviado!`
            : "Pedido montado!"}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tinta-media">
          Abrimos a conversa no WhatsApp com todos os detalhes. É lá que a
          Márcia confirma o pedido, o valor final e o horário.
        </p>
      </div>

      <AvisoInformativo>
        Só está valendo depois que a casa responder no WhatsApp. Se a conversa
        não abriu, use o botão abaixo.
      </AvisoInformativo>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta sm:p-5">
        <h2 className="fonte-titulo mb-3 text-[17px] font-bold text-tinta">
          O que você pediu
        </h2>
        <ul className="space-y-1.5 text-[15px]">
          {estado.items.map((item) => (
            <li key={item.lineId} className="flex justify-between gap-3">
              <span className="text-tinta">
                {item.quantity}x {item.name}
              </span>
              <span className="shrink-0 font-semibold text-tinta">
                {formatarPreco(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <Totais
            subtotal={subtotal}
            taxa={taxa}
            total={total}
            tipo={estado.orderType}
          />
        </div>

        <dl className="mt-4 space-y-1.5 border-t border-borda pt-4 text-[14px]">
          <Linha termo="Tipo">
            {estado.orderType === "entrega" ? "Entrega" : "Retirada no balcão"}
          </Linha>
          {estado.customer.nome && (
            <Linha termo="Nome">{estado.customer.nome}</Linha>
          )}
          {estado.orderType === "entrega" && (
            <Linha termo="Endereço">{enderecoEmUmaLinha(estado.address)}</Linha>
          )}
          {estado.payment && (
            <Linha termo="Pagamento">
              {ROTULO_PAGAMENTO[estado.payment]}
              {estado.payment === "dinheiro" &&
                estado.precisaTroco &&
                estado.trocoPara &&
                ` · troco para ${estado.trocoPara}`}
            </Linha>
          )}
          {estado.observation && (
            <Linha termo="Observação">{estado.observation}</Linha>
          )}
        </dl>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        {link && (
          <BotaoLink
            href={link}
            externo
            variante="whatsapp"
            tamanho="grande"
            larguraTotal
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Abrir o WhatsApp de novo
          </BotaoLink>
        )}
        <Botao
          variante="secundario"
          tamanho="grande"
          larguraTotal
          onClick={() => {
            limpar();
            setLimpo(true);
          }}
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Começar um novo pedido
        </Botao>
      </div>
    </div>
  );
}

function Linha({
  termo,
  children,
}: {
  termo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-semibold text-tinta-media">{termo}:</dt>
      <dd className="min-w-0 break-words text-tinta">{children}</dd>
    </div>
  );
}
