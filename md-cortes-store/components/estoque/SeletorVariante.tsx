"use client";

import { useMemo, useState } from "react";
import { PackagePlus, Plus } from "lucide-react";
import type { VariantView } from "@/types";
import { searchViews } from "@/lib/selectors";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { ProductThumb, ColorDot } from "@/components/ui/ProductThumb";

/** Lista de peças com busca, reaproveitada pela entrada e por outras telas. */
export function SeletorVariante({
  catalogo,
  onEscolher,
  titulo = "Escolha a peça",
  placeholder = "Buscar produto...",
}: {
  catalogo: VariantView[];
  onEscolher: (variantId: string) => void;
  titulo?: string;
  placeholder?: string;
}) {
  const [busca, setBusca] = useState("");
  const lista = useMemo(() => searchViews(catalogo, busca).slice(0, 30), [catalogo, busca]);

  return (
    <>
      <SearchInput value={busca} onValueChange={setBusca} placeholder={placeholder} autoFocus />
      <p className="mb-2.5 mt-5 text-[13px] font-semibold uppercase tracking-wide text-cinza">{titulo}</p>

      {catalogo.length === 0 ? (
        <EmptyState
          icon={<PackagePlus size={26} />}
          title="Nenhum produto cadastrado"
          description="Cadastre a peça antes de lançar a movimentação."
          action={
            <ButtonLink href="/produto/novo" variant="principal" size="md">
              <Plus size={18} />
              Cadastrar produto
            </ButtonLink>
          }
        />
      ) : lista.length === 0 ? (
        <EmptyState icon={<PackagePlus size={26} />} title="Nada encontrado" description="Tente outro termo." />
      ) : (
        <ul className="space-y-2.5">
          {lista.map((item) => (
            <li key={item.variant.id}>
              <button
                type="button"
                onClick={() => onEscolher(item.variant.id)}
                className="flex w-full items-center gap-3 rounded-card border border-borda bg-branco p-3 text-left shadow-card transition-colors hover:bg-areia"
              >
                <ProductThumb src={item.variant.imageUrl} alt={item.product.name} size={52} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-tinta">{item.product.name}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-cinza">
                    <ColorDot hex={item.variant.colorHex} size={12} />
                    {item.variant.colorName}
                  </span>
                </span>
                <span className="tabular shrink-0 text-[14px] text-cinza">{item.total} un.</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
