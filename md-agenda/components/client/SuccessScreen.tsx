'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  CalendarPlus,
  Check,
  Clock,
  Hash,
  Scissors,
  Send,
  Tag,
  UserRound,
} from 'lucide-react'
import type { AppointmentStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatPriceBRL } from '@/lib/format'
import { formatDateLongBR, formatDuration } from '@/lib/time'
import { useMotionSettings } from '@/components/ui/Motion'

export interface BookingConfirmation {
  code: string
  customerName: string
  serviceName: string
  priceCents: number
  durationMinutes: number
  date: string
  time: string
  status: AppointmentStatus
  whatsappUrl: string | null
  /** Só é verdadeiro quando a Cloud API confirmou a entrega. */
  whatsappSent: boolean
  barberName: string
}

export function SuccessScreen({
  confirmation,
  onNewBooking,
}: {
  confirmation: BookingConfirmation
  onNewBooking: () => void
}) {
  const { reduced } = useMotionSettings()
  const confirmed = confirmation.status === 'confirmed'

  const rows = [
    { icon: <UserRound size={15} aria-hidden />, label: 'Cliente', value: confirmation.customerName },
    { icon: <Scissors size={15} aria-hidden />, label: 'Serviço', value: confirmation.serviceName },
    {
      icon: <CalendarDays size={15} aria-hidden />,
      label: 'Data',
      value: formatDateLongBR(confirmation.date),
    },
    { icon: <Clock size={15} aria-hidden />, label: 'Horário', value: confirmation.time },
    {
      icon: <Clock size={15} aria-hidden />,
      label: 'Duração',
      value: formatDuration(confirmation.durationMinutes),
    },
    {
      icon: <Tag size={15} aria-hidden />,
      label: 'Valor',
      value: formatPriceBRL(confirmation.priceCents),
    },
  ]

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
      aria-live="polite"
      data-testid="sucesso"
      className="pt-2"
    >
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={reduced ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative grid h-20 w-20 place-items-center rounded-full border border-line-gold bg-surface"
        >
          <motion.span
            aria-hidden
            initial={reduced ? false : { scale: 0.9, opacity: 0.9 }}
            animate={reduced ? undefined : { scale: 1.28, opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border border-gold/50"
          />
          <Check size={34} className="text-gold" strokeWidth={2.2} aria-hidden />
        </motion.span>

        <h1 className="mt-5 text-[30px] leading-tight text-display">
          {confirmed ? 'Horário confirmado' : 'Horário solicitado'}
          <span className="block text-gold">com sucesso!</span>
        </h1>

        <p className="mt-3 max-w-sm text-[14px] text-muted">
          {confirmation.whatsappSent
            ? `Seu agendamento foi enviado automaticamente para o ${confirmation.barberName}. ${
                confirmed
                  ? 'O horário já está reservado.'
                  : 'Você será avisado assim que ele confirmar.'
              }`
            : confirmed
              ? `Seu horário já está reservado na agenda do ${confirmation.barberName}.`
              : `Seu pedido já entrou na agenda do ${confirmation.barberName}. Você será avisado assim que ele confirmar.`}
        </p>
      </div>

      <div className="surface-card mt-7 overflow-hidden">
        <p className="rule-label px-4 pt-4 pb-3">Resumo do agendamento</p>
        <dl className="divide-y divide-[color:var(--color-line)] border-t border-[color:var(--color-line)]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 px-4 py-3">
              <span className="text-gold/80">{row.icon}</span>
              <dt className="w-20 shrink-0 text-[13px] text-muted">{row.label}</dt>
              <dd className="flex-1 text-right text-[14px] text-ink">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-gold/80">
              <Hash size={15} aria-hidden />
            </span>
            <dt className="w-20 shrink-0 text-[13px] text-muted">Código</dt>
            <dd className="flex-1 text-right">
              <span
                className="rounded-md border border-line-gold px-2 py-1 text-[13px] font-medium tracking-wider text-gold"
                data-testid="codigo"
              >
                {confirmation.code}
              </span>
            </dd>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-gold/80">
              <Send size={15} aria-hidden />
            </span>
            <dt className="w-20 shrink-0 text-[13px] text-muted">Status</dt>
            <dd className="flex-1 text-right">
              <StatusBadge status={confirmation.status} />
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-3 text-center text-[13px] text-muted">
        Guarde o código <span className="text-ink">{confirmation.code}</span>. Ele e o seu telefone
        abrem o agendamento em <span className="text-ink">Meus agendamentos</span>.
      </p>

      <div className="mt-6 grid gap-3">
        {confirmation.whatsappUrl ? (
          <a href={confirmation.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" hint={`Abre a conversa com ${confirmation.barberName}`}>
              <Send size={17} aria-hidden />
              {confirmation.whatsappSent ? 'Falar no WhatsApp' : 'Avisar pelo WhatsApp'}
            </Button>
          </a>
        ) : null}

        <Button size="lg" onClick={onNewBooking}>
          <CalendarPlus size={17} aria-hidden />
          Novo agendamento
        </Button>

        <Link href="/meus-agendamentos" className="block">
          <Button size="lg" variant="ghost">
            Meus agendamentos
          </Button>
        </Link>
      </div>
    </motion.section>
  )
}
