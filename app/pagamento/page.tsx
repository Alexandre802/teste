import type { Metadata } from "next";

import { Cabecalho } from "@/components/layout/Cabecalho";
import { Passos } from "@/components/ui/Passos";
import { TelaPagamento } from "@/components/checkout/TelaPagamento";

export const metadata: Metadata = {
  title: "Pagamento",
  description:
    "Escolha a forma de pagamento, confirme o endereço e envie o pedido pelo WhatsApp.",
  robots: { index: false, follow: true },
};

export default function PaginaPagamento() {
  return (
    <>
      <Cabecalho voltarPara="/pedido" mostrarSacola />
      <Passos atual={3} />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 pb-10 pt-4">
        <h1 className="sr-only">Pagamento e envio do pedido</h1>
        <TelaPagamento />
      </main>
    </>
  );
}
