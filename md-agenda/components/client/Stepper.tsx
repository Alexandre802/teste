'use client'

import { motion } from 'framer-motion'
import { CalendarDays, Check, Clock, Scissors, UserRound } from 'lucide-react'
import { useMotionSettings } from '@/components/ui/Motion'

export type StepId = 'servico' | 'data' | 'horario' | 'dados' | 'confirmacao'

const STEPS: { id: StepId; label: string; Icon: typeof Scissors }[] = [
  { id: 'servico', label: 'Serviço', Icon: Scissors },
  { id: 'data', label: 'Data', Icon: CalendarDays },
  { id: 'horario', label: 'Horário', Icon: Clock },
  { id: 'dados', label: 'Dados', Icon: UserRound },
  { id: 'confirmacao', label: 'Confirmação', Icon: Check },
]

export function Stepper({ current }: { current: StepId }) {
  const activeIndex = STEPS.findIndex((step) => step.id === current)
  const { reduced } = useMotionSettings()

  return (
    <ol
      className="flex items-start justify-between gap-1"
      aria-label={`Etapa ${activeIndex + 1} de ${STEPS.length}`}
    >
      {STEPS.map((step, index) => {
        const done = index < activeIndex
        const active = index === activeIndex
        return (
          <li key={step.id} className="relative flex flex-1 flex-col items-center gap-1.5">
            {index > 0 ? (
              <span
                aria-hidden
                className={`absolute top-4 right-1/2 left-[-50%] h-px ${
                  done || active ? 'bg-line-gold' : 'bg-line'
                }`}
              />
            ) : null}

            <motion.span
              animate={reduced ? undefined : { scale: active ? 1.06 : 1 }}
              transition={{ duration: 0.2 }}
              className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border transition-colors duration-200 ${
                done
                  ? 'border-line-gold bg-gold/12 text-gold'
                  : active
                    ? 'border-gold bg-surface-2 text-gold'
                    : 'border-line bg-base text-muted'
              }`}
            >
              <step.Icon size={14} aria-hidden />
            </motion.span>

            <span
              className={`text-center text-[10px] leading-tight ${active ? 'text-ink' : 'text-muted'}`}
              aria-current={active ? 'step' : undefined}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
