"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CartItem } from "@/types";
import { FotoProduto } from "@/components/ui/FotoProduto";
import { Modal } from "@/components/ui/Modal";
import { Botao } from "@/components/ui/Botao";
import { formatarPreco } from "@/lib/format";
import { usePedido } from "@/lib/cart-store";

/**
 * Uma linha do resumo. Ao chegar em 1 e o cliente apertar o menos, o site
 * pergunta antes de remover -- ninguem perde item por toque acidental.
 */
export function LinhaPedido({ item }: { item: CartItem }) {
  const incrementar = usePedido((estado) => estado.incrementar);
  const decrementar = usePedido((estado) => estado.decrementar);
  const remover = usePedido((estado) => estado.remover);
  const [confirmando, setConfirmando] = useState(false);

  const diminuir = () => {
    if (item.quantity <= 1) {
      setConfirmando(true);
      return;
    }
    decrementar(item.lineId);
  };

  return (
    <>
      <li className="flex gap-3 border-b border-borda py-4 last:border-b-0">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-carta sm:h-20 sm:w-20">
          <FotoProduto
            src={item.image}
            alt={item.name}
            sizes="80px"
            className="h-full w-full"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="fonte-titulo text-[15px] font-bold leading-tight text-tinta">
            {item.name}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[13px] text-tinta-media">
            {item.description}
          </p>

          {item.selectedOptions.map((opcao) => (
            <p key={opcao.optionId} className="text-[12px] text-tinta-suave">
              {opcao.optionName}: {opcao.choiceNames.join(", ")}
            </p>
          ))}
          {item.observation && (
            <p className="text-[12px] italic text-tinta-suave">
              Obs.: {item.observation}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-full bg-nevoa p-1">
              <button
                type="button"
                onClick={diminuir}
                aria-label={`Diminuir quantidade de ${item.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-laranja hover:bg-creme"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span
                aria-live="polite"
                className="min-w-6 text-center text-[15px] font-bold text-tinta"
              >
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => incrementar(item.lineId)}
                aria-label={`Aumentar quantidade de ${item.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-laranja text-white hover:bg-laranja-forte"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[15px] font-extrabold text-tinta">
                {formatarPreco(item.unitPrice * item.quantity)}
              </span>
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                aria-label={`Remover ${item.name} do pedido`}
                className="flex h-11 w-11 items-center justify-center rounded-full text-tinta-suave hover:bg-vermelho/10 hover:text-vermelho"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </li>

      <Modal
        aberto={confirmando}
        aoFechar={() => setConfirmando(false)}
        titulo="Remover do pedido?"
        rodape={
          <div className="flex gap-3">
            <Botao
              variante="secundario"
              larguraTotal
              onClick={() => setConfirmando(false)}
            >
              Manter
            </Botao>
            <Botao
              larguraTotal
              onClick={() => {
                remover(item.lineId);
                setConfirmando(false);
              }}
            >
              Remover
            </Botao>
          </div>
        }
      >
        <p className="px-5 py-6 text-[15px] text-tinta-media">
          Deseja tirar <strong className="text-tinta">{item.name}</strong> do seu
          pedido?
        </p>
      </Modal>
    </>
  );
}
