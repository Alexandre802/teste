import type { ReactNode } from "react";

type Tone = "verde" | "laranja" | "vermelho" | "ouro" | "neutro" | "azul";

const TONES: Record<Tone, string> = {
  verde: "bg-verde-suave text-verde",
  laranja: "bg-laranja-suave text-laranja",
  vermelho: "bg-vermelho-suave text-vermelho",
  ouro: "bg-ouro-suave text-ouro",
  azul: "bg-azul-suave text-azul",
  neutro: "bg-areia text-cinza",
};

export function Badge({ tone = "neutro", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-pill px-2.5 py-1 text-[12px] font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  );
}

/** Etiqueta de estoque, com as mesmas três leituras em todas as telas. */
export function StockBadge({ total, minStock }: { total: number; minStock: number }) {
  if (total === 0) return <Badge tone="vermelho">Sem estoque</Badge>;
  if (total <= minStock) return <Badge tone="laranja">Estoque baixo</Badge>;
  return <Badge tone="verde">Em estoque</Badge>;
}
