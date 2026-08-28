"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { Sale, VariantView } from "@/types";
import { money } from "@/lib/format";
import { Sheet } from "@/components/ui/Sheet";
import { ProductThumb, ColorDot } from "@/components/ui/ProductThumb";
import { FormularioVenda } from "@/components/venda/FormularioVenda";
import { VendaConfirmada } from "@/components/venda/VendaConfirmada";
import { useCatalogo } from "@/hooks/useCatalogo";

/**
 * Atalho de venda em dois toques: escolhe a peça que mais sai e confirma.
 * Cor, tamanho e pagamento já vêm preenchidos quando só há uma opção.
 */
export function VendiAgora({ sugestoes }: { sugestoes: VariantView[] }) {
  const catalogo = useCatalogo();
  const [aberto, setAberto] = useState<VariantView | null>(null);
  const [confirmada, setConfirmada] = useState<Sale | null>(null);

  if (sugestoes.length === 0) return null;

  const cores = aberto ? catalogo.filter((v) => v.product.id === aberto.product.id) : [];

  return (
    <section>
      <h2 className="mb-2.5 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-cinza">
        <Zap size={14} className="text-ouro" />
        Vendi agora
      </h2>
      <div className="rolagem-invisivel -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {sugestoes.map((view, indice) => (
          <motion.button
            key={view.variant.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: Math.min(indice * 0.04, 0.24) }}
            onClick={() => setAberto(view)}
            className="w-[150px] shrink-0 rounded-card border border-borda bg-branco p-3 text-left shadow-card transition-colors hover:bg-areia"
          >
            <ProductThumb src={view.variant.imageUrl} alt={view.product.name} size={124} rounded="rounded-suave" />
            <span className="mt-2.5 block truncate text-[14px] font-semibold text-tinta">{view.product.name}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-cinza">
              <ColorDot hex={view.variant.colorHex} size={11} />
              <span className="truncate">{view.variant.colorName}</span>
            </span>
            <span className="tabular mt-1 block text-[14px] font-bold text-ouro">
              {money(view.product.priceCents)}
            </span>
          </motion.button>
        ))}
      </div>

      <Sheet open={Boolean(aberto) && !confirmada} onClose={() => setAberto(null)} title="Venda rápida">
        {aberto ? (
          <div className="pb-5">
            <FormularioVenda inicial={aberto} coresDoProduto={cores} onSucesso={setConfirmada} />
          </div>
        ) : null}
      </Sheet>

      <VendaConfirmada
        venda={confirmada}
        onNovaVenda={() => {
          setConfirmada(null);
          setAberto(null);
        }}
        onFechar={() => {
          setConfirmada(null);
          setAberto(null);
        }}
      />
    </section>
  );
}
