import { expect, test } from '@playwright/test'
import {
  agendarPelaApi,
  dataEmSaoPaulo,
  horariosDisponiveis,
  preencher,
  prepararCenario,
} from './apoio'

test.describe('agendamento do cliente', () => {
  test('marca um horário do começo ao fim e o horário some da agenda', async ({
    page,
    request,
  }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    await page.goto('/')

    // 1. Serviço
    await page.getByTestId('servico').first().click()
    await expect(page.getByTestId('servico').first()).toHaveAttribute('data-selected', 'true')

    // 2. Data
    await page.locator(`[data-testid="data"][data-date="${alvo}"]`).click()

    // 3. Horário
    const horario = page.locator('[data-testid="horario"][data-available="true"]').first()
    await expect(horario).toBeVisible()
    const horaEscolhida = await horario.getAttribute('data-time')
    await horario.click()

    // 4. Dados
    await preencher(page.getByTestId('campo-nome'), 'João da Silva')
    await preencher(page.getByTestId('campo-telefone'), '12999990001')
    await preencher(page.getByTestId('campo-observacao'), 'Manter o topo mais comprido.')

    // Resumo antes de confirmar
    const resumo = page.getByTestId('resumo')
    await expect(resumo).toContainText('Corte Degradê')
    await expect(resumo).toContainText('R$ 60,00')
    await expect(resumo).toContainText('(12) 99999-0001')

    // 5. Confirmação
    await page.getByTestId('confirmar').click()

    const sucesso = page.getByTestId('sucesso')
    await expect(sucesso).toBeVisible()
    await expect(sucesso).toContainText('Horário solicitado')
    await expect(sucesso).toContainText('João da Silva')
    await expect(page.getByTestId('codigo')).toHaveText(/^MD-[A-Z0-9]{5}$/)

    // O horário reservado não volta a ser oferecido.
    const slots = await horariosDisponiveis(request, cenario.services[0].id, alvo)
    const reservado = slots.find((slot) => slot.time === horaEscolhida)
    expect(reservado?.available).toBe(false)
    expect(reservado?.reason).toBe('busy')
  })

  test('mostra o horário ocupado desabilitado, sem sumir da tela', async ({ page, request }) => {
    const cenario = await prepararCenario(request)
    const alvo = dataEmSaoPaulo(3)

    const resposta = await agendarPelaApi(request, {
      serviceId: cenario.services[0].id,
      date: alvo,
      time: '10:00',
      customerName: 'Rafael Souza',
      customerPhone: '12999990002',
    })
    expect(resposta.status()).toBe(201)

    await page.goto('/')
    await page.getByTestId('servico').first().click()
    await page.locator(`[data-testid="data"][data-date="${alvo}"]`).click()

    const ocupado = page.locator('[data-testid="horario"][data-time="10:00"]')
    await expect(ocupado).toBeVisible()
    await expect(ocupado).toHaveAttribute('data-available', 'false')
    await expect(ocupado).toBeDisabled()
  })

  test('avisa quando o dia não tem horário livre e oferece outra data', async ({
    page,
    request,
  }) => {
    const alvo = dataEmSaoPaulo(4)

    // Dia fechado: nenhum horário existe para oferecer.
    await prepararCenario(request, {
      expediente: Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        isOpen: weekday !== new Date(`${alvo}T12:00:00Z`).getUTCDay(),
        opensAt: '09:00',
        closesAt: '19:00',
        breakStart: null,
        breakEnd: null,
      })),
    })

    await page.goto('/')
    await page.getByTestId('servico').first().click()

    const diaFechado = page.locator(`[data-testid="data"][data-date="${alvo}"]`)
    await expect(diaFechado).toBeDisabled()
  })

  test('recusa telefone inválido antes de enviar', async ({ page, request }) => {
    await prepararCenario(request)
    const alvo = dataEmSaoPaulo(2)

    await page.goto('/')
    await page.getByTestId('servico').first().click()
    await page.locator(`[data-testid="data"][data-date="${alvo}"]`).click()
    await page.locator('[data-testid="horario"][data-available="true"]').first().click()

    await preencher(page.getByTestId('campo-nome'), 'Ana Paula Ribeiro')
    await preencher(page.getByTestId('campo-telefone'), '1299')
    await page.getByTestId('confirmar').click()

    await expect(page.getByText('Informe um telefone válido com DDD.')).toBeVisible()
    await expect(page.getByTestId('sucesso')).toHaveCount(0)
  })
})
