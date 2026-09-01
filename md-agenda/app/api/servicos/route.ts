import { getStore, storeKindOrNull } from '@/lib/db'
import { handleRouteError, jsonError, jsonOk } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!storeKindOrNull()) {
    return jsonError('O agendamento ainda não está disponível: banco não configurado.', 503)
  }
  try {
    const services = await getStore().listServices()
    return jsonOk({ services })
  } catch (error) {
    return handleRouteError('GET /api/servicos', error)
  }
}
