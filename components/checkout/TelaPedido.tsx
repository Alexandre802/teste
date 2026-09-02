"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { ResumoPedido } from "@/components/cart/ResumoPedido";
import { TipoPedido } from "@/components/checkout/TipoPedido";
import { EstadoErro } from "@/components/ui/Estados";
import { usePedido } from "@/lib/cart-store";
import { useHidratado } from "@/lib/use-hidratado";
import { useState } from "react";

/** Etapa 2: conferir os itens e escolher entrega ou retirada. */
export function TelaPedido() {
  const hidratado = useHidratado();
  const itens = usePedido((estado) => estado.items);
  const tipo = usePedido((estado) => estado.orderType);
  const definirTipo = usePedido((estado) => estado.definirTipo);
  const [erro, setErro] = useState<string | null>(null);

  const temItens = hidratado && itens.length > 0;

  return (
    <div className="space-y-5">
      <ResumoPedido />

      {temItens && (
        <>
          <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta sm:p-5">
            <TipoPedido
              valor={tipo}
              aoEscolher={(escolha) => {
                setErro(null);
                definirTipo(escolha);
              }}
            />
          </section>

          {erro && <EstadoErro mensagem={erro} />}

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            {tipo ? (
              <Link
                href="/pagamento"
                className="inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-carta bg-laranja px-6 text-base font-semibold text-white shadow-carta transition-colors hover:bg-laranja-forte"
              >
                Ir para o pagamento
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setErro("Escolha entre entrega e retirada para continuar.")}
                className="inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-carta bg-laranja px-6 text-base font-semibold text-white shadow-carta transition-colors hover:bg-laranja-forte"
              >
                Ir para o pagamento
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <Link
              href="/cardapio"
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-carta border border-borda bg-white px-6 text-base font-semibold text-tinta transition-colors hover:border-laranja hover:text-laranja"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              Adicionar mais itens
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
