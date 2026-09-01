import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test'

/**
 * Apoio da suíte.
 *
 * Prepara o cenário pela rota /api/local/seed, que só existe com o banco
 * local ligado e exige token. Nenhum teste depende de dado deixado por outro.
 */

export const SEED_TOKEN = 'suite-md-agenda'
export const TIMEZONE = 'America/Sao_Paulo'

export const ADMIN = {
  email: 'maicon@exemplo.test',
  senha: 'senha-de-teste-md',
}

export interface ServicoTeste {
  name: string
  description?: string | null
  priceCents: number
  durationMinutes: number
  active?: boolean
  sortOrder?: number
}

export const SERVICOS: ServicoTeste[] = [
  { name: 'Corte Degradê', description: 'Máquina e tesoura.', priceCents: 6000, durationMinutes: 40, sortOrder: 1 },
  { name: 'Barba', description: 'Toalha quente e navalha.', priceCents: 4000, durationMinutes: 30, sortOrder: 2 },
  { name: 'Corte + Barba', description: 'O combo completo.', priceCents: 9000, durationMinutes: 60, sortOrder: 3 },
]

export interface ExpedienteDia {
  weekday: number
  isOpen: boolean
  opensAt: string | null
  closesAt: string | null
  breakStart: string | null
  breakEnd: string | null
}

/** Semana inteira aberta: o cenário controla a disponibilidade, não o calendário. */
export const EXPEDIENTE_TESTE: ExpedienteDia[] = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  isOpen: true,
  opensAt: '09:00',
  closesAt: '19:00',
  breakStart: null,
  breakEnd: null,
}))

export interface AjustesTeste {
  slotIntervalMinutes: number
  minimumBookingNoticeMinutes: number
  bookingWindowDays: number
  cancelBeforeMinutes: number
  autoConfirmAppointments: boolean
  barberName: string
  barberTagline?: string | null
  barberPhotoUrl?: string | null
  businessName: string
  businessAddress?: string | null
  businessPhone?: string | null
  whatsappNumber: string
}

export const AJUSTES_TESTE: AjustesTeste = {
  slotIntervalMinutes: 30,
  minimumBookingNoticeMinutes: 60,
  bookingWindowDays: 30,
  cancelBeforeMinutes: 120,
  autoConfirmAppointments: false,
  barberName: 'Maicon',
  businessName: 'MD_agenda',
  whatsappNumber: '5512999999999',
}

/** "YYYY-MM-DD" no fuso da barbearia, deslocado em dias. */
export function dataEmSaoPaulo(offsetDias = 0, agora = new Date()): string {
  const formatador = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const hoje = formatador.format(agora)
  const [ano, mes, dia] = hoje.split('-').map(Number)
  const deslocado = new Date(Date.UTC(ano, mes - 1, dia + offsetDias))
  return deslocado.toISOString().slice(0, 10)
}

/** Instante UTC correspondente a uma data e hora de São Paulo. */
export function instanteEmSaoPaulo(data: string, hora: string): string {
  const [ano, mes, dia] = data.split('-').map(Number)
  const [h, m] = hora.split(':').map(Number)
  const palpite = Date.UTC(ano, mes - 1, dia, h, m)
  const deslocamento = (instante: number) => {
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(new Date(instante))
    const pegar = (tipo: string) => Number(partes.find((parte) => parte.type === tipo)?.value ?? 0)
    return (
      Date.UTC(pegar('year'), pegar('month') - 1, pegar('day'), pegar('hour'), pegar('minute'), pegar('second')) -
      instante
    )
  }
  let resultado = palpite - deslocamento(palpite)
  resultado = palpite - deslocamento(resultado)
  return new Date(resultado).toISOString()
}

export interface CenarioOpcoes {
  servicos?: ServicoTeste[]
  expediente?: ExpedienteDia[]
  ajustes?: Partial<AjustesTeste>
  bloqueios?: { startsAt: string; endsAt: string; reason?: string | null }[]
  agendamentos?: {
    customerName: string
    customerPhone: string
    serviceIndex: number
    startsAt: string
    durationMinutes: number
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
    notes?: string | null
  }[]
}

export async function prepararCenario(request: APIRequestContext, opcoes: CenarioOpcoes = {}) {
  const resposta = await request.post('/api/local/seed', {
    headers: { 'x-seed-token': SEED_TOKEN },
    data: {
      reset: true,
      services: opcoes.servicos ?? SERVICOS,
      hours: opcoes.expediente ?? EXPEDIENTE_TESTE,
      settings: { ...AJUSTES_TESTE, ...opcoes.ajustes },
      blocks: opcoes.bloqueios ?? [],
      appointments: opcoes.agendamentos ?? [],
    },
  })

  if (!resposta.ok()) {
    throw new Error(`Falha ao preparar cenário: ${resposta.status()} ${await resposta.text()}`)
  }

  return resposta.json() as Promise<{
    services: { id: string; name: string; durationMinutes: number }[]
    appointments: { id: string; code: string; startsAt: string }[]
  }>
}

/** Cria um agendamento pela API pública, como o navegador faria. */
export async function agendarPelaApi(
  request: APIRequestContext,
  dados: {
    serviceId: string
    date: string
    time: string
    customerName: string
    customerPhone: string
    notes?: string | null
  },
) {
  return request.post('/api/agendamentos', {
    data: { notes: null, ...dados },
  })
}

export async function horariosDisponiveis(
  request: APIRequestContext,
  serviceId: string,
  date: string,
) {
  const resposta = await request.get(
    `/api/disponibilidade?serviceId=${serviceId}&date=${date}`,
  )
  const corpo = await resposta.json()
  return (corpo.slots ?? []) as { time: string; available: boolean; reason: string | null }[]
}

/**
 * Preenche um campo controlado sem cair na corrida de hidratação: enquanto o
 * React não assumiu, o valor digitado é descartado no primeiro render.
 */
export async function preencher(campo: Locator, valor: string) {
  await expect(campo).toBeVisible()
  await expect(async () => {
    await campo.fill(valor)
    await expect(campo).not.toHaveValue('', { timeout: 500 })
  }).toPass({ timeout: 10_000 })
}

export async function entrarNoPainel(page: Page) {
  await page.goto('/admin/login')
  await preencher(page.getByTestId('admin-email'), ADMIN.email)
  await preencher(page.getByTestId('admin-senha'), ADMIN.senha)
  await page.getByTestId('admin-entrar').click()
  await page.waitForURL('**/admin')
}
