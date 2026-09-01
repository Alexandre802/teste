'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Slot } from '@/types'
import { staggerList, useMotionSettings } from '@/components/ui/Motion'

/**
 * Horários do dia.
 *
 * A lista vem do servidor já resolvida. Horário ocupado continua na tela,
 * desabilitado — some a chance de o cliente clicar e levar um "não" depois.
 */
export function TimeGrid({
  slots,
  selected,
  onSelect,
}: {
  slots: Slot[]
  selected: string | null
  onSelect: (slot: Slot) => void
}) {
  const { reduced } = useMotionSettings()

  return (
    <motion.div
      variants={staggerList(0.02)}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-2.5 sm:grid-cols-5"
      role="radiogroup"
      aria-label="Escolha o horário"
    >
      {slots.map((slot) => {
        const isSelected = slot.time === selected
        return (
          <motion.button
            key={slot.time}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={!slot.available}
            aria-label={`${slot.time}${slot.available ? '' : ' — indisponível'}`}
            data-testid="horario"
            data-time={slot.time}
            data-available={slot.available ? 'true' : 'false'}
            variants={{
              hidden: { opacity: 0, y: reduced ? 0 : 6 },
              show: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.2 } },
            }}
            whileTap={reduced || !slot.available ? undefined : { scale: 0.97 }}
            animate={reduced ? undefined : { scale: isSelected ? 1.02 : 1 }}
            transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
            onClick={() => onSelect(slot)}
            className={`relative min-h-12 rounded-[12px] border text-[15px] tabular-nums transition-colors duration-200 ${
              isSelected
                ? 'border-line-gold bg-surface-2 text-ink'
                : 'border-line bg-surface text-ink hover:border-line-strong'
            } ${slot.available ? '' : 'cursor-not-allowed opacity-30 hover:border-line'}`}
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
            {slot.time}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
