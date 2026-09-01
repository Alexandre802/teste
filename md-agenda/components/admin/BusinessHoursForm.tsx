'use client'

/**
 * Expediente da semana.
 *
 * É daqui que sai a grade de horários do cliente. Enquanto nenhum dia estiver
 * aberto, o site não oferece horário nenhum — de propósito.
 */

import { useActionState, useState } from 'react'
import { Check } from 'lucide-react'
import type { BusinessHour } from '@/types'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Feedback'
import { weekdayLong } from '@/lib/time'
import { saveBusinessHoursAction, type ActionState } from '@/app/admin/actions'

const FIELD =
  'min-h-10 rounded-[9px] border border-line bg-surface-2 px-2.5 text-[13px] text-ink disabled:opacity-40'

export function BusinessHoursForm({ hours }: { hours: BusinessHour[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveBusinessHoursAction,
    {},
  )
  const [openDays, setOpenDays] = useState<Record<number, boolean>>(
    Object.fromEntries(hours.map((hour) => [hour.weekday, hour.isOpen])),
  )

  return (
    <form action={action} className="grid gap-3" data-testid="form-expediente">
      <ul className="surface-card divide-y divide-[color:var(--color-line)]">
        {hours.map((hour) => {
          const isOpen = openDays[hour.weekday] ?? hour.isOpen
          return (
            <li key={hour.weekday} className="grid gap-2.5 px-4 py-3.5">
              <label className="flex items-center gap-2.5 text-[14px]">
                <input
                  type="checkbox"
                  name={`open-${hour.weekday}`}
                  defaultChecked={hour.isOpen}
                  onChange={(event) =>
                    setOpenDays((current) => ({
                      ...current,
                      [hour.weekday]: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[#d89b32]"
                  data-testid={`dia-${hour.weekday}`}
                />
                <span className={`first-letter:uppercase ${isOpen ? 'text-ink' : 'text-muted'}`}>
                  {weekdayLong(hour.weekday)}
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2 pl-6.5 text-[12px] text-muted">
                <span className="w-14">Atende</span>
                <input
                  type="time"
                  name={`opens-${hour.weekday}`}
                  defaultValue={hour.opensAt ?? '09:00'}
                  step={300}
                  disabled={!isOpen}
                  aria-label={`Abertura de ${weekdayLong(hour.weekday)}`}
                  className={FIELD}
                />
                <span>até</span>
                <input
                  type="time"
                  name={`closes-${hour.weekday}`}
                  defaultValue={hour.closesAt ?? '19:00'}
                  step={300}
                  disabled={!isOpen}
                  aria-label={`Fechamento de ${weekdayLong(hour.weekday)}`}
                  className={FIELD}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pl-6.5 text-[12px] text-muted">
                <span className="w-14">Intervalo</span>
                <input
                  type="time"
                  name={`breakStart-${hour.weekday}`}
                  defaultValue={hour.breakStart ?? ''}
                  step={300}
                  disabled={!isOpen}
                  aria-label={`Início do intervalo de ${weekdayLong(hour.weekday)}`}
                  className={FIELD}
                />
                <span>até</span>
                <input
                  type="time"
                  name={`breakEnd-${hour.weekday}`}
                  defaultValue={hour.breakEnd ?? ''}
                  step={300}
                  disabled={!isOpen}
                  aria-label={`Fim do intervalo de ${weekdayLong(hour.weekday)}`}
                  className={FIELD}
                />
              </div>
            </li>
          )
        })}
      </ul>

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.ok ? <Alert tone="info">{state.message}</Alert> : null}

      <Button type="submit" loading={pending} data-testid="salvar-expediente">
        <Check size={17} aria-hidden />
        Salvar expediente
      </Button>
    </form>
  )
}
