import type { Metadata } from "next";

import { Cabecalho } from "@/components/layout/Cabecalho";
import { TelaConfirmacao } from "@/components/checkout/TelaConfirmacao";

export const metadata: Metadata = {
  title: "Pedido enviado",
  description: "Resumo do pedido enviado para a Comida Caseira da Márcia Costa.",
  robots: { index: false, follow: false },
};

export default function PaginaConfirmacao() {
  return (
    <>
      <Cabecalho voltarPara="/" />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        <h1 className="sr-only">Pedido enviado</h1>
        <TelaConfirmacao />
      </main>
    </>
  );
}
