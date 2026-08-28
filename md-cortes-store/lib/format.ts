/** Formatação em pt-BR. Entrada sempre em centavos. */

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function money(cents: number): string {
  return brl.format((cents ?? 0) / 100);
}

export function moneyShort(cents: number): string {
  const value = (cents ?? 0) / 100;
  if (Math.abs(value) >= 1000) return brlCompact.format(value);
  return brl.format(value);
}

/**
 * Rótulo de eixo. Sempre sem centavos: misturar "R$ 1.600" com "400,00" na
 * mesma escala faz o eixo parecer dois eixos.
 */
export function moneyAxis(cents: number): string {
  return brlCompact.format((cents ?? 0) / 100);
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export function units(n: number): string {
  return `${n} ${plural(n, "unidade", "unidades")}`;
}

export function pieces(n: number): string {
  return `${n} ${plural(n, "peça", "peças")}`;
}

/** "45,00" -> 4500. Aceita "R$ 45,00", "45.00" e "45". */
export function parseMoneyToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const value = Number(normalized);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

/** Centavos -> "45,00", para preencher campo de texto. */
export function centsToInput(cents: number): string {
  if (!cents) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function percent(value: number): string {
  return `${Math.round(value)}%`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
