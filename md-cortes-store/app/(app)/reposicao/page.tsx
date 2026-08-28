"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, PackagePlus } from "lucide-react";
import { lowStockEntries } from "@/lib/selectors";
import { useCatalogo } from "@/hooks/useCatalogo";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductThumb, ColorDot } from "@/components/ui/ProductThumb";

/** Do mais crítico para o menos: o que precisa ser comprado primeiro. */
export default function ReposicaoPage() {
  const catalogo = useCatalogo();
  const entradas = useMemo(() => lowStockEntries(catalogo), [catalogo]);

  return (
    <>
      <PageHeader title="Precisam de reposição" />

      {entradas.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={26} className="text-verde" />}
          title="Estoque saudável"
          description="Nenhum tamanho está no limite mínimo neste momento."
        />
      ) : (
        <>
          <p className="mb-3 text-[14px] text-cinza">
            {entradas.length} {entradas.length === 1 ? "tamanho" : "tamanhos"} no limite ou abaixo do mínimo.
          </p>
          <ul className="space-y-2.5">
            {entradas.map((entrada, indice) => (
              <motion.li
                key={`${entrada.view.variant.id}-${entrada.size}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(indice * 0.03, 0.3) }}
              >
                <Link
                  href={`/entrada?variante=${entrada.view.variant.id}`}
                  className="flex items-center gap-3 rounded-card border border-borda bg-branco p-3 shadow-card transition-colors hover:bg-areia"
                >
                  <ProductThumb
                    src={entrada.view.variant.imageUrl}
                    alt={entrada.view.product.name}
                    size={54}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-tinta">
                      {entrada.view.product.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-cinza">
                      <ColorDot hex={entrada.view.variant.colorHex} size={11} />
                      {entrada.view.variant.colorName}
                      <span className="text-borda-forte">·</span>
                      Tamanho {entrada.size}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span
                      className={`tabular block text-[19px] font-bold leading-tight ${
                        entrada.quantity === 0 ? "text-vermelho" : "text-laranja"
                      }`}
                    >
                      {entrada.quantity}
                    </span>
                    <span className="block text-[11px] text-cinza">
                      {entrada.quantity === 0 ? "esgotado" : "restam"}
                    </span>
                  </span>
                  <PackagePlus size={18} className="shrink-0 text-ouro" />
                </Link>
              </motion.li>
            ))}
          </ul>
          <p className="mt-4 text-center text-[13px] text-cinza">
            Toque numa peça para lançar a entrada de estoque.
          </p>
        </>
      )}
    </>
  );
}
