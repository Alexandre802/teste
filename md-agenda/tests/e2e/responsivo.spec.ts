import { expect, test } from '@playwright/test'
import { dataEmSaoPaulo, prepararCenario } from './apoio'

const LARGURAS = [360, 375, 390, 430, 768, 1280, 1920]

test.describe('responsividade e PWA', () => {
  test('nenhuma largura entre 360 e 1920 gera rolagem horizontal', async ({ page, request }) => {
    await prepararCenario(request)

    for (const largura of LARGURAS) {
      await page.setViewportSize({ width: largura, height: 900 })
      await page.goto('/')
      await page.getByTestId('servico').first().click()
      await page.locator(`[data-testid="data"][data-date="${dataEmSaoPaulo(2)}"]`).click()
      await expect(page.locator('[data-testid="horario"]').first()).toBeVisible()

      const transbordo = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(transbordo, `largura ${largura}px`).toBeLessThanOrEqual(1)
    }
  })

  test('o painel também se comporta de 360 a 1920', async ({ page, request }) => {
    await prepararCenario(request)

    for (const largura of [360, 390, 1280, 1920]) {
      await page.setViewportSize({ width: largura, height: 900 })
      await page.goto('/admin/login')
      const transbordo = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(transbordo, `largura ${largura}px`).toBeLessThanOrEqual(1)
    }
  })

  test('os alvos de toque têm tamanho confortável no celular', async ({ page, request }) => {
    await prepararCenario(request)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByTestId('servico').first().click()
    await page.locator(`[data-testid="data"][data-date="${dataEmSaoPaulo(2)}"]`).click()

    const horario = page.locator('[data-testid="horario"]').first()
    const caixa = await horario.boundingBox()
    expect(caixa!.height).toBeGreaterThanOrEqual(44)

    const confirmar = page.locator('[data-testid="horario"][data-available="true"]').first()
    const caixaConfirmar = await confirmar.boundingBox()
    expect(caixaConfirmar!.width).toBeGreaterThanOrEqual(44)
  })

  test('o manifesto do PWA descreve um aplicativo instalável', async ({ request }) => {
    const resposta = await request.get('/manifest.webmanifest')
    expect(resposta.status()).toBe(200)

    const manifesto = await resposta.json()
    expect(manifesto.display).toBe('standalone')
    expect(manifesto.theme_color).toBe('#070d14')
    expect(manifesto.background_color).toBe('#070d14')
    expect(manifesto.start_url).toBe('/')

    const tamanhos = manifesto.icons.map((icone: { sizes: string }) => icone.sizes)
    expect(tamanhos).toContain('192x192')
    expect(tamanhos).toContain('512x512')
    expect(
      manifesto.icons.some((icone: { purpose?: string }) => icone.purpose === 'maskable'),
    ).toBe(true)
  })

  test('os ícones e o service worker são servidos de verdade', async ({ request }) => {
    for (const rota of ['/icons/192', '/icons/512', '/icons/maskable-512']) {
      const resposta = await request.get(rota)
      expect(resposta.status(), rota).toBe(200)
      expect(resposta.headers()['content-type'], rota).toContain('image/png')
    }

    const sw = await request.get('/sw.js')
    expect(sw.status()).toBe(200)
    const corpo = await sw.text()
    // O service worker não pode guardar criação de agendamento em cache.
    expect(corpo).toContain("'/api/'")
    expect(corpo).toContain("'/admin'")
  })

  test('a página pública traz SEO e dados estruturados sem inventar informação', async ({
    page,
    request,
  }) => {
    await prepararCenario(request)
    await page.goto('/')

    await expect(page).toHaveTitle(/MD_agenda/)
    const descricao = page.locator('meta[name="description"]')
    await expect(descricao).toHaveAttribute('content', /Escolha o serviço/)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    const dados = JSON.parse(jsonLd ?? '{}')
    expect(dados['@type']).toBe('BarberShop')
    expect(dados.name).toBe('MD_agenda')
    // Endereço e telefone não foram confirmados: não podem aparecer.
    expect(dados.address).toBeUndefined()
    expect(dados.telephone).toBeUndefined()

    const robots = await request.get('/robots.txt')
    expect(await robots.text()).toContain('Disallow: /admin')

    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).toContain('/meus-agendamentos')
  })

  test('quem desliga animação continua conseguindo agendar', async ({ browser, request }) => {
    const cenario = await prepararCenario(request)
    const contexto = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await contexto.newPage()

    await page.goto('/')
    await page.getByTestId('servico').first().click()
    await page.locator(`[data-testid="data"][data-date="${dataEmSaoPaulo(2)}"]`).click()
    await expect(page.locator('[data-testid="horario"][data-available="true"]').first()).toBeVisible()

    expect(cenario.services.length).toBeGreaterThan(0)
    await contexto.close()
  })
})
