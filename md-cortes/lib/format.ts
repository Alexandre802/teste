const moedaFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

/** 'R$ 420,00' */
export function moeda(valor: number): string {
  return moedaFmt.format(Number.isFinite(valor) ? valor : 0);
}

/** '420,00' — sem o símbolo, para dentro de campos e eixos. */
export function moedaCurta(valor: number): string {
  if (Math.abs(valor) >= 1000) {
    return `${(valor / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
  }
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

/**
 * Lê o que o funcionário digitou no campo de valor. Aceita '50', '50,00',
 * 'R$ 50,00' e '1.250,50' — o teclado do celular e a pressa produzem os três.
 * Devolve null quando não dá para entender.
 */
export function lerValor(bruto: string): number | null {
  const limpo = bruto.replace(/[^\d,.-]/g, '').trim();
  if (!limpo) return null;
  // Se tem vírgula, ela é o separador decimal e o ponto é milhar.
  const normalizado = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo;
  const n = Number(normalizado);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export function plural(n: number, singular: string, pluralForma: string): string {
  return n === 1 ? singular : pluralForma;
}
