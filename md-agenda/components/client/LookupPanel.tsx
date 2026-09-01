'use client'

/**
 * Consulta e cancelamento sem conta.
 *
 * Telefone sozinho não abre agenda de ninguém: é preciso também o código do
 * agendamento. Quem tem o par vê aquele horário e os próximos do mesmo
 * telefone. Quem erra recebe sempre a mesma resposta, e o servidor limita
 * tentativas — força bruta no código não compensa.
 */

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Clock, Hash, KeyRound, Phone, Scissors, Search } from 'lucide-react'
import type { AppointmentStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Alert, EmptyState } from '@/components/ui/Feedback'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useMotionSettings } from '@/components/ui/Motion'
import { formatPhoneBR, formatPriceBRL, isValidPhoneBR, normalizePhone } from '@/lib/format'
import { formatDateLongBR, formatDuration, toDateStr, toTimeStr } from '@/lib/time'

interface FoundAppointment {
  id: string
  code: string
  customerName: string
  serviceNameSnapshot: string
  servicePriceSnapshot: number
  serviceDurationSnapshot: number
  startsAt: string
  status: AppointmentStatus
  notes: string | null
  canCancel: boolean
}

export function LookupPanel({ timezone, barberName }: { timezone: string; barberName: string }) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<{ phone?: string; code?: string }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FoundAppointment[] | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const { reduced } = useMotionSettings()

  async function search(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors: { phone?: string; code?: string } = {}
    if (!isValidPhoneBR(phone)) nextErrors.phone = 'Informe um telefone válido com DDD.'
    if (code.trim().length < 4) nextErrors.code = 'Informe o código recebido no agendamento.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch('/api/agendamentos/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone), code: code.trim() }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setResult(null)
        setError(payload?.error ?? 'Não conseguimos consultar agora. Tente novamente.')
        return
      }

      setResult(payload.appointments as FoundAppointment[])
    } catch {
      setResult(null)
      setError('Não conseguimos consultar agora. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function cancel(appointment: FoundAppointment) {
    setCancelling(appointment.id)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch('/api/agendamentos/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizePhone(phone),
          code: appointment.code,
          reason: null,
        }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setError(payload?.error ?? 'Não conseguimos cancelar agora.')
        return
      }

      setNotice('Agendamento cancelado. O horário já voltou para a agenda.')
      setResult(
        (current) =>
          current?.map((item) =>
            item.id === appointment.id
              ? { ...item, status: 'cancelled' as AppointmentStatus, canCancel: false }
              : item,
          ) ?? null,
      )
    } catch {
      setError('Não conseguimos cancelar agora. Verifique sua conexão e tente novamente.')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={search} className="surface-card grid gap-4 p-4" noValidate>
        <TextField
          label="Telefone"
          placeholder="(12) 99999-9999"
          icon={<Phone size={16} aria-hidden />}
          inputMode="numeric"
          autoComplete="tel-national"
          value={phone}
          error={errors.phone}
          data-testid="consulta-telefone"
          onChange={(event) => setPhone(formatPhoneBR(event.target.value))}
        />
        <TextField
          label="Código do agendamento"
          placeholder="MD-A83F2"
          icon={<KeyRound size={16} aria-hidden />}
          autoCapitalize="characters"
          maxLength={12}
          value={code}
          error={errors.code}
          hint="Está na tela de confirmação e na mensagem do WhatsApp."
          data-testid="consulta-codigo"
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
        <Button type="submit" loading={loading} data-testid="consulta-buscar">
          <Search size={17} aria-hidden />
          Ver meu agendamento
        </Button>
      </form>

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {notice ? <Alert tone="info">{notice}</Alert> : null}

      <AnimatePresence initial={false}>
        {result ? (
          <motion.div
            key="resultado"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26 }}
            className="grid gap-3"
            data-testid="consulta-resultado"
          >
            {result.length === 0 ? (
              <EmptyState title="Nenhum agendamento encontrado com esses dados." />
            ) : (
              result.map((appointment) => (
                <article key={appointment.id} className="surface-card overflow-hidden">
                  <div className="flex items-start justify-between gap-3 border-b border-[color:var(--color-line)] px-4 py-3.5">
                    <div>
                      <p className="text-[15px] font-medium text-ink">
                        {appointment.serviceNameSnapshot}
                      </p>
                      <p className="mt-0.5 text-[13px] text-muted">{appointment.customerName}</p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>

                  <dl className="grid gap-2.5 px-4 py-3.5 text-[13px]">
                    <Row
                      icon={<CalendarDays size={14} aria-hidden />}
                      label="Data"
                      value={formatDateLongBR(toDateStr(new Date(appointment.startsAt), timezone))}
                    />
                    <Row
                      icon={<Clock size={14} aria-hidden />}
                      label="Horário"
                      value={`${toTimeStr(new Date(appointment.startsAt), timezone)} · ${formatDuration(appointment.serviceDurationSnapshot)}`}
                    />
                    <Row
                      icon={<Scissors size={14} aria-hidden />}
                      label="Valor"
                      value={formatPriceBRL(appointment.servicePriceSnapshot)}
                    />
                    <Row
                      icon={<Hash size={14} aria-hidden />}
                      label="Código"
                      value={appointment.code}
                    />
                  </dl>

                  {appointment.status === 'pending' || appointment.status === 'confirmed' ? (
                    <div className="border-t border-[color:var(--color-line)] px-4 py-3.5">
                      {appointment.canCancel ? (
                        <Button
                          variant="danger"
                          loading={cancelling === appointment.id}
                          onClick={() => cancel(appointment)}
                          data-testid="cancelar"
                        >
                          Cancelar agendamento
                        </Button>
                      ) : (
                        <p className="text-[13px] text-muted">
                          Entre em contato com {barberName} para cancelar.
                        </p>
                      )}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-gold/80">{icon}</span>
      <dt className="w-16 shrink-0 text-muted">{label}</dt>
      <dd className="flex-1 text-right text-ink">{value}</dd>
    </div>
  )
}
