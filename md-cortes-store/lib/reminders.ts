/**
 * Lembrete inteligente.
 *
 * A ideia não é avisar de hora em hora, e sim avisar quando faz falta: se
 * Maicon acabou de registrar uma venda, o próximo aviso conta a partir dali.
 * O relógio reinicia a cada sinal de atividade — venda, entrada de estoque ou
 * o próprio lembrete anterior.
 *
 * Fora da faixa ativa (por padrão 08:00–22:00) nada dispara; o aviso escorrega
 * para a abertura da faixa seguinte.
 *
 * Este módulo é puro e roda igual no navegador e na rota que envia Web Push.
 */

import { timeToMinutes } from "@/lib/date";

export interface ReminderConfig {
  enabled: boolean;
  intervalMinutes: number;
  quietStart: string;
  quietEnd: string;
}

export interface ReminderActivity {
  lastSaleAt: string | null;
  lastStockUpdateAt: string | null;
  lastReminderAt: string | null;
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** A faixa pode virar a meia-noite (ex.: 20:00–06:00). */
export function isWithinActiveWindow(date: Date, quietStart: string, quietEnd: string): boolean {
  const minute = minutesOfDay(date);
  const start = timeToMinutes(quietStart);
  const end = timeToMinutes(quietEnd);
  if (start === end) return true;
  return start < end ? minute >= start && minute < end : minute >= start || minute < end;
}

function atTime(base: Date, hhmm: string): Date {
  const date = new Date(base);
  date.setHours(0, timeToMinutes(hhmm), 0, 0);
  return date;
}

/** Empurra um horário para dentro da faixa ativa. */
function shiftIntoWindow(date: Date, quietStart: string, quietEnd: string): Date {
  if (isWithinActiveWindow(date, quietStart, quietEnd)) return date;
  const todayStart = atTime(date, quietStart);
  if (todayStart > date) return todayStart;
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

function latest(...values: (string | null | undefined)[]): number {
  let max = 0;
  for (const value of values) {
    if (!value) continue;
    const time = new Date(value).getTime();
    if (Number.isFinite(time) && time > max) max = time;
  }
  return max;
}

/**
 * Quando o próximo lembrete deve aparecer. `null` quando está desligado.
 * Sem nenhuma atividade registrada, conta a partir de agora.
 */
export function nextReminderAt(
  config: ReminderConfig,
  activity: ReminderActivity,
  now = new Date(),
): Date | null {
  if (!config.enabled) return null;

  const base = latest(activity.lastSaleAt, activity.lastStockUpdateAt, activity.lastReminderAt);
  const anchor = base > 0 ? base : now.getTime();
  const candidate = new Date(anchor + config.intervalMinutes * 60_000);
  if (candidate < now) return shiftIntoWindow(now, config.quietStart, config.quietEnd);
  return shiftIntoWindow(candidate, config.quietStart, config.quietEnd);
}

export function isReminderDue(
  config: ReminderConfig,
  activity: ReminderActivity,
  now = new Date(),
): boolean {
  const next = nextReminderAt(config, activity, now);
  return next !== null && next.getTime() <= now.getTime();
}

/** Quantos milissegundos esperar antes de checar de novo (no máximo 15 min). */
export function msUntilNextCheck(
  config: ReminderConfig,
  activity: ReminderActivity,
  now = new Date(),
): number {
  const next = nextReminderAt(config, activity, now);
  if (!next) return 15 * 60_000;
  return Math.min(Math.max(next.getTime() - now.getTime(), 1_000), 15 * 60_000);
}
