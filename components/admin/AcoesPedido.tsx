"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BotaoAcao } from "@/components/admin/BotaoAcao";
import { Modal } from "@/components/ui/Modal";
import {
  cancelarPedido,
  marcarPago,
  mudarStatusPedido,
} from "@/lib/admin/acoes";
import {
  ROTULO_STATUS,
  type StatusPagamento,
  type StatusPedido,
} from "@/lib/admin/tipos";

/**
 * O que dá para fazer com o pedido agora.
 *
 * Cada status abre um caminho só, o seguinte. Mostrar todos os botões o tempo
 * todo é o jeito mais fácil de alguém marcar "saiu para entrega" num pedido
 * que ninguém começou a preparar.
 */
const PROXIMO: Partial<Record<StatusPedido, StatusPedido[]>> = {
  pending: ["confirmed"],
  confirmed: ["preparing"],
  preparing: ["out_for_delivery", "completed"],
  out_for_delivery: ["completed"],
};

export function AcoesPedido({
  id,
  status,
  pagamento,
}: {
  id: string;
  status: StatusPedido;
  pagamento: StatusPagamento;
}) {
  const router = useRouter();
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [reembolsar, setReembolsar] = useState(pagamento === "paid");

  const encerrado = status === "cancelled" || status === "completed";
  const proximos = PROXIMO[status] ?? [];

  if (encerrado && pagamento !== "pending") {
    return (
      <p className="rounded-carta border border-borda bg-white px-4 py-3 text-[13px] text-tinta-media">
        Este pedido já está encerrado.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {proximos.map((destino) => (
          <BotaoAcao
            key={destino}
            variante="primario"
            carregando="Atualizando…"
            acao={() => mudarStatusPedido(id, destino)}
            aoTerminar={(resultado) => resultado.ok && router.refresh()}
          >
            {destino === "completed"
              ? "Concluir pedido"
              : ROTULO_STATUS[destino]}
          </BotaoAcao>
        ))}

        {pagamento === "pending" && status !== "cancelled" && (
          <BotaoAcao
            variante="sucesso"
            carregando="Registrando…"
            acao={() => marcarPago(id)}
            aoTerminar={(resultado) => resultado.ok && router.refresh()}
          >
            Marcar como pago
          </BotaoAcao>
        )}

        {status !== "cancelled" && (
          <button
            type="button"
            onClick={() => setCancelando(true)}
            className="inline-flex min-h-[48px] items-center rounded-carta border border-vermelho/30 bg-vermelho/5 px-4 text-[14px] font-semibold text-vermelho hover:bg-vermelho/10"
          >
            Cancelar pedido
          </button>
        )}
      </div>

      <Modal
        aberto={cancelando}
        aoFechar={() => setCancelando(false)}
        titulo="Cancelar pedido"
        rodape={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCancelando(false)}
              className="min-h-[48px] flex-1 rounded-carta border border-borda bg-white text-[15px] font-semibold text-tinta"
            >
              Voltar
            </button>
            <BotaoAcao
              variante="perigo"
              larguraTotal
              carregando="Cancelando…"
              acao={() => cancelarPedido(id, motivo, reembolsar)}
              aoTerminar={(resultado) => {
                if (resultado.ok) {
                  setCancelando(false);
                  router.refresh();
                }
              }}
            >
              Confirmar cancelamento
            </BotaoAcao>
          </div>
        }
      >
        <div className="space-y-4 px-5 py-5">
          <p className="text-[15px] leading-relaxed text-tinta-media">
            O pedido cancelado sai do faturamento e não volta atrás. Para
            retomar, registre um pedido novo.
          </p>

          <div>
            <label
              htmlFor="motivo-cancelamento"
              className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
            >
              Motivo{" "}
              <span className="font-normal text-tinta-suave">(opcional)</span>
            </label>
            <textarea
              id="motivo-cancelamento"
              rows={3}
              value={motivo}
              maxLength={300}
              onChange={(evento) => setMotivo(evento.target.value)}
              placeholder="Ex.: cliente desistiu."
              className="w-full rounded-carta border border-borda px-4 py-3 text-[15px]"
            />
          </div>

          {pagamento === "paid" && (
            <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-carta border border-borda px-4">
              <input
                type="checkbox"
                checked={reembolsar}
                onChange={(evento) => setReembolsar(evento.target.checked)}
                className="h-5 w-5 accent-[#e75c16]"
              />
              <span className="text-[15px] text-tinta">
                Registrar reembolso de tudo que foi pago
              </span>
            </label>
          )}
        </div>
      </Modal>
    </>
  );
}
