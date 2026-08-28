"use client";

import Link from "next/link";
import { ChevronRight, TriangleAlert } from "lucide-react";
import type { LowStockEntry } from "@/lib/selectors";
import { units } from "@/lib/format";

/** Aviso de reposição: o item mais crítico na frente, resto atrás do link. */
export function AlertaEstoque({ entradas }: { entradas: LowStockEntry[] }) {
  if (entradas.length === 0) return null;
  const critico = entradas[0];
  if (!critico) return null;

  return (
    <Link
      href="/reposicao"
      className="flex items-center gap-3 rounded-card border border-[#f6dcbc] bg-laranja-suave p-4 transition-colors hover:bg-[#fbeada]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-branco text-laranja">
        <TriangleAlert size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold uppercase tracking-wide text-laranja">Estoque baixo</span>
        <span className="mt-0.5 block truncate text-[14px] text-tinta">
          {critico.view.product.name} · {critico.view.variant.colorName} · {critico.size}
        </span>
        <span className="tabular block text-[13px] text-grafite">
          {critico.quantity === 0 ? "Esgotado" : `Restam ${units(critico.quantity)}`}
          {entradas.length > 1 ? ` · mais ${entradas.length - 1} em alerta` : ""}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-laranja" />
    </Link>
  );
}
