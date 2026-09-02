"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";

import { calcularSubtotal, contarItens, usePedido } from "@/lib/cart-store";
import { useHidratado } from "@/lib/use-hidratado";
import { formatarPreco } from "@/lib/format";

/**
 * Barra fixa no rodape com o resumo do carrinho. Some quando o pedido esta
 * vazio e some tambem nas telas que ja mostram o resumo inteiro.
 */
export function BarraPedido({ destino = "/pedido" }: { destino?: string }) {
  const itens = usePedido((estado) => estado.items);
  const hidratado = useHidratado();

  const quantidade = contarItens(itens);
  const subtotal = calcularSubtotal(itens);
  const visivel = hidratado && quantidade > 0;

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-white/97 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-flutuante backdrop-blur"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="relative shrink-0">
              <ShoppingCart
                className="h-8 w-8 text-laranja"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-laranja px-1 text-[11px] font-bold text-white">
                {quantidade}
              </span>
            </div>

            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[12px] text-tinta-media">
                {quantidade} {quantidade === 1 ? "item" : "itens"} · subtotal
              </p>
              <p className="text-[17px] font-extrabold text-laranja">
                {formatarPreco(subtotal)}
              </p>
            </div>

            <Link
              href={destino}
              className="inline-flex min-h-[52px] shrink-0 items-center gap-2 rounded-carta bg-laranja px-4 text-[14px] font-semibold text-white shadow-carta transition-colors hover:bg-laranja-forte sm:px-5 sm:text-[15px]"
            >
              Continuar pedido
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
