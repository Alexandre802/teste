import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { APPOINTMENT_STATUSES, STATUS_LABEL, type AppointmentStatus } from '@/types'
import { getStore } from '@/lib/db'
import { agendaRange, type AgendaView } from '@/lib/admin/queries'
import { addDays, formatDateBR, formatDateLongBR, toDateStr, todayStr, weekdayLong } from '@/lib/time'
import { EmptyState } from '@/components/ui/Feedback'
import { AppointmentItem } from '@/components/admin/AppointmentItem'
import { BlocksManager } from '@/components/admin/BlocksManager'

export const dynamic = 'force-dynamic'

const VIEWS: { id: AgendaView; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mês' },
]

function parseView(value: string | undefined): AgendaView {
  return value === 'semana' || value === 'mes' ? value : 'hoje'
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string; status?: string; service?: string }>
}) {
  const params = await searchParams
  const store = getStore()
  const settings = await store.getSettings()

  const view = parseView(params.view)
  const today = todayStr(settings.timezone)
  const anchor = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? '') ? params.date! : today
  const range = agendaRange(view, anchor, settings.timezone)

  const statusFilter = APPOINTMENT_STATUSES.includes(params.status as AppointmentStatus)
    ? (params.status as AppointmentStatus)
    : null
  const serviceFilter = params.service && params.service !== 'todos' ? params.service : null

  const [appointments, services, blocks] = await Promise.all([
    store.listAppointments({
      fromISO: range.fromISO,
      toISO: range.toISO,
      statuses: statusFilter ? [statusFilter] : undefined,
    }),
    store.listServices(true),
    store.listBlockedPeriods({ fromISO: range.fromISO, toISO: range.toISO }),
  ])

  const filtered = serviceFilter
    ? appointments.filter((appointment) => appointment.serviceId === serviceFilter)
    : appointments

  const byDay = new Map<string, typeof filtered>()
  for (const appointment of filtered) {
    const day = toDateStr(new Date(appointment.startsAt), settings.timezone)
    byDay.set(day, [...(byDay.get(day) ?? []), appointment])
  }

  const step = view === 'hoje' ? 1 : view === 'semana' ? 7 : 30
  const previousDate = addDays(anchor, -step)
  const nextDate = addDays(anchor, step)

  function href(next: Partial<{ view: string; date: string; status: string; service: string }>) {
    const query = new URLSearchParams({
      view,
      date: anchor,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(serviceFilter ? { service: serviceFilter } : {}),
      ...next,
    })
    return `/admin/agenda?${query.toString()}`
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <header className="mb-5">
        <h1 className="text-[24px] leading-tight text-display">Calendário</h1>
        <p className="mt-1 text-[13px] text-muted">
          {view === 'hoje'
            ? formatDateLongBR(anchor)
            : `${formatDateBR(range.days[0])} — ${formatDateBR(range.days[range.days.length - 1])}`}
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-[11px] border border-line p-1">
          {VIEWS.map((option) => (
            <Link
              key={option.id}
              href={href({ view: option.id, date: today })}
              aria-current={view === option.id ? 'page' : undefined}
              className={`min-h-9 rounded-[8px] px-3.5 text-[13px] leading-9 transition-colors ${
                view === option.id ? 'bg-surface-2 text-gold' : 'text-muted hover:text-ink'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href={href({ date: previousDate })}
            aria-label="Período anterior"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:border-line-strong hover:text-ink"
          >
            <ChevronLeft size={16} aria-hidden />
          </Link>
          <Link
            href={href({ date: today })}
            className="min-h-9 rounded-full border border-line px-3.5 text-[13px] leading-9 text-muted hover:border-line-strong hover:text-ink"
          >
            Hoje
          </Link>
          <Link
            href={href({ date: nextDate })}
            aria-label="Próximo período"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:border-line-strong hover:text-ink"
          >
            <ChevronRight size={16} aria-hidden />
          </Link>
        </div>
      </div>

      <form method="get" className="mb-6 flex flex-wrap gap-2">
        <input type="hidden" name="view" value={view} />
        <input type="hidden" name="date" value={anchor} />
        <label className="sr-only" htmlFor="filtro-status">
          Filtrar por status
        </label>
        <select
          id="filtro-status"
          name="status"
          defaultValue={statusFilter ?? 'todos'}
          className="min-h-10 rounded-[10px] border border-line bg-surface-2 px-3 text-[13px] text-ink"
        >
          <option value="todos">Todos os status</option>
          {APPOINTMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="filtro-servico">
          Filtrar por serviço
        </label>
        <select
          id="filtro-servico"
          name="service"
          defaultValue={serviceFilter ?? 'todos'}
          className="min-h-10 rounded-[10px] border border-line bg-surface-2 px-3 text-[13px] text-ink"
        >
          <option value="todos">Todos os serviços</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="min-h-10 rounded-[10px] border border-line px-4 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          Filtrar
        </button>
      </form>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum agendamento neste período."
          description="Ajuste os filtros ou avance para outra data."
        />
      ) : (
        <div className="grid gap-6">
          {range.days
            .filter((day) => (byDay.get(day) ?? []).length > 0)
            .map((day) => (
              <section key={day} aria-labelledby={`dia-${day}`}>
                <h2 id={`dia-${day}`} className="rule-label mb-2.5">
                  <span className="first-letter:uppercase">
                    {weekdayLong(new Date(`${day}T12:00:00Z`).getUTCDay())}
                  </span>
                  <span className="text-muted">{formatDateBR(day)}</span>
                </h2>
                <ul className="grid gap-2.5">
                  {(byDay.get(day) ?? []).map((appointment) => (
                    <AppointmentItem
                      key={appointment.id}
                      appointment={appointment}
                      timezone={settings.timezone}
                    />
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}

      <div className="mt-8">
        <BlocksManager blocks={blocks} timezone={settings.timezone} defaultDate={anchor} />
      </div>
    </div>
  )
}
