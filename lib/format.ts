/** Formatacao de dinheiro e telefone, em pt-BR. */

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarPreco(valor: number): string {
  return moeda.format(valor);
}

/** Le "R$ 100,00", "100,00" ou "100" e devolve o numero. null se nao der. */
export function lerValor(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  if (!limpo) return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

/** Formata o que o cliente digita no campo de troco, enquanto digita. */
export function mascaraDinheiro(texto: string): string {
  const digitos = texto.replace(/\D/g, "").slice(0, 9);
  if (!digitos) return "";
  const valor = Number(digitos) / 100;
  return moeda.format(valor);
}

export function mascaraCep(texto: string): string {
  const digitos = texto.replace(/\D/g, "").slice(0, 8);
  if (digitos.length <= 5) return digitos;
  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

export function mascaraTelefone(texto: string): string {
  const digitos = texto.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}
