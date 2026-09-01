'use client'

import { MessageCircle, Phone, User } from 'lucide-react'
import { TextAreaField, TextField } from '@/components/ui/Field'
import { formatPhoneBR } from '@/lib/format'

export interface CustomerFields {
  name: string
  phone: string
  notes: string
}

export const NOTES_LIMIT = 240

export function CustomerForm({
  value,
  errors,
  onChange,
}: {
  value: CustomerFields
  errors: Partial<Record<keyof CustomerFields, string>>
  onChange: (next: CustomerFields) => void
}) {
  return (
    <div className="grid gap-4">
      <TextField
        label="Nome completo"
        placeholder="Como o Maicon vai te chamar"
        icon={<User size={16} aria-hidden />}
        autoComplete="name"
        enterKeyHint="next"
        maxLength={80}
        value={value.name}
        error={errors.name}
        data-testid="campo-nome"
        onChange={(event) => onChange({ ...value, name: event.target.value })}
      />

      <TextField
        label="Telefone / WhatsApp"
        placeholder="(12) 99999-9999"
        icon={<Phone size={16} aria-hidden />}
        inputMode="numeric"
        autoComplete="tel-national"
        enterKeyHint="next"
        value={value.phone}
        error={errors.phone}
        hint="É por aqui que a confirmação chega."
        data-testid="campo-telefone"
        onChange={(event) => onChange({ ...value, phone: formatPhoneBR(event.target.value) })}
      />

      <TextAreaField
        label="Observação (opcional)"
        placeholder="Algo que o Maicon precisa saber antes?"
        icon={<MessageCircle size={16} aria-hidden />}
        maxLength={NOTES_LIMIT}
        value={value.notes}
        error={errors.notes}
        counter={`${value.notes.length}/${NOTES_LIMIT}`}
        data-testid="campo-observacao"
        onChange={(event) => onChange({ ...value, notes: event.target.value })}
      />
    </div>
  )
}
