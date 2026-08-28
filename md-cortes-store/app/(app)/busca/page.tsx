"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { searchViews } from "@/lib/selectors";
import { useCatalogo } from "@/hooks/useCatalogo";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardProduto } from "@/components/estoque/CardProduto";

/** Busca por produto, cor, tamanho, categoria ou SKU. */
export default function BuscaPage() {
  const catalogo = useCatalogo();
  const [termo, setTermo] = useState("");

  const resultados = useMemo(
    () => (termo.trim() ? searchViews(catalogo, termo) : []),
    [catalogo, termo],
  );

  return (
    <>
      <PageHeader title="Busca" />
      <SearchInput
        value={termo}
        onValueChange={setTermo}
        placeholder="Produto, cor, tamanho ou SKU..."
        autoFocus
      />

      {!termo.trim() ? (
        <EmptyState
          icon={<Search size={26} />}
          title="O que você procura?"
          description="Digite o nome da peça, a cor, o tamanho ou o código."
        />
      ) : resultados.length === 0 ? (
        <EmptyState icon={<Search size={26} />} title="Nada encontrado" description={`Nenhum resultado para "${termo}".`} />
      ) : (
        <>
          <p className="tabular mb-3 mt-5 text-[13px] text-cinza">
            {resultados.length} {resultados.length === 1 ? "resultado" : "resultados"}
          </p>
          <ul className="space-y-3">
            {resultados.map((view, indice) => (
              <CardProduto key={view.variant.id} view={view} indice={indice} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
