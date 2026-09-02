"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Menu, MessageCircle, ShoppingBag } from "lucide-react";

import { Marca } from "@/components/layout/Marca";
import { MenuLateral } from "@/components/layout/MenuLateral";
import { usePedido, contarItens } from "@/lib/cart-store";
import { useHidratado } from "@/lib/use-hidratado";
import { linkConversa } from "@/lib/whatsapp";

/**
 * Cabecalho fixo. Nas telas do pedido mostra voltar + sacola, como nas
 * referencias; na home mostra WhatsApp + menu.
 */
export function Cabecalho({
  voltarPara,
  mostrarSacola = false,
}: {
  voltarPara?: string;
  mostrarSacola?: boolean;
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const itens = usePedido((estado) => estado.items);
  const hidratado = useHidratado();
  const quantidade = hidratado ? contarItens(itens) : 0;
  const conversa = linkConversa();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-borda bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          {voltarPara ? (
            <Link
              href={voltarPara}
              aria-label="Voltar"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-laranja transition-colors hover:bg-creme"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          ) : null}

          <div className="min-w-0 flex-1">
            <Marca compacta={Boolean(voltarPara)} />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {mostrarSacola ? (
              <Link
                href="/pedido"
                aria-label={
                  quantidade > 0
                    ? `Ver pedido, ${quantidade} ${quantidade === 1 ? "item" : "itens"}`
                    : "Ver pedido"
                }
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-laranja transition-colors hover:bg-creme"
              >
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
                {quantidade > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-laranja px-1 text-[11px] font-bold text-white">
                    {quantidade}
                  </span>
                )}
              </Link>
            ) : (
              conversa && (
                <a
                  href={conversa}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Falar no WhatsApp"
                  className="flex h-11 w-11 items-center justify-center rounded-carta bg-laranja text-white transition-colors hover:bg-laranja-forte"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                </a>
              )
            )}

            <button
              type="button"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              className="flex h-11 w-11 items-center justify-center rounded-carta bg-creme text-laranja transition-colors hover:bg-creme-forte"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MenuLateral aberto={menuAberto} aoFechar={() => setMenuAberto(false)} />
    </>
  );
}
