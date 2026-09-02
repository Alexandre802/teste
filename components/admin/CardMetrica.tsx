import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { formatarCentavos, formatarVariacao } from "@/lib/dinheiro";

type Tom = "neutro" | "positivo" | "negativo" | "info";

const TONS: Record<Tom, string> = {
  neutro: "text-tinta",
  positivo: "text-verde-positivo",
  negativo: "text-vermelho",
  info: "text-azul-info",
};

const FUNDOS: Record<Tom, string> = {
  neutro: "bg-creme text-laranja",
  positivo: "bg-verde-claro text-verde-positivo",
  negativo: "bg-vermelho-claro text-vermelho",
  info: "bg-azul-claro text-azul-info",
};

/**
 * Card de número do painel.
 *
 * A `formula` existe de propósito: "lucro líquido" quer dizer coisas
 * diferentes em lugares diferentes, e a dona precisa saber exatamente qual
 * conta gerou o número que está olhando.
 */
export function CardMetrica({
  titulo,
  centavos,
  quantidade,
  formula,
  icone: Icone,
  tom = "neutro",
  variacaoPorcento,
}: {
  titulo: string;
  centavos?: number;
  quantidade?: number;
  formula?: string;
  icone: LucideIcon;
  tom?: Tom;
  variacaoPorcento?: number | null;
}) {
  const variacao = formatarVariacao(variacaoPorcento ?? null);
  const subiu = (variacaoPorcento ?? 0) > 0;
  const desceu = (variacaoPorcento ?? 0) < 0;

  return (
    <div className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-bold uppercase tracking-wide text-tinta-suave">
          {titulo}
        </p>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${FUNDOS[tom]}`}
        >
          <Icone className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <p className={`mt-2 text-[22px] font-extrabold leading-tight ${TONS[tom]}`}>
        {centavos !== undefined
          ? formatarCentavos(centavos)
          : (quantidade ?? 0).toLocaleString("pt-BR")}
      </p>

      {variacao && (
        <p
          className={`mt-1 inline-flex items-center gap-1 text-[12px] font-semibold ${
            subiu
              ? "text-verde-positivo"
              : desceu
                ? "text-vermelho"
                : "text-tinta-suave"
          }`}
        >
          {subiu && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
          {desceu && <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
          {variacao} vs. período anterior
        </p>
      )}

      {formula && (
        <p className="mt-1 text-[11px] leading-snug text-tinta-suave">{formula}</p>
      )}
    </div>
  );
}
