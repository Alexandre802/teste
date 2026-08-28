"use client";

import { useParams } from "next/navigation";
import { Shirt } from "lucide-react";
import { useVariantView } from "@/hooks/useCatalogo";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormularioProduto } from "@/components/estoque/FormularioProduto";

export default function EditarProdutoPage() {
  const parametros = useParams<{ variantId: string }>();
  const view = useVariantView(parametros.variantId);

  return (
    <>
      <PageHeader title="Editar produto" />
      {view ? (
        <FormularioProduto base={view} />
      ) : (
        <EmptyState icon={<Shirt size={26} />} title="Produto não encontrado" />
      )}
    </>
  );
}
