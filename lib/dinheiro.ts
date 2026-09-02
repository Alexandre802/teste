/**
 * Dinheiro em centavos.
 *
 * Todo valor financeiro do sistema trafega e e guardado como inteiro de
 * centavos. R$ 25,00 e 2500. Float nao entra nessa conta: 0.1 + 0.2 nao da
 * 0.3 em ponto flutuante, e num caixa isso vira diferenca de verdade.
 */

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarCentavos(centavos: number): string {
  return moeda.format(centavos / 100);
}

/** Converte reais (do cardapio, que usa number) para centavos. */
export function paraCentavos(reais: number): number {
  return Math.round(reais * 100);
}

/** Le o que a pessoa digitou ("R$ 12,50", "12,50", "12.5") em centavos. */
export function lerCentavos(texto: string): number | null {
  const limpo = texto
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}\b)/g, "")
    .replace(",", ".");
  if (!limpo) return null;
  const numero = Number(limpo);
  if (!Number.isFinite(numero)) return null;
  return Math.round(numero * 100);
}

/** Máscara de digitação: o que a pessoa digita vira R$ enquanto ela escreve. */
export function mascaraCentavos(texto: string): string {
  const digitos = texto.replace(/\D/g, "").slice(0, 11);
  if (!digitos) return "";
  return moeda.format(Number(digitos) / 100);
}

/** Percentual de variação entre dois períodos. null quando não dá para comparar. */
export function variacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual === 0 ? 0 : null;
  return Math.round(((atual - anterior) / Math.abs(anterior)) * 100);
}

/** Formata a variação com sinal, do jeito que aparece no card. */
export function formatarVariacao(porcentagem: number | null): string | null {
  if (porcentagem === null) return null;
  const sinal = porcentagem > 0 ? "+" : "";
  return `${sinal}${porcentagem}%`;
}
