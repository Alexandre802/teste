"use client";

import { ShoppingBag } from "lucide-react";

import { LinhaPedido } from "@/components/cart/LinhaPedido";
import { Totais } from "@/components/cart/Totais";
import { EstadoVazio, EsqueletoProduto } from "@/components/ui/Estados";
import { BotaoLink } from "@/components/ui/Botao";
import {
  calcularSubtotal,
  calcularTaxa,
  calcularTotal,
  usePedido,
} from "@/lib/cart-store";
import { useHidratado } from "@/lib/use-hidratado";

/** Resumo do pedido com quantidade, remocao e totais. */
export function ResumoPedido() {
  const hidratado = useHidratado();
  const itens = usePedido((estado) => estado.items);
  const tipo = usePedido((estado) => estado.orderType);
  const endereco = usePedido((estado) => estado.address);

  const subtotal = calcularSubtotal(itens);
  const taxa = calcularTaxa(tipo, endereco);
  const total = calcularTotal(subtotal, taxa);

  // Enquanto o navegador nao devolveu o carrinho salvo, mostra esqueleto em
  // vez de piscar "pedido vazio" para quem tem itens guardados.
  if (!hidratado) {
    return (
      <div className="space-y-3">
        <EsqueletoProduto />
        <EsqueletoProduto />
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <EstadoVazio
        titulo="Seu pedido está vazio"
        descricao="Escolha suas marmitas, lanches e bebidas no cardápio para continuar."
        acao={<BotaoLink href="/cardapio">Ver cardápio</BotaoLink>}
      />
    );
  }

  return (
    <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta sm:p-5">
      <h2 className="fonte-titulo mb-1 flex items-center gap-2 text-[17px] font-bold text-tinta">
        <ShoppingBag className="h-5 w-5 text-laranja" aria-hidden="true" />
        Resumo do pedido
      </h2>

      <ul className="mb-4">
        {itens.map((item) => (
          <LinhaPedido key={item.lineId} item={item} />
        ))}
      </ul>

      <Totais subtotal={subtotal} taxa={taxa} total={total} tipo={tipo} />
    </section>
  );
}
