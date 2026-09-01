'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, dayOfMonth, diffDays, monthShort, weekdayOf, weekdayShort } from '@/lib/time'
import { useMotionSettings } from '@/components/ui/Motion'

const VISIBLE_DAYS = 5

/**
 * Faixa de datas.
 *
 * Anda de bloco em bloco, nunca para trás de hoje e nunca além da janela de
 * agendamento configurada. Dia fechado aparece desabilitado em vez de sumir —
 * o cliente entende por que aquele dia não serve.
 */
export function DateStrip({
  today,
  openWeekdays,
  bookingWindowDays,
  selected,
  onSelect,
}: {
  today: string
  openWeekdays: number[]
  bookingWindowDays: number
  selected: string | null
  onSelect: (date: string) => void
}) {
  const [offset, setOffset] = useState(0)
  const [direction, setDirection] = useState(1)
  const { reduced } = useMotionSettings()

  const days = useMemo(() => {
    return Array.from({ length: VISIBLE_DAYS }, (_, index) => {
      const date = addDays(today, offset + index)
      const distance = diffDays(today, date)
      return {
        date,
        open: openWeekdays.includes(weekdayOf(date)),
        withinWindow: distance >= 0 && distance <= bookingWindowDays,
      }
    })
  }, [today, offset, openWeekdays, bookingWindowDays])

  const canGoBack = offset > 0
  const canGoForward = offset + VISIBLE_DAYS <= bookingWindowDays

  function move(step: number) {
    setDirection(step)
    setOffset((current) => Math.max(0, current + step * VISIBLE_DAYS))
  }

  return (
    <div className="flex items-center gap-2">
      <StripArrow
        label="Datas anteriores"
        disabled={!canGoBack}
        onClick={() => move(-1)}
        icon={<ChevronLeft size={18} aria-hidden />}
      />

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={offset}
            initial={reduced ? false : { opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="grid grid-cols-5 gap-2"
          >
            {days.map((day) => {
              const disabled = !day.open || !day.withinWindow
              const isSelected = day.date === selected
              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={disabled}
                  aria-pressed={isSelected}
                  aria-label={`${weekdayShort(day.date)} ${dayOfMonth(day.date)} de ${monthShort(day.date)}${disabled ? ' — indisponível' : ''}`}
                  data-testid="data"
                  data-date={day.date}
                  onClick={() => onSelect(day.date)}
                  className={`relative flex min-h-20 flex-col items-center justify-center rounded-[14px] border transition-colors duration-200 ${
                    isSelected
                      ? 'border-line-gold bg-surface-2'
                      : 'border-line bg-surface hover:border-line-strong'
                  } ${disabled ? 'cursor-not-allowed opacity-35 hover:border-line' : ''}`}
                >
                  {isSelected ? (
                    <motion.span
                      initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.18 }}
                      className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-gold text-[#221703]"
                      aria-hidden
                    >
                      <Check size={11} strokeWidth={3} />
                    </motion.span>
                  ) : null}
                  <span className="text-[11px] text-muted">{weekdayShort(day.date)}</span>
                  <span className="text-[19px] leading-tight font-medium text-ink tabular-nums">
                    {dayOfMonth(day.date)}
                  </span>
                  <span className="text-[11px] text-muted">{monthShort(day.date)}</span>
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <StripArrow
        label="Próximas datas"
        disabled={!canGoForward}
        onClick={() => move(1)}
        icon={<ChevronRight size={18} aria-hidden />}
      />
    </div>
  )
}

function StripArrow({
  label,
  disabled,
  onClick,
  icon,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-11 w-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-25 disabled:hover:border-line"
    >
      {icon}
    </button>
  )
}
