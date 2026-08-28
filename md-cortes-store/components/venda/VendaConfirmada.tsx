"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Sale } from "@/types";
import { money } from "@/lib/format";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";

/** Confirmação da venda: valor, aviso do estoque e o caminho para a próxima. */
export function VendaConfirmada({
  venda,
  onNovaVenda,
  onFechar,
}: {
  venda: Sale | null;
  onNovaVenda: () => void;
  onFechar: () => void;
}) {
  return (
    <Sheet open={Boolean(venda)} onClose={onFechar} title="Venda registrada">
      <div className="pb-6 text-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 20 }}
          className="mx-auto mb-5 mt-2 flex size-16 items-center justify-center rounded-full bg-verde-suave text-verde"
        >
          <Check size={32} strokeWidth={3} />
        </motion.span>

        <p className="text-[15px] font-semibold text-verde">Venda registrada ✓</p>
        <p className="tabular mt-1 text-[34px] font-bold leading-tight text-tinta">
          {money(venda?.totalCents ?? 0)}
        </p>
        <p className="mt-2 text-[14px] text-cinza">Estoque atualizado automaticamente.</p>

        <div className="mt-7 grid gap-2.5">
          <Button variant="principal" size="lg" full onClick={onNovaVenda}>
            Registrar outra venda
          </Button>
          <Button variant="suave" size="md" full onClick={onFechar}>
            Voltar ao início
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
