'use client'

/**
 * Bloqueios da agenda.
 *
 * Criar aqui remove o horário da tela do cliente na mesma hora — o motor de
 * disponibilidade lê os bloqueios junto com os agendamentos.
 */

import { useActionState } from 'react'
import { CalendarOff, Trash2 } from 'lucide-react'
import type { BlockedPeriod } from '@/types'
import { Alert } from '@/components/ui/Feedback'
import { formatDateBR, toDateStr, toTimeStr } from '@/lib/time'
import { createBlockAction, deleteBlockAction, type ActionState } from '@/app/admin/actions'

export function BlocksManager({
  blocks,
  timezone,
  defaultDate,
}: {
  blocks: BlockedPeriod[]
  timezone: string
  defaultDate: string
}) {
  const [createState, create, creating] = useActionState<ActionState, FormData>(
    createBlockAction,
    {},
  )
  const [deleteState, remove] = useActionState<ActionState, FormData>(deleteBlockAction, {})

  return (
    <section aria-labelledby="bloqueios" className="grid gap-3">
      <h2 id="bloqueios" className="rule-label">
        <CalendarOff size={13} aria-hidden />
        Bloquear horários
      </h2>

      <form action={create} className="surface-card grid gap-3 p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="grid gap-1.5 text-[11px] tracking-[0.14em] text-muted uppercase">
            Data
            <input
              type="date"
              name="date"
              defaultValue={defaultDate}
              required
              className="min-h-11 rounded-[10px] border border-line bg-surface-2 px-3 text-[14px] tracking-normal text-ink normal-case"
            />
          </label>
          <label className="grid gap-1.5 text-[11px] tracking-[0.14em] text-muted uppercase">
            Início
            <input
              type="time"
              name="startTime"
              defaultValue="14:00"
              step={300}
              required
              className="min-h-11 rounded-[10px] border border-line bg-surface-2 px-3 text-[14px] tracking-normal text-ink normal-case"
            />
          </label>
          <label className="grid gap-1.5 text-[11px] tracking-[0.14em] text-muted uppercase">
            Fim
            <input
              type="time"
              name="endTime"
              defaultValue="16:00"
              step={300}
              required
              className="min-h-11 rounded-[10px] border border-line bg-surface-2 px-3 text-[14px] tracking-normal text-ink normal-case"
            />
          </label>
          <label className="grid gap-1.5 text-[11px] tracking-[0.14em] text-muted uppercase">
            Motivo
            <input
              type="text"
              name="reason"
              maxLength={120}
              placeholder="Compromisso"
              className="min-h-11 rounded-[10px] border border-line bg-surface-2 px-3 text-[14px] tracking-normal text-ink normal-case placeholder:text-muted/70"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-[13px] text-muted">
            <input type="checkbox" name="allDay" className="h-4 w-4 accent-[#d89b32]" />
            Dia inteiro
          </label>
          <button
            type="submit"
            disabled={creating}
            data-testid="criar-bloqueio"
            className="min-h-11 rounded-[10px] border border-line-gold px-4 text-[14px] text-gold transition-colors hover:bg-gold/8 disabled:opacity-50"
          >
            Bloquear
          </button>
        </div>

        {createState.error ? <Alert tone="danger">{createState.error}</Alert> : null}
        {createState.ok ? <Alert tone="info">{createState.message}</Alert> : null}
      </form>

      {blocks.length > 0 ? (
        <ul className="grid gap-2">
          {blocks.map((block) => (
            <li
              key={block.id}
              className="surface-card flex items-center gap-3 px-4 py-3 text-[13px]"
            >
              <span className="flex-1">
                <span className="text-ink">
                  {formatDateBR(toDateStr(new Date(block.startsAt), timezone))}
                </span>{' '}
                <span className="text-muted tabular-nums">
                  {toTimeStr(new Date(block.startsAt), timezone)}–
                  {toTimeStr(new Date(block.endsAt), timezone)}
                </span>
                {block.reason ? <span className="block text-muted">{block.reason}</span> : null}
              </span>
              <form action={remove}>
                <input type="hidden" name="id" value={block.id} />
                <button
                  type="submit"
                  aria-label="Remover bloqueio"
                  className="grid h-9 w-9 place-items-center rounded-[9px] border border-line text-muted transition-colors hover:border-danger/40 hover:text-danger"
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}

      {deleteState.error ? <Alert tone="danger">{deleteState.error}</Alert> : null}
    </section>
  )
}
