import { getStore } from '@/lib/db'
import { ServicesManager } from '@/components/admin/ServicesManager'

export const dynamic = 'force-dynamic'

export default async function ServicosPage() {
  const services = await getStore().listServices(true)

  return (
    <div className="mx-auto max-w-3xl py-6">
      <header className="mb-5">
        <h1 className="text-[24px] leading-tight text-display">Serviços</h1>
        <p className="mt-1 text-[13px] text-muted">
          Preço e duração daqui valem para os próximos agendamentos. Os já marcados mantêm o valor
          combinado no dia.
        </p>
      </header>

      <ServicesManager services={services} />
    </div>
  )
}
