"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import type { Resultado } from "@/lib/admin/acoes";

type Variante = "primario" | "secundario" | "perigo" | "sucesso";

const ESTILOS: Record<Variante, string> = {
  primario: "bg-laranja text-white hover:bg-laranja-forte",
  secundario:
    "border border-borda bg-white text-tinta hover:border-laranja hover:text-laranja",
  perigo: "border border-vermelho/30 bg-vermelho/5 text-vermelho hover:bg-vermelho/10",
  sucesso: "bg-verde-positivo text-white hover:brightness-110",
};

/**
 * Botão de ação financeira.
 *
 * Enquanto a ação não responde, o botão fica travado e escrito "Salvando…".
 * É a proteção contra o clique duplo que vira dois lançamentos — o problema
 * que a gente quer nunca ver num caixa.
 */
export function BotaoAcao({
  acao,
  children,
  carregando = "Salvando…",
  variante = "primario",
  larguraTotal = false,
  aoTerminar,
  className = "",
}: {
  acao: () => Promise<Resultado>;
  children: ReactNode;
  carregando?: string;
  variante?: Variante;
  larguraTotal?: boolean;
  aoTerminar?: (resultado: Resultado) => void;
  className?: string;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const executar = async () => {
    if (ocupado) return;
    setOcupado(true);
    setErro(null);
    try {
      const resultado = await acao();
      if (!resultado.ok) setErro(resultado.erro);
      aoTerminar?.(resultado);
    } catch {
      setErro("Não foi possível concluir. Tente de novo.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <span className={larguraTotal ? "block" : "inline-block"}>
      <button
        type="button"
        onClick={executar}
        disabled={ocupado}
        className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-carta px-4 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
          ESTILOS[variante]
        } ${larguraTotal ? "w-full" : ""} ${className}`}
      >
        {ocupado && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {ocupado ? carregando : children}
      </button>
      {erro && (
        <p role="alert" className="mt-1.5 text-[12px] text-vermelho">
          {erro}
        </p>
      )}
    </span>
  );
}
