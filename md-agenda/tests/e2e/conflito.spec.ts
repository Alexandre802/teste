import { expect, test } from '@playwright/test'
import { agendarPelaApi, dataEmSaoPaulo, prepararCenario } from './apoio'

test.describe('proteção contra agendamento duplo', () => {
  test('dois pedidos simultâneos no mesmo horário: só um passa', async ({ request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    const base = {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '11:00',
    }

    const [primeiro, segundo] = await Promise.all([
      agendarPelaApi(request, {
        ...base,
        customerName: 'Cliente Um',
        customerPhone: '12999991001',
      }),
      agendarPelaApi(request, {
        ...base,
        customerName: 'Cliente Dois',
        customerPhone: '12999991002',
      }),
    ])

    const status = [primeiro.status(), segundo.status()].sort()
    expect(status).toEqual([201, 409])

    const recusado = primeiro.status() === 409 ? primeiro : segundo
    const corpo = await recusado.json()
    expect(corpo.error).toBe('Esse horário acabou de ser reservado. Escolha outro horário.')
  })

  test('tentar o mesmo horário depois recebe conflito, não um segundo agendamento', async ({
    request,
  }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    const primeiro = await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '14:00',
      customerName: 'Diego Martins',
      customerPhone: '12999992001',
    })
    expect(primeiro.status()).toBe(201)

    const segundo = await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '14:00',
      customerName: 'Lucas Almeida',
      customerPhone: '12999992002',
    })
    expect(segundo.status()).toBe(409)
  })

  test('serviço longo não começa em cima de um horário já ocupado', async ({ request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    // Barba (30 min) às 15:30 ocupa até 16:00.
    const barba = await agendarPelaApi(request, {
      serviceId: cenario.services[1].id,
      date: alvo,
      time: '15:30',
      customerName: 'Pedro Henrique',
      customerPhone: '12999993001',
    })
    expect(barba.status()).toBe(201)

    // Corte + Barba (60 min) às 15:00 iria até 16:00 e invadiria o horário acima.
    const combo = await agendarPelaApi(request, {
      serviceId: cenario.services[2].id,
      date: alvo,
      time: '15:00',
      customerName: 'Marcos Vinícius',
      customerPhone: '12999993002',
    })
    expect(combo.status()).toBe(409)

    // Às 16:00 o mesmo combo cabe, porque encosta sem sobrepor.
    const depois = await agendarPelaApi(request, {
      serviceId: cenario.services[2].id,
      date: alvo,
      time: '16:00',
      customerName: 'Marcos Vinícius',
      customerPhone: '12999993002',
    })
    expect(depois.status()).toBe(201)
  })
})
