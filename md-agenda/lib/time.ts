/**
 * Fuso horário do MD_agenda.
 *
 * O banco guarda instantes em UTC (timestamptz). A interface e as regras de
 * agenda trabalham no fuso da barbearia — America/Sao_Paulo por padrão. Toda
 * conversão passa por aqui; nenhum outro arquivo faz aritmética de fuso.
 */

export const DEFAULT_TIMEZONE = 'America/Sao_Paulo'

export interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  /** 0 = domingo … 6 = sábado. */
  weekday: number
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>()

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = partsFormatterCache.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    })
    partsFormatterCache.set(timeZone, formatter)
  }
  return formatter
}

/** Quebra um instante nos componentes de calendário do fuso pedido. */
export function toZonedParts(date: Date, timeZone = DEFAULT_TIMEZONE): ZonedParts {
  const parts = partsFormatter(timeZone).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '0'

  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
    weekday: WEEKDAY_INDEX[get('weekday')] ?? 0,
  }
}

/** Deslocamento do fuso, em milissegundos, no instante informado. */
function offsetMs(date: Date, timeZone: string): number {
  const parts = toZonedParts(date, timeZone)
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    date.getUTCMilliseconds(),
  )
  return asUtc - date.getTime()
}

/**
 * Converte data/hora local do fuso para o instante UTC correspondente.
 * Duas passadas resolvem a virada de horário de verão sem tabela externa.
 */
export function zonedToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone = DEFAULT_TIMEZONE,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0, 0)
  let instant = guess - offsetMs(new Date(guess), timeZone)
  instant = guess - offsetMs(new Date(instant), timeZone)
  return new Date(instant)
}

/** "2026-05-25" + "14:30" → instante UTC. */
export function dateTimeToUtc(
  dateStr: string,
  timeStr: string,
  timeZone = DEFAULT_TIMEZONE,
): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)
  return zonedToUtc(year, month, day, hour, minute, timeZone)
}

/** Instante → "YYYY-MM-DD" no fuso da barbearia. */
export function toDateStr(date: Date, timeZone = DEFAULT_TIMEZONE): string {
  const { year, month, day } = toZonedParts(date, timeZone)
  return `${year}-${pad(month)}-${pad(day)}`
}

/** Instante → "HH:MM" no fuso da barbearia. */
export function toTimeStr(date: Date, timeZone = DEFAULT_TIMEZONE): string {
  const { hour, minute } = toZonedParts(date, timeZone)
  return `${pad(hour)}:${pad(minute)}`
}

export function todayStr(timeZone = DEFAULT_TIMEZONE, now = new Date()): string {
  return toDateStr(now, timeZone)
}

/** Soma dias a uma data "YYYY-MM-DD" sem passar por fuso nenhum. */
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

/** Diferença em dias entre duas datas "YYYY-MM-DD". */
export function diffDays(from: string, to: string): number {
  return Math.round((dateStrToUtcMidnight(to) - dateStrToUtcMidnight(from)) / 86_400_000)
}

function dateStrToUtcMidnight(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** 0 = domingo … 6 = sábado, para uma data "YYYY-MM-DD". */
export function weekdayOf(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

/** "09:30" → 570. Devolve null para entrada inválida. */
export function timeToMinutes(time: string | null | undefined): number | null {
  if (!time) return null
  const match = /^(\d{1,2}):(\d{2})/.exec(time)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

/** 570 → "09:30". */
export function minutesToTime(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEKDAY_LONG = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
]
const MONTH_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]
const MONTH_LONG = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export function weekdayShort(dateStr: string): string {
  return WEEKDAY_SHORT[weekdayOf(dateStr)]
}

export function weekdayLong(weekday: number): string {
  return WEEKDAY_LONG[weekday]
}

export function monthShort(dateStr: string): string {
  return MONTH_SHORT[Number(dateStr.split('-')[1]) - 1]
}

export function dayOfMonth(dateStr: string): string {
  return dateStr.split('-')[2]
}

/** "2026-05-25" → "25/05/2026". */
export function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

/** "2026-05-25" → "25 de maio de 2026". */
export function formatDateLongBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${Number(day)} de ${MONTH_LONG[Number(month) - 1]} de ${year}`
}

/** Duração em minutos → "1h 30min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`
}
