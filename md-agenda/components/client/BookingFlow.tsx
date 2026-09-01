'use client'

/**
 * Fluxo de agendamento do cliente.
 *
 * Uma tela só, revelada por etapa: serviço → data → horário → dados →
 * confirmação. O estado vive aqui, então voltar uma etapa não perde nada.
 *
 * Nenhuma decisão de disponibilidade é tomada neste arquivo: a lista de
 * horários vem de /api/disponibilidade e a gravação é revalidada no servidor.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, CalendarRange, Clock, Scissors, UserRound } from 'lucide-react'
import type { Service, Slot } from '@/types'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, SlotSkeleton } from '@/components/ui/Feedback'
import { useMotionSettings } from '@/components/ui/Motion'
import { addDays, diffDays, weekdayOf } from '@/lib/time'
import { isValidPhoneBR, normalizePhone } from '@/lib/format'
import { ServiceCards } from './ServiceCards'
import { DateStrip } from './DateStrip'
import { TimeGrid } from './TimeGrid'
import { CustomerForm, NOTES_LIMIT, type CustomerFields } from './CustomerForm'
import { Stepper, type StepId } from './Stepper'
import { Summary } from './Summary'
import { SuccessScreen, type BookingConfirmation } from './SuccessScreen'

interface SlotsState {
  key: string
  slots: Slot[]
  error: string | null
}

const STORAGE_KEY = 'md_agenda_cliente'
const CONNECTION_ERROR =
  'Não conseguimos confirmar seu horário. Verifique sua conexão e tente novamente.'

export interface BookingFlowProps {
  services: Service[]
  today: string
  openWeekdays: number[]
  bookingWindowDays: number
  barberName: string
  /** Trechos que só fazem sentido enquanto o cliente está agendando. */
  hero?: React.ReactNode
  rodape?: React.ReactNode
}

export function BookingFlow({
  services,
  today,
  openWeekdays,
  bookingWindowDays,
  barberName,
  hero,
  rodape,
}: BookingFlowProps) {
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  // Guardamos os horários junto da combinação que os gerou. Assim "carregando"
  // é derivado, e não um sinalizador que pode dessincronizar da lista.
  const [slotsData, setSlotsData] = useState<SlotsState | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [customer, setCustomer] = useState<CustomerFields>({ name: '', phone: '', notes: '' })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CustomerFields, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)

  const { reduced, slide } = useMotionSettings()
  const dateRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  const service = useMemo(
    () => services.find((item) => item.id === serviceId) ?? null,
    [services, serviceId],
  )

  /** Primeiro dia aberto dentro da janela — evita uma escolha à toa. */
  const firstOpenDate = useMemo(() => {
    for (let offset = 0; offset <= bookingWindowDays; offset += 1) {
      const candidate = addDays(today, offset)
      if (openWeekdays.includes(weekdayOf(candidate))) return candidate
    }
    return null
  }, [today, openWeekdays, bookingWindowDays])

  const slotsKey = service && date ? `${service.id}|${date}` : null
  const slotsReady = slotsData !== null && slotsData.key === slotsKey
  const loadingSlots = slotsKey !== null && !slotsReady
  const slots = slotsReady ? slotsData.slots : null
  const slotsError = slotsReady ? slotsData.error : null

  useEffect(() => {
    if (!service || !date) return
    const controller = new AbortController()
    const key = `${service.id}|${date}`

    void (async () => {
      try {
        const response = await fetch(
          `/api/disponibilidade?serviceId=${encodeURIComponent(service.id)}&date=${date}`,
          { signal: controller.signal, cache: 'no-store' },
        )
        const payload = await response.json()
        if (controller.signal.aborted) return
        setSlotsData({
          key,
          slots: response.ok ? (payload.slots as Slot[]) : [],
          error: response.ok ? null : (payload?.error ?? 'Não conseguimos carregar os horários.'),
        })
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        setSlotsData({
          key,
          slots: [],
          error: 'Não conseguimos carregar os horários. Verifique sua conexão.',
        })
      }
    })()

    return () => controller.abort()
  }, [service, date, reloadToken])

  function scrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    window.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'center',
      })
    })
  }

  function handleServiceSelect(next: Service) {
    setServiceId(next.id)
    setTime(null)
    setSubmitError(null)
    if (!date && firstOpenDate) setDate(firstOpenDate)
    scrollTo(dateRef)
  }

  function handleDateSelect(next: string) {
    setDate(next)
    setTime(null)
    setSubmitError(null)
    scrollTo(timeRef)
  }

  function handleSlotSelect(slot: Slot) {
    setTime(slot.time)
    setSubmitError(null)
    // Cliente que já agendou antes não redigita nome e telefone. A leitura
    // acontece aqui, no clique, e não durante a renderização — o servidor não
    // conhece o armazenamento do navegador e a tela não pisca.
    setCustomer((current) => {
      if (current.name || current.phone) return current
      const stored = readStoredCustomer()
      return stored ? { ...current, ...stored } : current
    })
    scrollTo(detailsRef)
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof CustomerFields, string>> = {}
    if (customer.name.trim().length < 3) errors.name = 'Informe seu nome completo.'
    if (!isValidPhoneBR(customer.phone)) errors.phone = 'Informe um telefone válido com DDD.'
    if (customer.notes.length > NOTES_LIMIT) errors.notes = 'Observação muito longa.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    if (!service || !date || !time) return
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          date,
          time,
          customerName: customer.name.trim(),
          customerPhone: normalizePhone(customer.phone),
          notes: customer.notes.trim() || null,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setSubmitError(payload?.error ?? CONNECTION_ERROR)
        // O horário pode ter sido tomado enquanto o cliente preenchia.
        setTime(null)
        setReloadToken((current) => current + 1)
        return
      }

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name: customer.name.trim(), phone: customer.phone }),
        )
      } catch {
        // Sem armazenamento, o agendamento continua válido.
      }

      setConfirmation({
        code: payload.appointment.code,
        customerName: payload.appointment.customerName,
        serviceName: payload.appointment.serviceNameSnapshot,
        priceCents: payload.appointment.servicePriceSnapshot,
        durationMinutes: payload.appointment.serviceDurationSnapshot,
        date,
        time,
        status: payload.appointment.status,
        whatsappUrl: payload.whatsappUrl ?? null,
        whatsappSent: Boolean(payload.whatsappSent),
        barberName: payload.barberName ?? barberName,
      })
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    } catch {
      setSubmitError(CONNECTION_ERROR)
    } finally {
      setSubmitting(false)
    }
  }

  function resetFlow() {
    setConfirmation(null)
    setServiceId(null)
    setDate(null)
    setTime(null)
    setSlotsData(null)
    setSubmitError(null)
    setCustomer((current) => ({ ...current, notes: '' }))
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  const currentStep: StepId = confirmation
    ? 'confirmacao'
    : time
      ? 'dados'
      : date
        ? 'horario'
        : service
          ? 'data'
          : 'servico'

  const availableCount = slots?.filter((slot) => slot.available).length ?? 0
  const canSubmit = Boolean(service && date && time) && !submitting

  if (confirmation) {
    return <SuccessScreen confirmation={confirmation} onNewBooking={resetFlow} />
  }

  return (
    <div className="grid gap-8">
      {hero}

      <div className="surface-card px-4 py-4">
        <Stepper current={currentStep} />
      </div>

      <Section id="servico" icon={<Scissors size={14} aria-hidden />} title="Escolha o serviço">
        <ServiceCards services={services} selectedId={serviceId} onSelect={handleServiceSelect} />
      </Section>

      <AnimatePresence initial={false}>
        {service ? (
          <Reveal key="data" distance={slide} innerRef={dateRef}>
            <Section
              id="data"
              icon={<CalendarDays size={14} aria-hidden />}
              title="Escolha a data"
            >
              <DateStrip
                today={today}
                openWeekdays={openWeekdays}
                bookingWindowDays={bookingWindowDays}
                selected={date}
                onSelect={handleDateSelect}
              />
            </Section>
          </Reveal>
        ) : null}

        {service && date ? (
          <Reveal key="horario" distance={slide} innerRef={timeRef}>
            <Section id="horario" icon={<Clock size={14} aria-hidden />} title="Escolha o horário">
              {loadingSlots ? (
                <SlotSkeleton />
              ) : slotsError ? (
                <Alert tone="danger">{slotsError}</Alert>
              ) : availableCount === 0 ? (
                <EmptyState
                  title="Não existem horários disponíveis para esta data."
                  description="Tente o próximo dia de atendimento."
                  action={
                    <Button
                      variant="outline"
                      onClick={() => {
                        const next = nextOpenDate(date, openWeekdays, bookingWindowDays, today)
                        if (next) handleDateSelect(next)
                      }}
                    >
                      <CalendarRange size={16} aria-hidden />
                      Escolher outra data
                    </Button>
                  }
                />
              ) : (
                <TimeGrid slots={slots ?? []} selected={time} onSelect={handleSlotSelect} />
              )}
            </Section>
          </Reveal>
        ) : null}

        {service && date && time ? (
          <Reveal key="dados" distance={slide} innerRef={detailsRef}>
            <Section id="dados" icon={<UserRound size={14} aria-hidden />} title="Seus dados">
              <CustomerForm value={customer} errors={fieldErrors} onChange={setCustomer} />

              <div className="mt-6 grid gap-4">
                <p className="rule-label">Confira antes de confirmar</p>
                <Summary
                  service={service}
                  date={date}
                  time={time}
                  name={customer.name.trim() || '—'}
                  phone={customer.phone}
                  notes={customer.notes}
                />

                {submitError ? <Alert tone="danger">{submitError}</Alert> : null}

                <Button
                  size="lg"
                  loading={submitting}
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  data-testid="confirmar"
                  hint={`Seu pedido vai direto para o ${barberName}`}
                >
                  Confirmar agendamento
                </Button>
              </div>
            </Section>
          </Reveal>
        ) : null}
      </AnimatePresence>

      {rodape}
    </div>
  )
}

/** Nome e telefone guardados do agendamento anterior, se houver. */
function readStoredCustomer(): { name: string; phone: string } | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as { name?: string; phone?: string }
    if (!parsed.name && !parsed.phone) return null
    return { name: parsed.name ?? '', phone: parsed.phone ?? '' }
  } catch {
    // Armazenamento indisponível não impede o agendamento.
    return null
  }
}

function nextOpenDate(
  from: string,
  openWeekdays: number[],
  bookingWindowDays: number,
  today: string,
): string | null {
  for (let offset = 1; offset <= bookingWindowDays; offset += 1) {
    const candidate = addDays(from, offset)
    if (diffDays(today, candidate) > bookingWindowDays) return null
    if (openWeekdays.includes(weekdayOf(candidate))) return candidate
  }
  return null
}

function Section({
  id,
  icon,
  title,
  children,
}: {
  id: string
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`${id}-titulo`}>
      <h2 id={`${id}-titulo`} className="rule-label mb-3.5">
        <span className="text-gold">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Reveal({
  children,
  distance,
  innerRef,
}: {
  children: React.ReactNode
  distance: number
  innerRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <motion.div
      ref={innerRef}
      initial={{ opacity: 0, x: distance }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -distance, transition: { duration: 0.18 } }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ scrollMarginTop: '96px' }}
    >
      {children}
    </motion.div>
  )
}
