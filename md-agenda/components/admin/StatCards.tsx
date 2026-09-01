'use client'

import { motion } from 'framer-motion'
import { CalendarCheck, CalendarClock, CalendarX2, CheckCheck } from 'lucide-react'
import { fadeUp, staggerList, useMotionSettings } from '@/components/ui/Motion'

export function StatCards({
  counts,
}: {
  counts: { total: number; confirmed: number; pending: number; cancelled: number }
}) {
  const { rise, duration } = useMotionSettings()

  const cards = [
    { label: 'Hoje', value: counts.total, Icon: CalendarClock, tone: 'text-gold' },
    { label: 'Confirmados', value: counts.confirmed, Icon: CalendarCheck, tone: 'text-success' },
    { label: 'Pendentes', value: counts.pending, Icon: CheckCheck, tone: 'text-warning' },
    { label: 'Cancelados', value: counts.cancelled, Icon: CalendarX2, tone: 'text-danger' },
  ]

  return (
    <motion.div
      variants={staggerList()}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <motion.div key={card.label} variants={fadeUp(rise, duration)} className="surface-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-[0.14em] text-muted uppercase">{card.label}</span>
            <card.Icon size={16} className={card.tone} aria-hidden />
          </div>
          <p className="mt-3 text-[28px] leading-none font-semibold text-ink tabular-nums">
            {card.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
}

/** Atividade da semana com dados reais — sem gráfico decorativo. */
export function WeekActivity({ week }: { week: { date: string; total: number }[] }) {
  const max = Math.max(1, ...week.map((day) => day.total))
  const { reduced } = useMotionSettings()
  const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  return (
    <div className="surface-card p-4">
      <p className="rule-label mb-4">Atividade da semana</p>
      <div className="flex items-end gap-2">
        {week.map((day) => {
          const weekday = new Date(`${day.date}T12:00:00Z`).getUTCDay()
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] text-muted tabular-nums">{day.total}</span>
              {/* A trilha tem altura própria: sem ela, a altura percentual da
                  barra não teria contra o que ser calculada. */}
              <div className="flex h-20 w-full items-end">
                <motion.div
                  initial={reduced ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                  style={{
                    height: `${Math.max(4, (day.total / max) * 100)}%`,
                    transformOrigin: 'bottom',
                  }}
                  className={`w-full rounded-t-[5px] ${day.total > 0 ? 'bg-gold/70' : 'bg-white/8'}`}
                />
              </div>
              <span className="text-[10px] text-muted">{labels[weekday]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
