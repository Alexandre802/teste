import { UsersRound } from 'lucide-react'
import { getStore } from '@/lib/db'
import { formatPhoneBR, initials, toInternationalPhone } from '@/lib/format'
import { formatDateBR, toDateStr } from '@/lib/time'
import { EmptyState } from '@/components/ui/Feedback'

export const dynamic = 'force-dynamic'

/**
 * Clientes.
 *
 * A lista se monta sozinha a partir dos agendamentos — ninguém cadastra
 * cliente à mão, e não existe CRM paralelo para manter atualizado.
 */
export default async function ClientesPage() {
  const store = getStore()
  const [customers, settings] = await Promise.all([store.listCustomers(), store.getSettings()])

  return (
    <div className="mx-auto max-w-3xl py-6">
      <header className="mb-5">
        <h1 className="text-[24px] leading-tight text-display">Clientes</h1>
        <p className="mt-1 text-[13px] text-muted">
          {customers.length === 0
            ? 'A lista se monta sozinha conforme os agendamentos chegam.'
            : `${customers.length} ${customers.length === 1 ? 'pessoa já agendou' : 'pessoas já agendaram'}.`}
        </p>
      </header>

      {customers.length === 0 ? (
        <EmptyState
          title="Nenhum cliente ainda."
          description="Cada agendamento novo entra automaticamente nesta lista."
          icon={<UsersRound size={24} aria-hidden />}
        />
      ) : (
        <ul className="grid gap-2.5">
          {customers.map((customer) => (
            <li key={customer.phone} className="surface-card flex items-center gap-3.5 px-4 py-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-gold text-[13px] font-medium text-gold">
                {initials(customer.name)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] text-ink">{customer.name}</p>
                <a
                  href={`https://wa.me/${toInternationalPhone(customer.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-muted underline-offset-4 hover:text-gold hover:underline"
                >
                  {formatPhoneBR(customer.phone)}
                </a>
              </div>

              <div className="text-right">
                <p className="text-[13px] text-ink tabular-nums">
                  {customer.appointmentCount}{' '}
                  <span className="text-muted">
                    {customer.appointmentCount === 1 ? 'visita' : 'visitas'}
                  </span>
                </p>
                <p className="text-[12px] text-muted">
                  {customer.lastVisit
                    ? formatDateBR(toDateStr(new Date(customer.lastVisit), settings.timezone))
                    : '—'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
