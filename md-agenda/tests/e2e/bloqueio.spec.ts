import { expect, test } from '@playwright/test'
import {
  agendarPelaApi,
  dataEmSaoPaulo,
  entrarNoPainel,
  horariosDisponiveis,
  instanteEmSaoPaulo,
  preencher,
  prepararCenario,
} from './apoio'

test.describe('bloqueio de agenda', () => {
  test('bloqueio criado no painel some da tela do cliente na hora', async ({ page, request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    const antes = await horariosDisponiveis(request, cenario.services[0].id, alvo)
    expect(antes.find((slot) => slot.time === '14:00')?.available).toBe(true)

    await entrarNoPainel(page)
    await page.goto(`/admin/agenda?view=hoje&date=${alvo}`)

    const bloqueios = page.getByRole('region', { name: 'Bloquear horários' })
    await preencher(bloqueios.locator('input[name="date"]'), alvo)
    await bloqueios.locator('input[name="startTime"]').fill('14:00')
    await bloqueios.locator('input[name="endTime"]').fill('16:00')
    await preencher(bloqueios.locator('input[name="reason"]'), 'Compromisso')
    await page.getByTestId('criar-bloqueio').click()

    await expect(page.getByText('Compromisso')).toBeVisible()

    const depois = await horariosDisponiveis(request, cenario.services[0].id, alvo)
    expect(depois.find((slot) => slot.time === '14:00')?.reason).toBe('blocked')
    expect(depois.find((slot) => slot.time === '15:00')?.reason).toBe('blocked')
    expect(depois.find((slot) => slot.time === '16:00')?.available).toBe(true)

    // E a API recusa quem tentar forçar o horário bloqueado.
    const tentativa = await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '14:00',
      customerName: 'Cliente Insistente',
      customerPhone: '12999970001',
    })
    expect(tentativa.status()).toBe(409)
    expect((await tentativa.json()).error).toContain('bloqueou')
  })

  test('bloqueio de dia inteiro deixa a data sem horário', async ({ request }) => {
    const alvo = dataEmSaoPaulo(3)
    const cenario = await prepararCenario(request, {
      bloqueios: [
        {
          startsAt: instanteEmSaoPaulo(alvo, '00:00'),
          endsAt: instanteEmSaoPaulo(alvo, '23:59'),
          reason: 'Folga',
        },
      ],
    })

    const slots = await horariosDisponiveis(request, cenario.services[0].id, alvo)
    expect(slots.length).toBeGreaterThan(0)
    expect(slots.every((slot) => !slot.available)).toBe(true)
  })

  test('intervalo do expediente fecha o horário do almoço', async ({ request }) => {
    const alvo = dataEmSaoPaulo(2)
    const cenario = await prepararCenario(request, {
      expediente: Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        isOpen: true,
        opensAt: '09:00',
        closesAt: '19:00',
        breakStart: '12:00',
        breakEnd: '13:00',
      })),
    })

    const slots = await horariosDisponiveis(request, cenario.services[0].id, alvo)
    expect(slots.find((slot) => slot.time === '12:00')?.reason).toBe('break')
    expect(slots.find((slot) => slot.time === '11:30')?.reason).toBe('break')
    expect(slots.find((slot) => slot.time === '13:00')?.available).toBe(true)
  })
})
