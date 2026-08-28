"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { FormularioProduto } from "@/components/estoque/FormularioProduto";

export default function NovoProdutoPage() {
  return (
    <>
      <PageHeader title="Cadastrar produto" />
      <FormularioProduto />
    </>
  );
}
