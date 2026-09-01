import { expect, test } from '@playwright/test'
import { agendarPelaApi, dataEmSaoPaulo, prepararCenario, SEED_TOKEN } from './apoio'

test.describe('proteção das rotas', () => {
  test('recusa payload adulterado no agendamento', async ({ request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)
    const serviceId = cenario.services[0].id

    const semServico = await request.post('/api/agendamentos', {
      data: {
        serviceId: 'nao-e-uuid',
        date: alvo,
        time: '10:00',
        customerName: 'Teste da Silva',
        customerPhone: '12999960001',
      },
    })
    expect(semServico.status()).toBe(400)

    const servicoInexistente = await agendarPelaApi(request, {
      serviceId: '00000000-0000-4000-8000-000000000000',
      date: alvo,
      time: '10:00',
      customerName: 'Teste da Silva',
      customerPhone: '12999960002',
    })
    expect(servicoInexistente.status()).toBe(404)

    const telefoneInvalido = await agendarPelaApi(request, {
      serviceId,
      date: alvo,
      time: '10:00',
      customerName: 'Teste da Silva',
      customerPhone: '123',
    })
    expect(telefoneInvalido.status()).toBe(400)

    const nomeCurto = await agendarPelaApi(request, {
      serviceId,
      date: alvo,
      time: '10:00',
      customerName: 'A',
      customerPhone: '12999960003',
    })
    expect(nomeCurto.status()).toBe(400)

    const foraDoExpediente = await agendarPelaApi(request, {
      serviceId,
      date: alvo,
      time: '23:00',
      customerName: 'Teste da Silva',
      customerPhone: '12999960004',
    })
    expect(foraDoExpediente.status()).toBe(409)

    const noPassado = await agendarPelaApi(request, {
      serviceId,
      date: dataEmSaoPaulo(-3),
      time: '10:00',
      customerName: 'Teste da Silva',
      customerPhone: '12999960005',
    })
    expect(noPassado.status()).toBe(409)

    const foraDaJanela = await agendarPelaApi(request, {
      serviceId,
      date: dataEmSaoPaulo(200),
      time: '10:00',
      customerName: 'Teste da Silva',
      customerPhone: '12999960006',
    })
    expect(foraDaJanela.status()).toBe(409)
  })

  test('o servidor usa o preço do catálogo, não o que o cliente enviar', async ({ request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    const resposta = await request.post('/api/agendamentos', {
      data: {
        serviceId: cenario.services[0].id,
        date: alvo,
        time: '09:00',
        customerName: 'Esperto da Silva',
        customerPhone: '12999961001',
        notes: null,
        servicePriceSnapshot: 1,
        serviceDurationSnapshot: 5,
        status: 'confirmed',
        code: 'MD-FRAUD',
      },
    })

    expect(resposta.status()).toBe(201)
    const corpo = await resposta.json()
    expect(corpo.appointment.servicePriceSnapshot).toBe(6000)
    expect(corpo.appointment.serviceDurationSnapshot).toBe(40)
    expect(corpo.appointment.status).toBe('pending')
    expect(corpo.appointment.code).not.toBe('MD-FRAUD')
  })

  test('a consulta não devolve agenda alheia', async ({ request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    const criado = await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '11:00',
      customerName: 'Fernanda Lopes',
      customerPhone: '12999962001',
    })
    const { appointment } = await criado.json()

    // Código certo, telefone de outra pessoa.
    const outroTelefone = await request.post('/api/agendamentos/consulta', {
      data: { phone: '12999962999', code: appointment.code },
    })
    expect(outroTelefone.status()).toBe(404)

    // Telefone certo, sem o código.
    const semCodigo = await request.post('/api/agendamentos/consulta', {
      data: { phone: '12999962001', code: '' },
    })
    expect(semCodigo.status()).toBe(400)
  })

  test('texto gigante é recusado antes de chegar ao banco', async ({ request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    const resposta = await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '09:00',
      customerName: 'Teste da Silva',
      customerPhone: '12999963001',
      notes: 'x'.repeat(5000),
    })
    expect(resposta.status()).toBe(400)
  })

  test('a rota de preparo local exige token', async ({ request }) => {
    const semToken = await request.post('/api/local/seed', { data: { reset: true } })
    expect(semToken.status()).toBe(401)

    const tokenErrado = await request.post('/api/local/seed', {
      headers: { 'x-seed-token': 'errado' },
      data: { reset: true },
    })
    expect(tokenErrado.status()).toBe(401)

    const correto = await request.post('/api/local/seed', {
      headers: { 'x-seed-token': SEED_TOKEN },
      data: { reset: true },
    })
    expect(correto.status()).toBe(200)
  })

  test('o webhook do WhatsApp recusa verificação sem token configurado', async ({ request }) => {
    const resposta = await request.get(
      '/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=qualquer&hub.challenge=123',
    )
    // Sem WHATSAPP_VERIFY_TOKEN no ambiente, a rota falha fechada.
    expect([403, 503]).toContain(resposta.status())
    expect(await resposta.text()).not.toBe('123')
  })

  test('o painel não é servido sem sessão', async ({ request }) => {
    for (const rota of ['/admin', '/admin/agenda', '/admin/clientes', '/admin/servicos', '/admin/configuracoes']) {
      const resposta = await request.get(rota, { maxRedirects: 0 })
      expect([307, 308, 302]).toContain(resposta.status())
      expect(resposta.headers().location).toContain('/admin/login')
    }
  })

  test('o excesso de tentativas é barrado', async ({ request }) => {
    await prepararCenario(request)

    const respostas = []
    for (let tentativa = 0; tentativa < 16; tentativa += 1) {
      respostas.push(
        await request.post('/api/agendamentos/consulta', {
          data: { phone: '12999964001', code: `MD-A${tentativa}000` },
        }),
      )
    }

    expect(respostas.some((resposta) => resposta.status() === 429)).toBe(true)
  })
})
