'use client'

import { useActionState } from 'react'
import { Check } from 'lucide-react'
import type { Settings } from '@/types'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Feedback'
import { saveSettingsAction, type ActionState } from '@/app/admin/actions'

const FIELD =
  'min-h-11 w-full rounded-[10px] border border-line bg-surface-2 px-3 text-[14px] text-ink placeholder:text-muted/70'

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveSettingsAction, {})

  return (
    <form action={action} className="grid gap-6" data-testid="form-configuracoes">
      <fieldset className="surface-card grid gap-3 p-4">
        <legend className="rule-label px-1">Regras de agendamento</legend>

        <div className="grid gap-3 sm:grid-cols-2">
          <Labeled label="Intervalo entre horários (min)" hint="De quantos em quantos minutos a grade abre.">
            <input
              name="slotIntervalMinutes"
              type="number"
              min={5}
              max={240}
              step={5}
              defaultValue={settings.slotIntervalMinutes}
              className={FIELD}
              data-testid="config-intervalo"
            />
          </Labeled>

          <Labeled
            label="Antecedência mínima (min)"
            hint="Horário mais próximo que o cliente ainda consegue marcar."
          >
            <input
              name="minimumBookingNoticeMinutes"
              type="number"
              min={0}
              max={10080}
              step={5}
              defaultValue={settings.minimumBookingNoticeMinutes}
              className={FIELD}
              data-testid="config-antecedencia"
            />
          </Labeled>

          <Labeled label="Janela de agendamento (dias)" hint="Até quantos dias à frente a agenda abre.">
            <input
              name="bookingWindowDays"
              type="number"
              min={1}
              max={365}
              defaultValue={settings.bookingWindowDays}
              className={FIELD}
            />
          </Labeled>

          <Labeled
            label="Cancelamento até (min antes)"
            hint="Depois desse prazo, só você cancela."
          >
            <input
              name="cancelBeforeMinutes"
              type="number"
              min={0}
              max={10080}
              step={5}
              defaultValue={settings.cancelBeforeMinutes}
              className={FIELD}
            />
          </Labeled>
        </div>

        <label className="mt-1 flex items-start gap-2.5 text-[14px]">
          <input
            type="checkbox"
            name="autoConfirmAppointments"
            defaultChecked={settings.autoConfirmAppointments}
            className="mt-0.5 h-4 w-4 accent-[#d89b32]"
            data-testid="config-autoconfirmar"
          />
          <span>
            <span className="text-ink">Confirmar automaticamente</span>
            <span className="mt-0.5 block text-[13px] text-muted">
              Ligado, o agendamento já entra como confirmado. Desligado, entra como aguardando a sua
              confirmação. Nos dois casos o horário fica ocupado na hora.
            </span>
          </span>
        </label>
      </fieldset>

      <fieldset className="surface-card grid gap-3 p-4">
        <legend className="rule-label px-1">Barbearia</legend>

        <div className="grid gap-3 sm:grid-cols-2">
          <Labeled label="Nome do negócio">
            <input name="businessName" defaultValue={settings.businessName} maxLength={60} className={FIELD} />
          </Labeled>
          <Labeled label="Nome do barbeiro">
            <input name="barberName" defaultValue={settings.barberName} maxLength={60} className={FIELD} />
          </Labeled>
          <Labeled label="Foto do barbeiro (URL https)" hint="Sem foto, entra o selo da marca.">
            <input
              name="barberPhotoUrl"
              type="url"
              defaultValue={settings.barberPhotoUrl ?? ''}
              placeholder="https://..."
              className={FIELD}
            />
          </Labeled>
          <Labeled label="Assinatura sob a foto" hint="Aparece no selo do hero. Ex.: Barbeiro.">
            <input
              name="barberTagline"
              defaultValue={settings.barberTagline ?? ''}
              maxLength={40}
              className={FIELD}
            />
          </Labeled>
          <Labeled label="Endereço" hint="Só aparece no site depois de preenchido.">
            <input
              name="businessAddress"
              defaultValue={settings.businessAddress ?? ''}
              maxLength={200}
              className={FIELD}
            />
          </Labeled>
          <Labeled label="Telefone de contato">
            <input
              name="businessPhone"
              defaultValue={settings.businessPhone ?? ''}
              maxLength={30}
              className={FIELD}
            />
          </Labeled>
          <Labeled
            label="WhatsApp que recebe os pedidos"
            hint="Com DDD e DDI. Vazio, vale a variável MAICON_WHATSAPP_NUMBER."
          >
            <input
              name="whatsappNumber"
              defaultValue={settings.whatsappNumber ?? ''}
              placeholder="5512999999999"
              maxLength={30}
              className={FIELD}
              data-testid="config-whatsapp"
            />
          </Labeled>
        </div>
      </fieldset>

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.ok ? <Alert tone="info">{state.message}</Alert> : null}

      <Button type="submit" loading={pending} data-testid="salvar-configuracoes">
        <Check size={17} aria-hidden />
        Salvar configurações
      </Button>
    </form>
  )
}

function Labeled({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] tracking-[0.14em] text-muted uppercase">{label}</span>
      {children}
      {hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
    </label>
  )
}
