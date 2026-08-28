/**
 * Datas no fuso de quem está usando o app (America/Sao_Paulo na prática).
 * Todo intervalo é [start, end) para não contar duas vezes a virada do dia.
 */

export type RangeId = "hoje" | "7d" | "30d" | "mes" | "ano";

export const RANGES: { id: RangeId; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "mes", label: "Mês" },
  { id: "ano", label: "Ano" },
];

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function rangeFor(id: RangeId, now = new Date()): { start: Date; end: Date } {
  const end = addDays(startOfDay(now), 1);
  switch (id) {
    case "hoje":
      return { start: startOfDay(now), end };
    case "7d":
      return { start: addDays(startOfDay(now), -6), end };
    case "30d":
      return { start: addDays(startOfDay(now), -29), end };
    case "mes":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
    case "ano":
      return { start: new Date(now.getFullYear(), 0, 1), end };
  }
}

export function isWithin(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}

/** "2026-08-28" no fuso local (não usar toISOString, que converte para UTC). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

const timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const longFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export function timeOf(iso: string): string {
  return timeFmt.format(new Date(iso));
}

export function dayOf(iso: string | Date): string {
  return dayFmt.format(typeof iso === "string" ? new Date(iso) : iso);
}

export function longDate(iso: string | Date): string {
  return longFmt.format(typeof iso === "string" ? new Date(iso) : iso);
}

/** "Hoje", "Ontem" ou "12/08" — cabeçalho do histórico de vendas. */
export function dayLabel(iso: string, now = new Date()): string {
  const key = toDateKey(new Date(iso));
  if (key === toDateKey(now)) return "Hoje";
  if (key === toDateKey(addDays(now, -1))) return "Ontem";
  return longDate(iso);
}

export function daysSince(iso: string, now = new Date()): number {
  const diff = startOfDay(now).getTime() - startOfDay(new Date(iso)).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

/** "há 5 min", "há 2 h", "há 3 dias". */
export function relativeTime(iso: string, now = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  return `há ${days} ${days === 1 ? "dia" : "dias"}`;
}

/** "08:00" -> minutos desde a meia-noite. */
export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToTime(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
