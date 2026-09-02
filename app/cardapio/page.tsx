import type { Metadata } from "next";

import { Cabecalho } from "@/components/layout/Cabecalho";
import { Passos } from "@/components/ui/Passos";
import { Cardapio } from "@/components/menu/Cardapio";
import { BarraPedido } from "@/components/cart/BarraPedido";

export const metadata: Metadata = {
  title: "Cardápio",
  description:
    "Marmitas e bebidas da Comida Caseira da Márcia Costa. Escolha os itens e monte seu pedido.",
};

export default function PaginaCardapio() {
  return (
    <>
      <Cabecalho voltarPara="/" mostrarSacola />
      <Passos atual={1} />
      <main id="conteudo" className="pb-32">
        <h1 className="sr-only">Cardápio</h1>
        <Cardapio />
      </main>
      <BarraPedido destino="/pedido" />
    </>
  );
}
