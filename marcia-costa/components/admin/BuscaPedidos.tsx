"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

/** Busca por número, nome ou telefone. */
export function BuscaPedidos() {
  const router = useRouter();
  const caminho = usePathname();
  const parametros = useSearchParams();
  const [texto, setTexto] = useState(parametros.get("q") ?? "");

  const buscar = (evento: React.FormEvent) => {
    evento.preventDefault();
    const busca = new URLSearchParams(parametros.toString());
    const valor = texto.trim();
    if (valor) busca.set("q", valor);
    else busca.delete("q");
    router.push(`${caminho}?${busca.toString()}`);
  };

  const limpar = () => {
    setTexto("");
    const busca = new URLSearchParams(parametros.toString());
    busca.delete("q");
    router.push(`${caminho}?${busca.toString()}`);
  };

  return (
    <form onSubmit={buscar} className="flex gap-2">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-suave"
          aria-hidden="true"
        />
        <label htmlFor="busca-pedido" className="sr-only">
          Buscar pedido
        </label>
        <input
          id="busca-pedido"
          type="search"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Buscar pedido, cliente ou telefone…"
          className="min-h-[48px] w-full rounded-carta border border-borda bg-white pl-11 pr-11 text-[15px]"
        />
        {texto && (
          <button
            type="button"
            onClick={limpar}
            aria-label="Limpar busca"
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-tinta-suave"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="min-h-[48px] shrink-0 rounded-carta bg-laranja px-5 text-[14px] font-semibold text-white"
      >
        Buscar
      </button>
    </form>
  );
}
