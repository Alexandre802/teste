import { expect, test } from '@playwright/test'
import {
  agendarPelaApi,
  dataEmSaoPaulo,
  horariosDisponiveis,
  instanteEmSaoPaulo,
  preencher,
  prepararCenario,
} from './apoio'

test.describe('consulta e cancelamento pelo cliente', () => {
  test('telefone e código abrem o agendamento e permitem cancelar', async ({ page, request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    const resposta = await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '09:30',
      customerName: 'Lucas Almeida',
      customerPhone: '12999994001',
    })
    expect(resposta.status()).toBe(201)
    const { appointment } = await resposta.json()

    await page.goto('/meus-agendamentos')
    await preencher(page.getByTestId('consulta-telefone'), '12999994001')
    await preencher(page.getByTestId('consulta-codigo'), appointment.code)
    await page.getByTestId('consulta-buscar').click()

    const resultado = page.getByTestId('consulta-resultado')
    await expect(resultado).toContainText('Corte Degradê')
    await expect(resultado).toContainText(appointment.code)

    await page.getByTestId('cancelar').first().click()
    await expect(page.getByText('Agendamento cancelado.')).toBeVisible()
    await expect(resultado).toContainText('Cancelado')

    // O horário volta a ser oferecido para outro cliente.
    const slots = await horariosDisponiveis(request, cenario.services[0].id, alvo)
    expect(slots.find((slot) => slot.time === '09:30')?.available).toBe(true)
  })

  test('telefone certo com código errado não abre agenda nenhuma', async ({ page, request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '10:00',
      customerName: 'Ana Paula Ribeiro',
      customerPhone: '12999995001',
    })

    await page.goto('/meus-agendamentos')
    await preencher(page.getByTestId('consulta-telefone'), '12999995001')
    await preencher(page.getByTestId('consulta-codigo'), 'MD-ZZZZZ')
    await page.getByTestId('consulta-buscar').click()

    await expect(
      page.getByText('Não encontramos um agendamento com esse telefone e código.'),
    ).toBeVisible()
    await expect(page.getByTestId('consulta-resultado')).toHaveCount(0)
  })

  test('dentro do prazo proibido, o cancelamento é recusado com orientação', async ({
    request,
  }) => {
    const daquiAPouco = new Date(Date.now() + 30 * 60_000).toISOString()

    const cenario = await prepararCenario(request, {
      agendamentos: [
        {
          customerName: 'Cliente Apressado',
          customerPhone: '12999996001',
          serviceIndex: 0,
          startsAt: daquiAPouco,
          durationMinutes: 40,
          status: 'confirmed',
        },
      ],
    })

    const codigo = cenario.appointments[0].code

    const consulta = await request.post('/api/agendamentos/consulta', {
      data: { phone: '12999996001', code: codigo },
    })
    expect(consulta.status()).toBe(200)
    const corpo = await consulta.json()
    expect(corpo.appointments[0].canCancel).toBe(false)

    const cancelamento = await request.post('/api/agendamentos/cancelar', {
      data: { phone: '12999996001', code: codigo },
    })
    expect(cancelamento.status()).toBe(409)
    expect((await cancelamento.json()).error).toBe('Entre em contato com Maicon para cancelar.')
  })

  test('o horário cancelado pelo cliente volta para a agenda', async ({ request }) => {
    const alvo = dataEmSaoPaulo(2)
    const cenario = await prepararCenario(request)

    const resposta = await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '17:00',
      customerName: 'Rafael Souza',
      customerPhone: '12999997001',
    })
    const { appointment } = await resposta.json()

    const antes = await horariosDisponiveis(request, cenario.services[0].id, alvo)
    expect(antes.find((slot) => slot.time === '17:00')?.available).toBe(false)

    const cancelamento = await request.post('/api/agendamentos/cancelar', {
      data: { phone: '12999997001', code: appointment.code },
    })
    expect(cancelamento.status()).toBe(200)

    const depois = await horariosDisponiveis(request, cenario.services[0].id, alvo)
    expect(depois.find((slot) => slot.time === '17:00')?.available).toBe(true)

    // Sanidade do apoio de fuso: o instante gravado bate com 17:00 local.
    expect(appointment.startsAt).toBe(instanteEmSaoPaulo(alvo, '17:00'))
  })
})
