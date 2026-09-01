'use client'

/**
 * Serviços.
 *
 * Preço e duração daqui valem para agendamentos novos. Os antigos guardam o
 * que estava valendo no dia — o snapshot em `appointments` não é reescrito.
 */

import { useActionState, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Pencil, Plus, X } from 'lucide-react'
import type { Service } from '@/types'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Feedback'
import { formatPriceBRL } from '@/lib/format'
import { formatDuration } from '@/lib/time'
import { fadeUp, staggerList, useMotionSettings } from '@/components/ui/Motion'
import { saveServiceAction, toggleServiceAction, type ActionState } from '@/app/admin/actions'

export function ServicesManager({ services }: { services: Service[] }) {
  const [editing, setEditing] = useState<Service | 'novo' | null>(null)
  const { rise, duration } = useMotionSettings()
  const [toggleState, toggle] = useActionState<ActionState, FormData>(toggleServiceAction, {})

  return (
    <div className="grid gap-4">
      {toggleState.error ? <Alert tone="danger">{toggleState.error}</Alert> : null}

      {editing ? (
        <ServiceForm
          service={editing === 'novo' ? null : editing}
          onClose={() => setEditing(null)}
        />
      ) : (
        <Button variant="outline" onClick={() => setEditing('novo')} data-testid="novo-servico">
          <Plus size={17} aria-hidden />
          Novo serviço
        </Button>
      )}

      <motion.ul variants={staggerList()} initial="hidden" animate="show" className="grid gap-2.5">
        {services.map((service) => (
          <motion.li
            key={service.id}
            variants={fadeUp(rise, duration)}
            className="surface-card flex items-center gap-3 px-4 py-3.5"
            data-testid="servico-admin"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] text-ink">
                {service.name}
                {!service.active ? (
                  <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[10px] text-muted">
                    inativo
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-[13px] text-muted">
                {formatDuration(service.durationMinutes)} · {formatPriceBRL(service.priceCents)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditing(service)}
              aria-label={`Editar ${service.name}`}
              className="grid h-9 w-9 place-items-center rounded-[9px] border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <Pencil size={15} aria-hidden />
            </button>

            <form action={toggle}>
              <input type="hidden" name="id" value={service.id} />
              <input type="hidden" name="active" value={service.active ? 'false' : 'true'} />
              <button
                type="submit"
                className={`min-h-9 rounded-[9px] border px-3 text-[13px] transition-colors ${
                  service.active
                    ? 'border-line text-muted hover:border-danger/40 hover:text-danger'
                    : 'border-line-gold text-gold hover:bg-gold/8'
                }`}
              >
                {service.active ? 'Desativar' : 'Ativar'}
              </button>
            </form>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}

function ServiceForm({ service, onClose }: { service: Service | null; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveServiceAction, {})

  return (
    <form action={action} className="surface-card grid gap-3 p-4" data-testid="form-servico">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}

      <div className="flex items-center justify-between">
        <p className="rule-label flex-1">{service ? 'Editar serviço' : 'Novo serviço'}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted hover:text-ink"
        >
          <X size={15} aria-hidden />
        </button>
      </div>

      <Labeled label="Nome">
        <input
          name="name"
          defaultValue={service?.name ?? ''}
          required
          maxLength={60}
          data-testid="servico-nome"
          className={FIELD}
        />
      </Labeled>

      <Labeled label="Descrição (opcional)">
        <input
          name="description"
          defaultValue={service?.description ?? ''}
          maxLength={160}
          className={FIELD}
        />
      </Labeled>

      <div className="grid gap-3 sm:grid-cols-3">
        <Labeled label="Preço (R$)">
          <input
            name="price"
            defaultValue={service ? (service.priceCents / 100).toFixed(2) : ''}
            inputMode="decimal"
            required
            data-testid="servico-preco"
            className={FIELD}
          />
        </Labeled>
        <Labeled label="Duração (min)">
          <input
            name="durationMinutes"
            type="number"
            min={5}
            max={600}
            step={5}
            defaultValue={service?.durationMinutes ?? 30}
            required
            data-testid="servico-duracao"
            className={FIELD}
          />
        </Labeled>
        <Labeled label="Ordem">
          <input
            name="sortOrder"
            type="number"
            min={0}
            max={999}
            defaultValue={service?.sortOrder ?? 0}
            className={FIELD}
          />
        </Labeled>
      </div>

      <label className="inline-flex items-center gap-2 text-[13px] text-muted">
        <input
          type="checkbox"
          name="active"
          defaultChecked={service?.active ?? true}
          className="h-4 w-4 accent-[#d89b32]"
        />
        Disponível para os clientes
      </label>

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.ok ? <Alert tone="info">{state.message}</Alert> : null}

      <Button type="submit" loading={pending} data-testid="salvar-servico">
        <Check size={17} aria-hidden />
        Salvar serviço
      </Button>
    </form>
  )
}

const FIELD =
  'min-h-11 w-full rounded-[10px] border border-line bg-surface-2 px-3 text-[14px] text-ink placeholder:text-muted/70'

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] tracking-[0.14em] text-muted uppercase">{label}</span>
      {children}
    </label>
  )
}
