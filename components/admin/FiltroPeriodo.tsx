"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  ROTULOS_PERIODO,
  type ChavePeriodo,
  hojeEmSaoPaulo,
} from "@/lib/admin/periodo";

/**
 * Filtro de período. Vive na URL: recarregar, compartilhar ou voltar mantém
 * exatamente o mesmo recorte que a pessoa estava olhando.
 */
export function FiltroPeriodo() {
  const router = useRouter();
  const caminho = usePathname();
  const parametros = useSearchParams();

  const atual = (parametros.get("p") ?? "hoje") as ChavePeriodo;
  const [de, setDe] = useState(parametros.get("de") ?? hojeEmSaoPaulo());
  const [ate, setAte] = useState(parametros.get("ate") ?? hojeEmSaoPaulo());

  const irPara = (chave: ChavePeriodo, inicio?: string, fim?: string) => {
    const busca = new URLSearchParams(parametros.toString());
    busca.set("p", chave);
    if (chave === "personalizado" && inicio && fim) {
      busca.set("de", inicio);
      busca.set("ate", fim);
    } else {
      busca.delete("de");
      busca.delete("ate");
    }
    router.push(`${caminho}?${busca.toString()}`);
  };

  return (
    <div className="space-y-2">
      <div
        role="group"
        aria-label="Período"
        className="rolagem-horizontal -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0"
      >
        {(Object.keys(ROTULOS_PERIODO) as (keyof typeof ROTULOS_PERIODO)[]).map(
          (chave) => (
            <button
              key={chave}
              type="button"
              onClick={() => irPara(chave)}
              aria-pressed={atual === chave}
              className={`min-h-[44px] shrink-0 rounded-carta border px-4 text-[14px] font-semibold transition-colors ${
                atual === chave
                  ? "border-laranja bg-laranja text-white"
                  : "border-borda bg-white text-tinta hover:border-laranja"
              }`}
            >
              {ROTULOS_PERIODO[chave]}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => irPara("personalizado", de, ate)}
          aria-pressed={atual === "personalizado"}
          className={`min-h-[44px] shrink-0 rounded-carta border px-4 text-[14px] font-semibold transition-colors ${
            atual === "personalizado"
              ? "border-laranja bg-laranja text-white"
              : "border-borda bg-white text-tinta hover:border-laranja"
          }`}
        >
          Personalizado
        </button>
      </div>

      {atual === "personalizado" && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[12px] font-semibold text-tinta-media">
            De
            <input
              type="date"
              value={de}
              max={ate}
              onChange={(evento) => setDe(evento.target.value)}
              className="ml-2 min-h-[44px] rounded-carta border border-borda px-3 text-[14px]"
            />
          </label>
          <label className="text-[12px] font-semibold text-tinta-media">
            Até
            <input
              type="date"
              value={ate}
              min={de}
              onChange={(evento) => setAte(evento.target.value)}
              className="ml-2 min-h-[44px] rounded-carta border border-borda px-3 text-[14px]"
            />
          </label>
          <button
            type="button"
            onClick={() => irPara("personalizado", de, ate)}
            className="min-h-[44px] rounded-carta bg-laranja px-4 text-[14px] font-semibold text-white"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
