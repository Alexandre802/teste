"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PackagePlus } from "lucide-react";
import type { VariantView } from "@/types";
import { compareSizes } from "@/lib/constants";
import { money, pieces } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, MoneyInput, Select, Textarea } from "@/components/ui/Field";
import { Stepper } from "@/components/ui/Stepper";
import { ProductThumb, ColorDot } from "@/components/ui/ProductThumb";

/**
 * Entrada de mercadoria: quantidade por tamanho, custo e fornecedor.
 * O total em peças e em dinheiro fica visível antes de confirmar.
 */
export function FormularioEntrada({
  view,
  onTrocar,
  onPronto,
}: {
  view: VariantView;
  onTrocar: () => void;
  onPronto: () => void;
}) {
  const suppliers = useStore((s) => s.suppliers);
  const addEntry = useStore((s) => s.addEntry);
  const toast = useToast();

  const tamanhos =
    view.sizes.length > 0 ? view.sizes.map((s) => s.size) : ["P", "M", "G", "GG"];

  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [custo, setCusto] = useState(view.product.costCents);
  const [fornecedor, setFornecedor] = useState(view.product.supplierId ?? "");
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);

  const totalPecas = Object.values(quantidades).reduce((soma, q) => soma + q, 0);
  const custoTotal = totalPecas * custo;

  async function confirmar() {
    if (totalPecas === 0) return;
    setEnviando(true);
    try {
      const quantidade = await addEntry({
        variantId: view.variant.id,
        supplierId: fornecedor || null,
        unitCostCents: custo,
        note: observacao.trim() || null,
        lines: tamanhos.map((size) => ({ size, quantity: quantidades[size] ?? 0 })),
      });
      toast({
        tone: "sucesso",
        title: "Entrada registrada",
        description: `${pieces(quantidade)} somadas ao estoque.`,
      });
      onPronto();
    } catch {
      toast({ tone: "erro", title: "Não foi possível registrar a entrada" });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Card className="mb-4 flex items-center gap-3 p-3">
        <ProductThumb src={view.variant.imageUrl} alt={view.product.name} size={60} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-tinta">{view.product.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-cinza">
            <ColorDot hex={view.variant.colorHex} size={12} />
            {view.variant.colorName}
            <span className="text-borda-forte">·</span>
            <span className="tabular">{view.total} em estoque</span>
          </p>
        </div>
        <button type="button" onClick={onTrocar} className="shrink-0 text-[13px] font-medium text-ouro hover:underline">
          Trocar
        </button>
      </Card>

      <Card className="mb-4 space-y-4 p-4">
        <Field label="Fornecedor" hint="opcional">
          <Select value={fornecedor} onChange={(e) => setFornecedor(e.target.value)}>
            <option value="">Sem fornecedor</option>
            {suppliers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Custo unitário desta entrada">
          <MoneyInput valueCents={custo} onChangeCents={setCusto} />
        </Field>
        <Field label="Observação" hint="opcional">
          <Textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Nota fiscal, lote, condição de pagamento..."
          />
        </Field>
      </Card>

      <h2 className="mb-2 text-[15px] font-bold text-tinta">Distribuir por tamanho</h2>
      <Card className="mb-4">
        <ul>
          {[...tamanhos].sort(compareSizes).map((size) => {
            const atual = view.sizes.find((s) => s.size === size)?.quantity ?? 0;
            return (
              <li key={size} className="flex items-center gap-3 border-b border-borda px-4 py-3 last:border-b-0">
                <span className="w-12 text-[15px] font-bold text-tinta">{size}</span>
                <span className="tabular flex-1 text-[13px] text-cinza">tem {atual}</span>
                <Stepper
                  value={quantidades[size] ?? 0}
                  onChange={(valor) => setQuantidades((anterior) => ({ ...anterior, [size]: valor }))}
                  label={`Entrada do tamanho ${size}`}
                />
              </li>
            );
          })}
        </ul>
      </Card>

      <motion.div layout className="mb-4 rounded-card border border-borda bg-areia px-4 py-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-grafite">Total</span>
          <span className="tabular text-[17px] font-bold text-tinta">{pieces(totalPecas)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[14px] text-grafite">Custo total</span>
          <span className="tabular text-[17px] font-bold text-tinta">{money(custoTotal)}</span>
        </div>
      </motion.div>

      <Button
        variant="ouro"
        size="lg"
        full
        loading={enviando}
        disabled={totalPecas === 0}
        onClick={confirmar}
        className="uppercase tracking-wide"
      >
        {enviando ? null : <PackagePlus size={19} />}
        Confirmar entrada
      </Button>
    </>
  );
}
