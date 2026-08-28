"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { buildVariantViews } from "@/lib/selectors";
import type { VariantView } from "@/types";

/** Produto + cor + estoque, já montado. Recalcula só quando a base muda. */
export function useCatalogo(): VariantView[] {
  const products = useStore((s) => s.products);
  const variants = useStore((s) => s.variants);
  const inventory = useStore((s) => s.inventory);
  const movements = useStore((s) => s.movements);

  return useMemo(
    () => buildVariantViews({ products, variants, inventory, movements }),
    [products, variants, inventory, movements],
  );
}

export function useVariantView(variantId: string | undefined): VariantView | undefined {
  const catalogo = useCatalogo();
  return useMemo(
    () => (variantId ? catalogo.find((v) => v.variant.id === variantId) : undefined),
    [catalogo, variantId],
  );
}
