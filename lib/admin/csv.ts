/**
 * Exportação em CSV que o Excel brasileiro abre sem reclamar.
 *
 * Três detalhes que decidem se o arquivo abre certo ou vira uma coluna só:
 *
 *  1. separador `;` — no Excel em português a vírgula é decimal, e com `,`
 *     como separador tudo cai numa coluna;
 *  2. BOM no começo — sem ele "Manutenção" abre como "ManutenÃ§Ã£o";
 *  3. valores com vírgula decimal, para a célula ser número e não texto.
 */

/** Escapa um campo: aspas dobradas quando há `;`, aspas ou quebra de linha. */
function campo(valor: unknown): string {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  return /[;"\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function paraCsv(cabecalho: string[], linhas: unknown[][]): string {
  const corpo = [cabecalho, ...linhas].map((l) => l.map(campo).join(';')).join('\r\n');
  return `﻿${corpo}`;
}

/**
 * Dispara o download no navegador.
 *
 * Revoga a URL depois: object URL que fica pendurado segura o arquivo inteiro
 * na memória da aba até o recarregamento.
 */
export function baixarCsv(nomeArquivo: string, conteudo: string): void {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo.endsWith('.csv') ? nomeArquivo : `${nomeArquivo}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
