import Link from 'next/link'
import { ArrowUpRight, CalendarClock } from 'lucide-react'
import { loadDashboard } from '@/lib/admin/queries'
import { supabaseAnonKey, supabaseUrl } from '@/lib/config'
import { formatDuration, formatDateBR, toDateStr, toTimeStr } from '@/lib/time'
import { firstName } from '@/lib/format'
import { EmptyState } from '@/components/ui/Feedback'
import { StoreNotice } from '@/components/ui/StoreNotice'
import { AppointmentItem } from '@/components/admin/AppointmentItem'
import { RealtimeRefresher } from '@/components/admin/RealtimeRefresher'
import { StatCards, WeekActivity } from '@/components/admin/StatCards'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await loadDashboard()
  const nextAppointment = data.nextAppointment

  return (
    <div className="mx-auto max-w-3xl py-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] leading-tight text-display">Sua agenda</h1>
          <p className="mt-1 text-[13px] text-muted">{formatDateBR(data.today)}</p>
        </div>
        <RealtimeRefresher supabaseUrl={supabaseUrl()} supabaseAnonKey={supabaseAnonKey()} />
      </header>

      <div className="grid gap-5">
        <StoreNotice />

        <StatCards counts={data.counts} />

        {nextAppointment ? (
          <div className="surface-card flex items-center gap-4 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-gold text-gold">
              <CalendarClock size={18} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] tracking-[0.14em] text-muted uppercase">Próximo cliente</p>
              <p className="mt-1 truncate text-[15px] text-ink">
                {firstName(nextAppointment.customerName)} ·{' '}
                {nextAppointment.serviceNameSnapshot}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[17px] font-medium text-gold tabular-nums">
                {toTimeStr(new Date(nextAppointment.startsAt), data.settings.timezone)}
              </p>
              <p className="text-[12px] text-muted">
                {toDateStr(new Date(nextAppointment.startsAt), data.settings.timezone) === data.today
                  ? 'hoje'
                  : formatDateBR(
                      toDateStr(new Date(nextAppointment.startsAt), data.settings.timezone),
                    )}
              </p>
            </div>
          </div>
        ) : null}

        <section aria-labelledby="agenda-hoje">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="agenda-hoje" className="rule-label flex-1">
              Agenda de hoje
            </h2>
            <Link
              href="/admin/agenda"
              className="inline-flex shrink-0 items-center gap-1 text-[13px] text-muted hover:text-ink"
            >
              Ver calendário
              <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>

          {data.todayAppointments.length === 0 ? (
            <EmptyState
              title="Nenhum agendamento para hoje."
              description="Assim que um cliente marcar, ele aparece aqui — sem precisar atualizar a página."
            />
          ) : (
            <ul className="grid gap-2.5">
              {data.todayAppointments.map((appointment) => (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                  timezone={data.settings.timezone}
                />
              ))}
            </ul>
          )}
        </section>

        <WeekActivity week={data.week} />

        <p className="text-center text-[12px] text-muted">
          Intervalo entre horários: {formatDuration(data.settings.slotIntervalMinutes)} · Antecedência
          mínima: {formatDuration(data.settings.minimumBookingNoticeMinutes)}
        </p>
      </div>
    </div>
  )
}
