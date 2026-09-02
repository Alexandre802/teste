"use client";

import * as Icones from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Category } from "@/types";

/**
 * Barra horizontal de categorias. Filtra sem recarregar a pagina -- o estado
 * vive no componente de cardapio.
 */
export function Categorias({
  categorias,
  ativa,
  aoTrocar,
}: {
  categorias: Category[];
  ativa: string;
  aoTrocar: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Categorias do cardápio"
      className="rolagem-horizontal -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      {categorias.map((categoria) => {
        const selecionada = categoria.id === ativa;
        const Icone = (
          categoria.icon
            ? ((Icones as unknown as Record<string, LucideIcon>)[categoria.icon] ??
              Icones.Utensils)
            : Icones.Utensils
        ) as LucideIcon;

        return (
          <button
            key={categoria.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            onClick={() => aoTrocar(categoria.id)}
            className={`inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-carta border px-4 text-[15px] font-semibold transition-colors ${
              selecionada
                ? "border-laranja bg-laranja text-white"
                : "border-borda bg-white text-tinta hover:border-laranja hover:text-laranja"
            }`}
          >
            <Icone className="h-4 w-4" aria-hidden="true" />
            {categoria.name}
          </button>
        );
      })}
    </div>
  );
}
