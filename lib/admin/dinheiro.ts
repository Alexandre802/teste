/**
 * Dinheiro em centavos, do banco à tela.
 *
 * Nenhum valor monetário deste sistema é `float`. `0.1 + 0.2` não fecha
 * caixa, e o erro só aparece quando o total do mês não bate com a soma dos
 * dias — quando já é tarde para descobrir onde começou.
 */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

/** 5500 → "R$ 55,00". Aceita negativo (estorno) e devolve com o sinal. */
export function reais(centavos: number | null | undefined): string {
  return BRL.format((centavos ?? 0) / 100);
}

/** 5500 → "55,00", sem o símbolo. Para tabela e CSV. */
export function reaisSemSimbolo(centavos: number | null | undefined): string {
  return ((centavos ?? 0) / 100).toFixed(2).replace('.', ',');
}

/**
 * Texto digitado → centavos. Aceita "25", "25,50", "R$ 25,50" e "1.250,00",
 * porque a dona digita do jeito dela, não do jeito do sistema.
 *
 * Devolve `null` quando não dá para entender — o chamador decide se isso é
 * erro ou campo vazio.
 */
export function lerCentavos(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.-]/g, '').trim();
  if (!limpo) return null;

  // "1.250,00" → separador de milhar é o ponto; "1250.00" → é decimal
  const temVirgula = limpo.includes(',');
  const normalizado = temVirgula ? limpo.replace(/\./g, '').replace(',', '.') : limpo;

  const n = Number(normalizado);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

/** Variação percentual entre dois períodos. `null` quando não há base de comparação. */
export function variacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return null; // dividir por zero daria "+∞%" na tela
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

/** "+12%" / "−8%". Sinal explícito, menos tipográfico de verdade. */
export function variacaoTexto(pct: number | null): string | null {
  if (pct === null || !Number.isFinite(pct)) return null;
  const arredondado = Math.round(pct);
  if (arredondado === 0) return '0%';
  return arredondado > 0 ? `+${arredondado}%` : `−${Math.abs(arredondado)}%`;
}

/** Percentual de uma parte sobre o todo, protegido contra total zero. */
export function fatia(parte: number, total: number): number {
  return total === 0 ? 0 : (parte / total) * 100;
}
