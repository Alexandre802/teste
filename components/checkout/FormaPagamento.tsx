"use client";

import { Banknote, CreditCard, QrCode, Wallet } from "lucide-react";

import type { PaymentMethod } from "@/types";
import { Campo } from "@/components/ui/Campo";
import { paymentMethods } from "@/data/restaurant";
import { mascaraDinheiro } from "@/lib/format";

const ICONES = {
  QrCode,
  Banknote,
  CreditCard,
} as const;

/**
 * Forma de pagamento. Nenhuma delas cobra pelo site: o pagamento acontece na
 * entrega ou na retirada, e o site diz isso em vez de simular cobranca.
 */
export function FormaPagamento({
  valor,
  precisaTroco,
  trocoPara,
  erroTroco,
  aoEscolher,
  aoDefinirPrecisaTroco,
  aoDefinirTroco,
}: {
  valor: PaymentMethod | null;
  precisaTroco: boolean;
  trocoPara: string;
  erroTroco?: string;
  aoEscolher: (forma: PaymentMethod) => void;
  aoDefinirPrecisaTroco: (precisa: boolean) => void;
  aoDefinirTroco: (texto: string) => void;
}) {
  return (
    <fieldset>
      <legend className="fonte-titulo mb-3 flex items-center gap-2 text-[17px] font-bold text-tinta">
        <Wallet className="h-5 w-5 text-laranja" aria-hidden="true" />
        Forma de pagamento
      </legend>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {paymentMethods.map((forma) => {
          const Icone = ICONES[forma.icon as keyof typeof ICONES] ?? CreditCard;
          const marcada = valor === forma.id;
          return (
            <label
              key={forma.id}
              className={`flex min-h-[76px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-carta border px-2 text-[13px] font-semibold transition-colors ${
                marcada
                  ? "border-laranja bg-creme text-laranja-queimado"
                  : "border-borda bg-white text-tinta hover:border-laranja"
              }`}
            >
              <input
                type="radio"
                name="forma-pagamento"
                value={forma.id}
                checked={marcada}
                onChange={() => aoEscolher(forma.id)}
                className="sr-only"
              />
              <Icone
                className={`h-5 w-5 ${marcada ? "text-laranja" : "text-tinta-media"}`}
                aria-hidden="true"
              />
              {forma.label}
            </label>
          );
        })}
      </div>

      {valor === "dinheiro" && (
        <div className="mt-4 rounded-carta bg-nevoa p-4">
          <p className="text-[15px] font-semibold text-tinta">
            Precisa de troco?
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              { rotulo: "Sim", valor: true },
              { rotulo: "Não", valor: false },
            ].map((opcao) => (
              <label
                key={opcao.rotulo}
                className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-carta border text-[15px] font-semibold transition-colors ${
                  precisaTroco === opcao.valor
                    ? "border-laranja bg-laranja text-white"
                    : "border-borda bg-white text-tinta"
                }`}
              >
                <input
                  type="radio"
                  name="precisa-troco"
                  checked={precisaTroco === opcao.valor}
                  onChange={() => aoDefinirPrecisaTroco(opcao.valor)}
                  className="sr-only"
                />
                {opcao.rotulo}
              </label>
            ))}
          </div>

          {precisaTroco && (
            <Campo
              rotulo="Troco para quanto?"
              className="mt-3"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={trocoPara}
              erro={erroTroco}
              onChange={(evento) =>
                aoDefinirTroco(mascaraDinheiro(evento.target.value))
              }
            />
          )}
        </div>
      )}

      <p className="mt-3 text-[12px] leading-relaxed text-tinta-suave">
        O pagamento é feito na entrega ou na retirada. O site não cobra nada
        agora — ele só monta o pedido e envia para a cozinha pelo WhatsApp.
      </p>
    </fieldset>
  );
}
