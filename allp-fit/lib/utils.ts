/** Junta classes ignorando falsos — evita uma dependência só para isso. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Formata número no padrão brasileiro (4.7 → "4,7"). */
export function numeroBR(valor: number, decimais = 0): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  });
}

/** Formata preço em reais; null vira o texto de "consulte". */
export function precoBR(valor: number | null, fallback: string): string {
  if (valor === null) return fallback;
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}
