'use client'

import { CalendarDays, Clock, MessageSquare, Phone, Scissors, Tag, UserRound } from 'lucide-react'
import type { Service } from '@/types'
import { formatPhoneBR, formatPriceBRL } from '@/lib/format'
import { formatDateLongBR, formatDuration } from '@/lib/time'

/** Última conferência antes de confirmar: tudo que vai ser enviado ao Maicon. */
export function Summary({
  service,
  date,
  time,
  name,
  phone,
  notes,
}: {
  service: Service
  date: string
  time: string
  name: string
  phone: string
  notes: string
}) {
  const rows: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <Scissors size={15} aria-hidden />, label: 'Serviço', value: service.name },
    { icon: <CalendarDays size={15} aria-hidden />, label: 'Data', value: formatDateLongBR(date) },
    { icon: <Clock size={15} aria-hidden />, label: 'Horário', value: time },
    {
      icon: <Clock size={15} aria-hidden />,
      label: 'Duração',
      value: formatDuration(service.durationMinutes),
    },
    {
      icon: <Tag size={15} aria-hidden />,
      label: 'Valor',
      value: formatPriceBRL(service.priceCents),
    },
    { icon: <UserRound size={15} aria-hidden />, label: 'Cliente', value: name },
    { icon: <Phone size={15} aria-hidden />, label: 'Telefone', value: formatPhoneBR(phone) },
  ]

  if (notes.trim().length > 0) {
    rows.push({
      icon: <MessageSquare size={15} aria-hidden />,
      label: 'Observação',
      value: notes.trim(),
    })
  }

  return (
    <div className="surface-card overflow-hidden" data-testid="resumo">
      <dl className="divide-y divide-[color:var(--color-line)]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3 px-4 py-3">
            <span className="mt-0.5 text-gold/80">{row.icon}</span>
            <dt className="w-24 shrink-0 text-[13px] text-muted">{row.label}</dt>
            <dd className="flex-1 text-right text-[14px] text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
