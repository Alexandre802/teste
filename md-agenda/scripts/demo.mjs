/**
 * Sobe o MD_agenda pronto para experimentar, em um comando.
 *
 * Liga o banco local em memória, espera o servidor responder e semeia um
 * cenário de EXEMPLO — expediente, serviços e preços fictícios, os mesmos de
 * supabase/seed-exemplo.sql. Nada aqui é dado real da barbearia.
 *
 * Enquanto roda, a própria interface avisa na tela que os dados não são
 * permanentes. Com Supabase configurado no .env.local, o script não semeia
 * nada e apenas sobe o servidor contra o banco de verdade.
 */

import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const PORT = process.env.PORT ?? '3000'
const BASE = `http://127.0.0.1:${PORT}`
const TOKEN = randomUUID()

const ADMIN = {
  email: 'maicon@demo.local',
  senha: 'demo-md-agenda',
}

// EXEMPLO. Substituir por informação confirmada antes de abrir para clientes.
const EXPEDIENTE = [
  { weekday: 0, isOpen: false, opensAt: null, closesAt: null, breakStart: null, breakEnd: null },
  { weekday: 1, isOpen: false, opensAt: null, closesAt: null, breakStart: null, breakEnd: null },
  { weekday: 2, isOpen: true, opensAt: '09:00', closesAt: '19:00', breakStart: '12:00', breakEnd: '13:00' },
  { weekday: 3, isOpen: true, opensAt: '09:00', closesAt: '19:00', breakStart: '12:00', breakEnd: '13:00' },
  { weekday: 4, isOpen: true, opensAt: '09:00', closesAt: '19:00', breakStart: '12:00', breakEnd: '13:00' },
  { weekday: 5, isOpen: true, opensAt: '09:00', closesAt: '20:00', breakStart: '12:00', breakEnd: '13:00' },
  { weekday: 6, isOpen: true, opensAt: '09:00', closesAt: '18:00', breakStart: null, breakEnd: null },
]

const SERVICOS = [
  { name: 'Corte Degradê', description: 'Máquina e tesoura, acabamento na navalha.', priceCents: 6000, durationMinutes: 40, sortOrder: 1 },
  { name: 'Barba', description: 'Toalha quente, navalha e finalização.', priceCents: 4000, durationMinutes: 30, sortOrder: 2 },
  { name: 'Corte + Barba', description: 'O combo completo, em uma sessão só.', priceCents: 9000, durationMinutes: 60, sortOrder: 3 },
]

const servidor = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['next', 'dev', '--port', PORT],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      MD_AGENDA_LOCAL_STORE: '1',
      MD_AGENDA_LOCAL_STORE_TOKEN: TOKEN,
      MD_AGENDA_LOCAL_ADMIN_EMAIL: ADMIN.email,
      MD_AGENDA_LOCAL_ADMIN_PASSWORD: ADMIN.senha,
      MD_AGENDA_LOCAL_ADMIN_SECRET: randomUUID(),
      NEXT_PUBLIC_SITE_URL: BASE,
    },
  },
)

servidor.on('exit', (codigo) => process.exit(codigo ?? 0))

for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.on(sinal, () => {
    servidor.kill(sinal)
  })
}

async function esperarServidor() {
  for (let tentativa = 0; tentativa < 90; tentativa += 1) {
    try {
      const resposta = await fetch(`${BASE}/api/servicos`, { cache: 'no-store' })
      if (resposta.status < 500 || resposta.status === 503) return true
    } catch {
      // Ainda subindo.
    }
    await new Promise((resolva) => setTimeout(resolva, 1000))
  }
  return false
}

async function semear() {
  const resposta = await fetch(`${BASE}/api/local/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-seed-token': TOKEN },
    body: JSON.stringify({
      reset: true,
      services: SERVICOS,
      hours: EXPEDIENTE,
      settings: {
        barberName: 'Maicon',
        barberTagline: 'Barbeiro',
        businessName: 'MD_agenda',
        slotIntervalMinutes: 30,
        minimumBookingNoticeMinutes: 60,
        bookingWindowDays: 30,
        cancelBeforeMinutes: 120,
        autoConfirmAppointments: false,
      },
    }),
  })
  return resposta
}

const linha = '─'.repeat(58)

async function principal() {
  if (!(await esperarServidor())) {
    console.error('\nO servidor não respondeu a tempo.')
    servidor.kill('SIGTERM')
    return
  }

  const resposta = await semear()

  console.log(`\n${linha}`)

  if (resposta.status === 404) {
    console.log('  Supabase configurado no .env.local — usando o banco real.')
    console.log('  Nenhum dado de exemplo foi criado.')
    console.log(`\n  Cliente: ${BASE}`)
    console.log(`  Painel:  ${BASE}/admin  (entre com o usuário do Supabase Auth)`)
  } else if (!resposta.ok) {
    console.log(`  Não consegui semear o cenário de exemplo (HTTP ${resposta.status}).`)
    console.log(`  O servidor está de pé em ${BASE}; configure pelo painel.`)
  } else {
    console.log('  MD_agenda no ar, com dados de EXEMPLO.')
    console.log('')
    console.log(`  Agendar:  ${BASE}`)
    console.log(`  Consulta: ${BASE}/meus-agendamentos`)
    console.log(`  Painel:   ${BASE}/admin`)
    console.log('')
    console.log(`     e-mail: ${ADMIN.email}`)
    console.log(`     senha:  ${ADMIN.senha}`)
    console.log('')
    console.log('  Expediente, serviços e preços acima são FICTÍCIOS, e os')
    console.log('  agendamentos vivem só na memória: somem ao parar o servidor.')
  }

  console.log(`${linha}\n`)
}

principal()
