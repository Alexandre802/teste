"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { montarCsv, type LinhaCsv } from "@/lib/admin/csv";

/**
 * Baixa a lista atual em CSV.
 *
 * O arquivo começa com BOM: sem ele, o Excel no Windows abre "Márcia" como
 * "MÃ¡rcia". É um detalhe que estraga o relatório inteiro.
 */
export function BotaoExportar({
  nome,
  linhas,
}: {
  nome: string;
  linhas: LinhaCsv[];
}) {
  const [baixando, setBaixando] = useState(false);

  const baixar = () => {
    if (baixando || linhas.length === 0) return;
    setBaixando(true);
    try {
      const conteudo = "﻿" + montarCsv(linhas);
      const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${nome}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBaixando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={baixar}
      disabled={linhas.length === 0 || baixando}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-carta border border-borda bg-white px-4 text-[13px] font-semibold text-tinta transition-colors hover:border-laranja hover:text-laranja disabled:opacity-50"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Exportar CSV
    </button>
  );
}
