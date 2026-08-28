"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { VariantView } from "@/types";
import { categoryGroup, categoryLabel } from "@/lib/constants";
import { money } from "@/lib/format";
import { ProductThumb, ColorDot } from "@/components/ui/ProductThumb";
import { StockBadge } from "@/components/ui/Badge";

const GRUPOS = { roupas: "Roupas", acessorios: "Acessórios", calcados: "Calçados" } as const;

/**
 * Cartão do estoque: foto, identificação, preços, situação e a grade de
 * tamanhos com a quantidade de cada um — a leitura que resolve na hora se dá
 * para vender.
 */
export function CardProduto({ view, indice = 0 }: { view: VariantView; indice?: number }) {
  const { product, variant, sizes, total } = view;

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(indice * 0.035, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/estoque/${variant.id}`}
        className="block rounded-card border border-borda bg-branco shadow-card transition-colors hover:bg-areia/60"
      >
        <div className="flex gap-3 p-3">
          <ProductThumb src={variant.imageUrl} alt={`${product.name} ${variant.colorName}`} size={76} />

          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[15px] font-bold leading-snug text-tinta">{product.name}</p>
            <p className="mt-0.5 truncate text-[13px] text-cinza">
              {GRUPOS[categoryGroup(product.category)]} • {categoryLabel(product.category)}
            </p>
            <p className="tabular mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
              <span className="text-cinza">Custo: {money(product.costCents)}</span>
              <span className="text-borda-forte">|</span>
              <span className="font-semibold text-verde">Venda: {money(product.priceCents)}</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <StockBadge total={total} minStock={product.minStock} />
            <span className="text-right">
              <span className="block text-[10.5px] leading-tight text-cinza">Estoque total</span>
              <span className="tabular block text-[19px] font-bold leading-tight text-tinta">{total}</span>
              <span className="block text-[10.5px] leading-tight text-cinza">unidades</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-borda px-3 py-2.5">
          <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-grafite">
            <ColorDot hex={variant.colorHex} />
            {variant.colorName}
          </span>
          <span className="rolagem-invisivel flex flex-1 gap-1.5 overflow-x-auto">
            {sizes.length === 0 ? (
              <span className="text-[13px] text-cinza-claro">sem tamanhos cadastrados</span>
            ) : (
              sizes.map((s) => (
                <span
                  key={s.size}
                  className={`tabular flex h-8 shrink-0 items-center gap-1.5 rounded-suave border px-2.5 text-[13px] ${
                    s.quantity === 0
                      ? "border-borda bg-areia text-cinza-claro"
                      : s.quantity <= product.minStock
                        ? "border-[#f6dcbc] bg-laranja-suave text-laranja"
                        : "border-borda bg-branco text-tinta"
                  }`}
                >
                  <span className="font-semibold">{s.size}</span>
                  <span>{s.quantity}</span>
                </span>
              ))
            )}
          </span>
          <ChevronRight size={17} className="shrink-0 text-cinza-claro" />
        </div>
      </Link>
    </motion.li>
  );
}
