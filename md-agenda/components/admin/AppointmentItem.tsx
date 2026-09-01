'use client'

/**
 * Linha da agenda com o detalhe embutido.
 *
 * Abrir mostra tudo que o barbeiro precisa — cliente, telefone, observação,
 * quando foi criado — e as ações. Cada ação é um formulário de Server Action:
 * a mudança passa pelo servidor, com sessão conferida, e a agenda revalida.
 */

import { useActionState, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarRange, ChevronDown, MessageSquare, Phone } from 'lucide-react'
import type { Appointment } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Alert } from '@/components/ui/Feedback'
import { useMotionSettings } from '@/components/ui/Motion'
import { formatPhoneBR, formatPriceBRL, toInternationalPhone } from '@/lib/format'
import { formatDateBR, formatDuration, toDateStr, toTimeStr } from '@/lib/time'
import { rescheduleAction, setStatusAction, type ActionState } from '@/app/admin/actions'

const NEXT_STATUSES = [
  { status: 'confirmed', label: 'Confirmar' },
  { status: 'completed', label: 'Concluir' },
  { status: 'no_show', label: 'Não compareceu' },
  { status: 'cancelled', label: 'Cancelar' },
] as const

export function AppointmentItem({
  appointment,
  timezone,
  defaultOpen = false,
}: {
  appointment: Appointment
  timezone: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [statusState, statusAction, statusPending] = useActionState<ActionState, FormData>(
    setStatusAction,
    {},
  )
  const [rescheduleState, doReschedule, reschedulePending] = useActionState<ActionState, FormData>(
    rescheduleAction,
    {},
  )
  const { reduced } = useMotionSettings()

  const date = toDateStr(new Date(appointment.startsAt), timezone)
  const time = toTimeStr(new Date(appointment.startsAt), timezone)

  return (
    <li className="surface-card overflow-hidden" data-testid="agendamento" data-code={appointment.code}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
      >
        <span className="w-12 shrink-0 text-[15px] font-medium text-gold tabular-nums">{time}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] text-ink">{appointment.customerName}</span>
          <span className="block truncate text-[13px] text-muted">
            {appointment.serviceNameSnapshot} · {formatDuration(appointment.serviceDurationSnapshot)}
          </span>
        </span>
        <StatusBadge status={appointment.status} />
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden border-t border-[color:var(--color-line)]"
          >
            <div className="grid gap-4 px-4 py-4">
              <dl className="grid gap-2 text-[13px]">
                <Row label="Telefone">
                  <a
                    href={`https://wa.me/${toInternationalPhone(appointment.customerPhone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-gold underline-offset-4 hover:underline"
                  >
                    <Phone size={13} aria-hidden />
                    {formatPhoneBR(appointment.customerPhone)}
                  </a>
                </Row>
                <Row label="Data">{formatDateBR(date)}</Row>
                <Row label="Valor">{formatPriceBRL(appointment.servicePriceSnapshot)}</Row>
                <Row label="Código">{appointment.code}</Row>
                <Row label="Criado em">
                  {formatDateBR(toDateStr(new Date(appointment.createdAt), timezone))} às{' '}
                  {toTimeStr(new Date(appointment.createdAt), timezone)}
                </Row>
                {appointment.cancelReason ? (
                  <Row label="Motivo">{appointment.cancelReason}</Row>
                ) : null}
              </dl>

              {appointment.notes ? (
                <p className="flex gap-2 rounded-[10px] border border-line bg-surface-2 px-3 py-2.5 text-[13px] text-muted">
                  <MessageSquare size={14} className="mt-0.5 shrink-0 text-gold/70" aria-hidden />
                  {appointment.notes}
                </p>
              ) : null}

              <div className="grid gap-2">
                <p className="rule-label">Ações</p>
                <div className="flex flex-wrap gap-2">
                  {NEXT_STATUSES.filter((option) => option.status !== appointment.status).map(
                    (option) => (
                      <form key={option.status} action={statusAction}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <input type="hidden" name="status" value={option.status} />
                        <button
                          type="submit"
                          disabled={statusPending}
                          data-testid={`acao-${option.status}`}
                          className={`min-h-10 rounded-[10px] border px-3.5 text-[13px] transition-colors duration-150 disabled:opacity-50 ${
                            option.status === 'cancelled' || option.status === 'no_show'
                              ? 'border-danger/40 text-danger hover:bg-danger/10'
                              : 'border-line-gold text-gold hover:bg-gold/8'
                          }`}
                        >
                          {option.label}
                        </button>
                      </form>
                    ),
                  )}
                </div>
                {statusState.error ? <Alert tone="danger">{statusState.error}</Alert> : null}
              </div>

              <form action={doReschedule} className="grid gap-2">
                <p className="rule-label">
                  <CalendarRange size={13} aria-hidden />
                  Reagendar
                </p>
                <input type="hidden" name="id" value={appointment.id} />
                <div className="flex flex-wrap gap-2">
                  <input
                    type="date"
                    name="date"
                    defaultValue={date}
                    required
                    aria-label="Nova data"
                    className="min-h-10 flex-1 rounded-[10px] border border-line bg-surface-2 px-3 text-[14px] text-ink"
                  />
                  <input
                    type="time"
                    name="time"
                    defaultValue={time}
                    required
                    step={300}
                    aria-label="Novo horário"
                    className="min-h-10 rounded-[10px] border border-line bg-surface-2 px-3 text-[14px] text-ink"
                  />
                  <button
                    type="submit"
                    disabled={reschedulePending}
                    data-testid="acao-reagendar"
                    className="min-h-10 rounded-[10px] border border-line-gold px-3.5 text-[13px] text-gold transition-colors hover:bg-gold/8 disabled:opacity-50"
                  >
                    Salvar
                  </button>
                </div>
                {rescheduleState.error ? <Alert tone="danger">{rescheduleState.error}</Alert> : null}
                {rescheduleState.ok ? <Alert tone="info">{rescheduleState.message}</Alert> : null}
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="w-20 shrink-0 text-muted">{label}</dt>
      <dd className="flex-1 text-ink">{children}</dd>
    </div>
  )
}
