import { getStore } from '@/lib/db'
import { isWhatsappCloudApiConfigured, whatsappNumber } from '@/lib/config'
import { Alert } from '@/components/ui/Feedback'
import { StoreNotice } from '@/components/ui/StoreNotice'
import { BusinessHoursForm } from '@/components/admin/BusinessHoursForm'
import { SettingsForm } from '@/components/admin/SettingsForm'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const store = getStore()
  const [settings, hours] = await Promise.all([store.getSettings(), store.listBusinessHours()])

  const hasOpenDay = hours.some((hour) => hour.isOpen)
  const destination = settings.whatsappNumber ?? whatsappNumber()

  return (
    <div className="mx-auto max-w-3xl py-6">
      <header className="mb-5">
        <h1 className="text-[24px] leading-tight text-display">Configurações</h1>
        <p className="mt-1 text-[13px] text-muted">
          Tudo que o site mostra ao cliente sai daqui. Nada é preenchido por suposição.
        </p>
      </header>

      <div className="grid gap-7">
        <StoreNotice />

        {!hasOpenDay ? (
          <Alert tone="warning" title="A agenda ainda está fechada">
            Nenhum dia da semana está marcado como aberto, então o site não oferece horário nenhum.
            Marque os dias de atendimento abaixo.
          </Alert>
        ) : null}

        {!destination ? (
          <Alert tone="warning" title="Sem WhatsApp de destino">
            Sem um número configurado, o botão de enviar o pedido pelo WhatsApp não aparece para o
            cliente. Preencha o campo abaixo ou a variável <code>MAICON_WHATSAPP_NUMBER</code>.
          </Alert>
        ) : null}

        <Alert tone="info" title="Envio pelo WhatsApp">
          {isWhatsappCloudApiConfigured()
            ? 'A Cloud API está configurada: o resumo é enviado automaticamente e o link wa.me continua como reserva.'
            : 'A Cloud API não está configurada. O pedido chega pelo link wa.me, que funciona sem credencial nenhuma.'}
        </Alert>

        <section aria-labelledby="expediente">
          <h2 id="expediente" className="rule-label mb-3">
            Expediente
          </h2>
          <BusinessHoursForm hours={hours} />
        </section>

        <section aria-labelledby="regras">
          <h2 id="regras" className="rule-label mb-3">
            Regras e identidade
          </h2>
          <SettingsForm settings={settings} />
        </section>
      </div>
    </div>
  )
}
