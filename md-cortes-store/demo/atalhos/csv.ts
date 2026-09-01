/**
 * Substitui `utils/csv` no build de demonstração.
 *
 * O visualizador de artefato não deixa a página entregar arquivo para quem
 * está vendo — um link de download simplesmente não faz nada. Em vez de um
 * botão que parece quebrado, a demonstração mostra o que seria baixado e
 * explica onde a exportação funciona de verdade.
 *
 * A geração do CSV em si continua sendo a do app: só a entrega muda.
 */
export { paraCsv, reais } from "../../utils/csv";

export function baixarCsv(nomeArquivo: string, conteudo: string): void {
  const linhas = conteudo.split("\r\n");
  const previa = linhas.slice(0, 6).join("\n");
  const resto = Math.max(0, linhas.length - 6);

  window.alert(
    `${nomeArquivo}\n\n` +
      `Na demonstração o arquivo não pode ser salvo — o navegador bloqueia downloads aqui dentro.\n` +
      `No app publicado, este botão baixa o arquivo direto.\n\n` +
      `Isto é o que sairia:\n\n${previa}` +
      (resto > 0 ? `\n\n… e mais ${resto} ${resto === 1 ? "linha" : "linhas"}.` : ""),
  );
}
