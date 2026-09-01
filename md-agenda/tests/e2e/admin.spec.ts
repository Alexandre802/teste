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

test.describe('painel do barbeiro', () => {
  test('sem sessão o painel não abre e nem entrega dado no HTML', async ({ page }) => {
    const resposta = await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
    expect(await resposta?.text()).not.toContain('Agenda de hoje')
  })

  test('recusa senha errada', async ({ page, request }) => {
    await prepararCenario(request)
    await page.goto('/admin/login')
    await preencher(page.getByTestId('admin-email'), 'maicon@exemplo.test')
    await preencher(page.getByTestId('admin-senha'), 'senha-errada')
    await page.getByTestId('admin-entrar').click()

    await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible()
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('vê o agendamento novo, confirma e reagenda', async ({ page, request }) => {
    const hoje = dataEmSaoPaulo(0)

    // Um agendamento de hoje, para cair na agenda do dia.
    const cenario = await prepararCenario(request, {
      agendamentos: [
        {
          customerName: 'Diego Martins',
          customerPhone: '12999998001',
          serviceIndex: 0,
          startsAt: instanteEmSaoPaulo(hoje, '09:00'),
          durationMinutes: 40,
          status: 'pending',
          notes: 'Cliente novo.',
        },
      ],
    })

    await entrarNoPainel(page)

    const linha = page.getByTestId('agendamento').first()
    await expect(linha).toContainText('Diego Martins')
    await expect(linha).toContainText('Aguardando')

    await linha.getByRole('button').first().click()
    await expect(linha).toContainText('Cliente novo.')
    await expect(linha).toContainText('(12) 99999-8001')

    await linha.getByTestId('acao-confirmed').click()
    await expect(page.getByTestId('agendamento').first()).toContainText('Confirmado')

    // Reagendar para outro dia, pelo mesmo motor de disponibilidade.
    // A confirmação acabou de revalidar a página; recarregar evita disputar
    // o DOM com a atualização em andamento.
    await page.reload()
    const outroDia = dataEmSaoPaulo(3)
    const atualizada = page.getByTestId('agendamento').first()
    await atualizada.getByRole('button').first().click()
    const campoData = atualizada.locator('input[name="date"]')
    await expect(campoData).toBeVisible()
    await campoData.fill(outroDia)
    await atualizada.locator('input[name="time"]').fill('16:00')
    await atualizada.getByTestId('acao-reagendar').click()

    // Remarcado para outro dia, o agendamento sai da agenda de hoje.
    await expect(page.getByTestId('agendamento').filter({ hasText: 'Diego Martins' })).toHaveCount(
      0,
    )

    // E aparece no dia novo, com o horário já ocupado para os clientes.
    await page.goto(`/admin/agenda?view=hoje&date=${outroDia}`)
    await expect(page.getByTestId('agendamento').filter({ hasText: 'Diego Martins' })).toBeVisible()

    const slots = await horariosDisponiveis(request, cenario.services[0].id, outroDia)
    expect(slots.find((slot) => slot.time === '16:00')?.available).toBe(false)

    const slotsDeHoje = await horariosDisponiveis(request, cenario.services[0].id, hoje)
    expect(slotsDeHoje.find((slot) => slot.time === '09:00')?.reason).not.toBe('busy')
  })

  test('reagendar para cima de outro cliente é recusado', async ({ page, request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    const ocupando = await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '10:00',
      customerName: 'Rafael Souza',
      customerPhone: '12999999101',
    })
    expect(ocupando.status()).toBe(201)

    await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '14:00',
      customerName: 'Bruno Carvalho',
      customerPhone: '12999999102',
    })

    await entrarNoPainel(page)
    await page.goto(`/admin/agenda?view=hoje&date=${alvo}`)

    const linhaBruno = page.getByTestId('agendamento').filter({ hasText: 'Bruno Carvalho' })
    await linhaBruno.getByRole('button').first().click()
    await linhaBruno.locator('input[name="time"]').fill('10:00')
    await linhaBruno.getByTestId('acao-reagendar').click()

    await expect(page.getByText('Esse horário já está ocupado na agenda.')).toBeVisible()
  })

  test('cria serviço pelo painel e ele aparece para o cliente', async ({ page, request }) => {
    await prepararCenario(request, { servicos: [] })

    await entrarNoPainel(page)
    await page.goto('/admin/servicos')

    await page.getByTestId('novo-servico').click()
    await preencher(page.getByTestId('servico-nome'), 'Pezinho')
    await preencher(page.getByTestId('servico-preco'), '25,00')
    await preencher(page.getByTestId('servico-duracao'), '15')
    await page.getByTestId('salvar-servico').click()

    await expect(page.getByTestId('servico-admin')).toContainText('Pezinho')
    await expect(page.getByTestId('servico-admin')).toContainText('R$ 25,00')

    await page.goto('/')
    await expect(page.getByTestId('servico')).toContainText('Pezinho')
  })
})
