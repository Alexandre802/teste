"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PackageOpen, Plus, Zap } from "lucide-react";
import type { Sale, VariantView } from "@/types";
import { money } from "@/lib/format";
import { searchViews, quickSellOrder } from "@/lib/selectors";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { ProductThumb, ColorDot } from "@/components/ui/ProductThumb";
import { FormularioVenda } from "@/components/venda/FormularioVenda";
import { VendaConfirmada } from "@/components/venda/VendaConfirmada";

export default function NovaVendaPage() {
  return (
    <Suspense fallback={null}>
      <NovaVenda />
    </Suspense>
  );
}

function NovaVenda() {
  const router = useRouter();
  const parametros = useSearchParams();
  const catalogo = useCatalogo();
  const sales = useStore((s) => s.sales);
  const saleItems = useStore((s) => s.saleItems);

  const [busca, setBusca] = useState("");
  const [escolhido, setEscolhido] = useState<string | null>(parametros.get("variante"));
  const [confirmada, setConfirmada] = useState<Sale | null>(null);

  const view = useMemo(
    () => catalogo.find((v) => v.variant.id === escolhido) ?? null,
    [catalogo, escolhido],
  );

  const coresDoProduto = useMemo(
    () => (view ? catalogo.filter((v) => v.product.id === view.product.id) : []),
    [catalogo, view],
  );

  const sugestoes = useMemo(() => {
    if (busca.trim()) return searchViews(catalogo, busca).slice(0, 20);
    return quickSellOrder(catalogo, saleItems, sales, 12);
  }, [busca, catalogo, saleItems, sales]);

  if (view) {
    return (
      <>
        <PageHeader title="Nova venda" onBack={() => setEscolhido(null)} />
        <FormularioVenda
          inicial={view}
          coresDoProduto={coresDoProduto}
          onSucesso={(venda) => setConfirmada(venda)}
        />
        <VendaConfirmada
          venda={confirmada}
          onNovaVenda={() => {
            setConfirmada(null);
            setEscolhido(null);
            setBusca("");
          }}
          onFechar={() => {
            setConfirmada(null);
            router.push("/");
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Nova venda" onBack={() => router.push("/")} />
      <SearchInput value={busca} onValueChange={setBusca} placeholder="Buscar produto..." autoFocus />

      <p className="mt-5 mb-2.5 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-cinza">
        {busca.trim() ? "Resultados" : (<><Zap size={14} className="text-ouro" /> Vendidos recentemente</>)}
      </p>

      {sugestoes.length === 0 ? (
        <EmptyState
          icon={<PackageOpen size={26} />}
          title={busca.trim() ? "Nenhum produto encontrado" : "Nenhuma peça em estoque"}
          description={
            busca.trim()
              ? "Confira o nome, a cor ou o SKU."
              : "Cadastre um produto e informe o estoque inicial para começar a vender."
          }
          action={
            busca.trim() ? undefined : (
              <ButtonLink href="/produto/novo" variant="principal" size="md">
                <Plus size={18} />
                Cadastrar produto
              </ButtonLink>
            )
          }
        />
      ) : (
        <ul className="space-y-2.5">
          {sugestoes.map((item, indice) => (
            <ItemSugestao key={item.variant.id} view={item} indice={indice} onEscolher={setEscolhido} />
          ))}
        </ul>
      )}
    </>
  );
}

function ItemSugestao({
  view,
  indice,
  onEscolher,
}: {
  view: VariantView;
  indice: number;
  onEscolher: (id: string) => void;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(indice * 0.03, 0.25) }}
    >
      <button
        type="button"
        onClick={() => onEscolher(view.variant.id)}
        disabled={view.total === 0}
        className="flex w-full items-center gap-3 rounded-card border border-borda bg-branco p-3 text-left shadow-card transition-colors hover:bg-areia disabled:opacity-45"
      >
        <ProductThumb src={view.variant.imageUrl} alt={view.product.name} size={56} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-tinta">{view.product.name}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-cinza">
            <ColorDot hex={view.variant.colorHex} size={12} />
            {view.variant.colorName}
            <span className="text-borda-forte">·</span>
            <span className="tabular">{view.total} un.</span>
          </span>
        </span>
        <span className="tabular shrink-0 text-[15px] font-bold text-tinta">{money(view.product.priceCents)}</span>
      </button>
    </motion.li>
  );
}
