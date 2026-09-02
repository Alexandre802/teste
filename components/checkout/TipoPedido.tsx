"use client";

import { Bike, ShoppingBag } from "lucide-react";

import type { OrderType } from "@/types";

const OPCOES: { id: OrderType; nome: string; icone: typeof Bike }[] = [
  { id: "entrega", nome: "Entrega", icone: Bike },
  { id: "retirada", nome: "Retirada", icone: ShoppingBag },
];

/** Entrega ou retirada. Na retirada o endereco nem e pedido. */
export function TipoPedido({
  valor,
  aoEscolher,
}: {
  valor: OrderType | null;
  aoEscolher: (tipo: OrderType) => void;
}) {
  return (
    <fieldset>
      <legend className="fonte-titulo mb-3 flex items-center gap-2 text-[17px] font-bold text-tinta">
        <Bike className="h-5 w-5 text-laranja" aria-hidden="true" />
        Tipo de pedido
      </legend>

      <div className="grid grid-cols-2 gap-3">
        {OPCOES.map((opcao) => {
          const Icone = opcao.icone;
          const marcada = valor === opcao.id;
          return (
            <label
              key={opcao.id}
              className={`flex min-h-[60px] cursor-pointer items-center justify-center gap-2 rounded-carta border text-[15px] font-bold transition-colors ${
                marcada
                  ? "border-laranja bg-laranja text-white"
                  : "border-borda bg-creme text-laranja-queimado hover:border-laranja"
              }`}
            >
              <input
                type="radio"
                name="tipo-pedido"
                value={opcao.id}
                checked={marcada}
                onChange={() => aoEscolher(opcao.id)}
                className="sr-only"
              />
              <Icone className="h-5 w-5" aria-hidden="true" />
              {opcao.nome}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
