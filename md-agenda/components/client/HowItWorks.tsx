'use client'

import { motion } from 'framer-motion'
import { CalendarCheck, Clock, Scissors, Send } from 'lucide-react'
import { fadeUp, staggerList, useMotionSettings } from '@/components/ui/Motion'

const STEPS = [
  { Icon: Scissors, label: 'Você escolhe o serviço' },
  { Icon: Clock, label: 'Seleciona o melhor horário' },
  { Icon: Send, label: 'Seu pedido é enviado automaticamente' },
  { Icon: CalendarCheck, label: 'O barbeiro recebe na hora' },
]

export function HowItWorks({ barberName }: { barberName: string }) {
  const { rise, duration } = useMotionSettings()

  return (
    <motion.section
      variants={staggerList()}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className="surface-card px-4 py-5"
      aria-labelledby="como-funciona"
    >
      <h2 id="como-funciona" className="mb-5 text-center text-[11px] tracking-[0.16em] text-gold uppercase">
        Como funciona
      </h2>
      <ol className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
        {STEPS.map((step, index) => (
          <motion.li
            key={step.label}
            variants={fadeUp(rise, duration)}
            className="flex flex-col items-center gap-2 text-center"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface-2 text-gold">
              <step.Icon size={17} aria-hidden />
            </span>
            <span className="text-[12px] leading-snug text-muted">
              {index === 3 ? `${barberName} recebe na hora` : step.label}
            </span>
          </motion.li>
        ))}
      </ol>
    </motion.section>
  )
}
