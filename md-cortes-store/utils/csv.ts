/**
 * Exportação em CSV.
 *
 * Separador ponto e vírgula e BOM UTF-8: é o que o Excel em português abre
 * direto, sem tela de importação e sem acento quebrado. O valor sai em reais
 * com vírgula decimal pelo mesmo motivo.
 */

function escapar(valor: string | number | null | undefined): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function paraCsv(cabecalho: string[], linhas: (string | number | null)[][]): string {
  return [cabecalho, ...linhas].map((linha) => linha.map(escapar).join(";")).join("\r\n");
}

/** Centavos -> "45,00" (sem símbolo, para a planilha somar). */
export function reais(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function baixarCsv(nomeArquivo: string, conteudo: string): void {
  const blob = new Blob([`﻿${conteudo}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
