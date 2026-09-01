import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPublicSettings } from '@/lib/settings'
import { SiteHeader } from '@/components/client/SiteHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: 'Como o MD_agenda usa nome, telefone e dados do agendamento.',
  alternates: { canonical: '/politica-de-privacidade' },
}

/**
 * Política de privacidade.
 *
 * Descreve exatamente o que o sistema faz — nada de CNPJ, razão social ou
 * encarregado de dados inventados. Onde falta informação da barbearia, o
 * texto diz que ela deve ser preenchida.
 */
export default async function PoliticaPage() {
  const settings = await getPublicSettings()

  return (
    <div className="mx-auto max-w-lg px-4 pb-16">
      <SiteHeader businessName={settings.businessName} />

      <div className="pt-7 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} aria-hidden />
          Voltar ao início
        </Link>
        <h1 className="mt-4 text-[28px] leading-tight text-display">Política de privacidade</h1>
      </div>

      <div className="grid gap-6 text-[14px] leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 text-[15px] font-medium text-ink">O que coletamos</h2>
          <p>
            Para marcar um horário pedimos <span className="text-ink">nome completo</span> e{' '}
            <span className="text-ink">telefone/WhatsApp</span>. A{' '}
            <span className="text-ink">observação</span> é opcional e só existe se você escrever
            alguma coisa. Guardamos também o serviço escolhido, a data, o horário, o valor vigente
            no momento do agendamento e o código gerado.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-ink">Para que usamos</h2>
          <p>
            Esses dados servem para reservar o seu horário, avisar {settings.barberName} e permitir
            que você consulte ou cancele o agendamento depois. Não usamos para publicidade, não
            vendemos e não repassamos para terceiros que não participem do atendimento.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-ink">WhatsApp</h2>
          <p>
            O resumo do seu agendamento é enviado para {settings.barberName} pelo WhatsApp. Quando o
            envio acontece pelo link <code className="text-ink">wa.me</code>, é o seu próprio
            aplicativo que abre a conversa. Nesse trajeto valem também os termos e a política de
            privacidade do WhatsApp.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-ink">Quem tem acesso</h2>
          <p>
            Só {settings.barberName}, autenticado no painel administrativo. A área pública do site
            não lista agendamentos: para ver um horário é preciso o telefone{' '}
            <span className="text-ink">e</span> o código daquele agendamento.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-ink">Cookies</h2>
          <p>
            A área do cliente não usa cookie de rastreamento. Guardamos seu nome e telefone no
            armazenamento local do próprio navegador, só para não pedir tudo de novo no próximo
            agendamento — limpar os dados do site apaga isso. O painel administrativo usa um cookie
            de sessão, necessário para manter o login.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-ink">Seus direitos</h2>
          <p>
            Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento. O pedido
            deve ser feito diretamente à barbearia
            {settings.businessPhone ? (
              <>
                , pelo telefone <span className="text-ink">{settings.businessPhone}</span>
              </>
            ) : null}
            .
          </p>
        </section>

        <section className="rounded-[12px] border border-line px-4 py-3.5">
          <p className="text-[13px]">
            Esta política descreve o funcionamento do sistema. Os dados de identificação da empresa
            responsável — razão social, CNPJ e canal de atendimento ao titular — devem ser
            preenchidos pela barbearia antes de o site ir ao ar.
          </p>
        </section>
      </div>
    </div>
  )
}
