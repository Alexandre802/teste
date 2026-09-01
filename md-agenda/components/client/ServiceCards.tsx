'use client'

import { motion } from 'framer-motion'
import { Check, Clock } from 'lucide-react'
import type { Service } from '@/types'
import { formatPriceBRL } from '@/lib/format'
import { formatDuration } from '@/lib/time'
import { fadeUp, staggerList, useMotionSettings } from '@/components/ui/Motion'

export function ServiceCards({
  services,
  selectedId,
  onSelect,
}: {
  services: Service[]
  selectedId: string | null
  onSelect: (service: Service) => void
}) {
  const { rise, duration, reduced } = useMotionSettings()

  return (
    <motion.div
      variants={staggerList()}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      role="radiogroup"
      aria-label="Escolha o serviço"
    >
      {services.map((service) => {
        const selected = service.id === selectedId
        return (
          <motion.button
            key={service.id}
            type="button"
            role="radio"
            aria-checked={selected}
            variants={fadeUp(rise, duration)}
            whileTap={reduced ? undefined : { scale: 0.985 }}
            animate={reduced ? undefined : { scale: selected ? 1.015 : 1 }}
            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            onClick={() => onSelect(service)}
            data-testid="servico"
            data-selected={selected ? 'true' : 'false'}
            className={`relative flex min-h-28 flex-col justify-between rounded-[16px] border p-4 text-left transition-colors duration-200 ${
              selected
                ? 'border-line-gold bg-surface-2'
                : 'border-line bg-surface hover:border-line-strong'
            }`}
          >
            {selected ? (
              <motion.span
                initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
                className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-gold text-[#221703]"
                aria-hidden
              >
                <Check size={14} strokeWidth={3} />
              </motion.span>
            ) : null}

            <div>
              <p className="text-[16px] leading-snug font-medium text-ink">{service.name}</p>
              {service.description ? (
                <p className="mt-1 line-clamp-2 text-[13px] text-muted">{service.description}</p>
              ) : null}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                <Clock size={13} aria-hidden />
                {formatDuration(service.durationMinutes)}
              </span>
              <span className="text-[15px] font-semibold text-gold tabular-nums">
                {formatPriceBRL(service.priceCents)}
              </span>
            </div>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
