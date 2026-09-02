import type { Metadata } from "next";

import { Cabecalho } from "@/components/layout/Cabecalho";
import { Passos } from "@/components/ui/Passos";
import { TelaPedido } from "@/components/checkout/TelaPedido";

export const metadata: Metadata = {
  title: "Seu pedido",
  description:
    "Confira os itens, escolha entre entrega e retirada e siga para o pagamento.",
  robots: { index: false, follow: true },
};

export default function PaginaPedido() {
  return (
    <>
      <Cabecalho voltarPara="/cardapio" mostrarSacola />
      <Passos atual={2} />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 pb-32 pt-4">
        <h1 className="sr-only">Seu pedido</h1>
        <TelaPedido />
      </main>
    </>
  );
}
