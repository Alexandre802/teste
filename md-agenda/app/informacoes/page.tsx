import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CalendarClock, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { getStore, storeKindOrNull } from '@/lib/db'
import { getPublicSettings } from '@/lib/settings'
import { destinationNumber } from '@/lib/notifications/notify'
import { formatPhoneBR, toInternationalPhone } from '@/lib/format'
import { minutesToTime, timeToMinutes, weekdayLong } from '@/lib/time'
import type { BusinessHour } from '@/types'
import { BottomNav } from '@/components/client/BottomNav'
import { SiteHeader } from '@/components/client/SiteHeader'
import { SiteFooter } from '@/components/client/SiteFooter'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Informações',
  description: 'Horário de atendimento, contato e como funciona o agendamento.',
  alternates: { canonical: '/informacoes' },
}

/**
 * Página de informações.
 *
 * Só mostra o que está cadastrado. Endereço, telefone e expediente que
 * ninguém confirmou simplesmente não aparecem — em vez de um placeholder que
 * o cliente leria como verdade.
 */
export default async function InformacoesPage() {
  const settings = await getPublicSettings()

  let hours: BusinessHour[] = []
  if (storeKindOrNull()) {
    try {
      hours = await getStore().listBusinessHours()
    } catch {
      hours = []
    }
  }

  const destination = destinationNumber(settings)
  const whatsappUrl = destination ? `https://wa.me/${toInternationalPhone(destination)}` : null
  const openDays = hours.filter((hour) => hour.isOpen)

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pb-28 sm:pb-10">
        <SiteHeader businessName={settings.businessName} />

        <div className="pt-7 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={15} aria-hidden />
            Voltar ao início
          </Link>
          <h1 className="mt-4 text-[28px] leading-tight text-display">Informações</h1>
        </div>

        <div className="grid gap-6">
          <section aria-labelledby="atendimento">
            <h2 id="atendimento" className="rule-label mb-3">
              <CalendarClock size={14} aria-hidden />
              Horário de atendimento
            </h2>
            {openDays.length === 0 ? (
              <p className="surface-card px-4 py-4 text-sm text-muted">
                O horário de atendimento ainda não foi publicado.
              </p>
            ) : (
              <ul className="surface-card divide-y divide-[color:var(--color-line)]">
                {hours.map((hour) => (
                  <li
                    key={hour.weekday}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]"
                  >
                    <span className="text-muted first-letter:uppercase">{weekdayLong(hour.weekday)}</span>
                    <span className={hour.isOpen ? 'text-ink tabular-nums' : 'text-muted'}>
                      {formatHourRange(hour)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {settings.businessAddress || settings.businessPhone || whatsappUrl ? (
            <section aria-labelledby="contato">
              <h2 id="contato" className="rule-label mb-3">
                <MapPin size={14} aria-hidden />
                Contato
              </h2>
              <div className="surface-card grid gap-3 px-4 py-4 text-[14px]">
                {settings.businessAddress ? (
                  <p className="flex items-start gap-2.5 text-muted">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-gold/80" aria-hidden />
                    {settings.businessAddress}
                  </p>
                ) : null}
                {settings.businessPhone ? (
                  <p className="flex items-center gap-2.5 text-muted">
                    <Phone size={15} className="shrink-0 text-gold/80" aria-hidden />
                    {formatPhoneBR(settings.businessPhone)}
                  </p>
                ) : null}
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-gold underline-offset-4 hover:underline"
                  >
                    <MessageCircle size={15} className="shrink-0" aria-hidden />
                    Falar no WhatsApp
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="cancelamento">
            <h2 id="cancelamento" className="rule-label mb-3">
              <ShieldCheck size={14} aria-hidden />
              Cancelamento
            </h2>
            <p className="surface-card px-4 py-4 text-[14px] leading-relaxed text-muted">
              Você pode cancelar sozinho até{' '}
              <span className="text-ink">{describeMinutes(settings.cancelBeforeMinutes)}</span> antes
              do horário marcado, em{' '}
              <Link href="/meus-agendamentos" className="text-gold underline underline-offset-4">
                Meus agendamentos
              </Link>
              . Depois disso, fale com {settings.barberName}.
            </p>
          </section>
        </div>

        <SiteFooter
          businessName={settings.businessName}
          address={settings.businessAddress}
          phone={settings.businessPhone}
        />
      </div>

      <BottomNav whatsappUrl={whatsappUrl} />
    </>
  )
}

function formatHourRange(hour: BusinessHour): string {
  if (!hour.isOpen || !hour.opensAt || !hour.closesAt) return 'Fechado'
  const breakStart = timeToMinutes(hour.breakStart)
  const breakEnd = timeToMinutes(hour.breakEnd)
  if (breakStart !== null && breakEnd !== null) {
    return `${hour.opensAt}–${minutesToTime(breakStart)} · ${minutesToTime(breakEnd)}–${hour.closesAt}`
  }
  return `${hour.opensAt}–${hour.closesAt}`
}

function describeMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} minutos`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (rest === 0) return hours === 1 ? '1 hora' : `${hours} horas`
  return `${hours}h ${rest}min`
}
