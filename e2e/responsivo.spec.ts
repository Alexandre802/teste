import { test, expect, type Page } from '@playwright/test';
import { abrirSacola, avancarAte, bloquearExternos, semearSacola } from './apoio';

/**
 * Responsividade e acessibilidade.
 *
 * A prioridade do projeto é o celular, então as larguras testadas são as
 * reais: 360 (Android popular), 375 (iPhone SE/13 mini), 390 (iPhone 14),
 * 430 (iPhone Pro Max) e as três de desktop.
 *
 * O que se prova aqui é o que estraga pedido: rolagem lateral, botão de
 * finalizar fora de alcance e gaveta maior que a tela.
 */

const CELULARES = [360, 375, 390, 430];
const MESAS = [1366, 1440, 1920];

/**
 * Mede a largura do conteúdo depois de o layout assentar de verdade.
 *
 * Esperar por tempo não serve: numa máquina carregada, 600 ms às vezes
 * bastam e às vezes não, e o teste vira moeda. Aqui a medição espera pelos
 * dois sinais que realmente mudam a largura — as fontes carregadas e dois
 * quadros de renderização — e só então lê.
 */
async function medirLargura(page: Page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const doc = document.documentElement;
    return { largura: doc.scrollWidth, janela: window.innerWidth };
  });
}

test.describe('sem rolagem lateral', () => {
  for (const largura of [...CELULARES, ...MESAS]) {
    test(`${largura}px`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 800 });
      await bloquearExternos(page);
      await page.goto('/');
      await page.waitForLoadState('load');
      // percorre a página inteira: seção que estoura costuma estar no meio
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // A repetição existe só para atravessar a hidratação do Next, que pode
      // destruir o contexto no meio de uma medição. A afirmação em si não
      // afrouxa: a largura do conteúdo tem que caber na janela.
      await expect(async () => {
        const { largura: conteudo, janela } = await medirLargura(page);
        // 1px de folga para arredondamento de subpixel
        expect(
          conteudo,
          `conteúdo de ${conteudo}px numa janela de ${janela}px`,
        ).toBeLessThanOrEqual(janela + 1);
      }).toPass({ timeout: 20_000 });
    });
  }
});

test.describe('a gaveta do pedido cabe na tela', () => {
  for (const largura of CELULARES) {
    test(`${largura}px: botão de continuar alcançável`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 740 });
      await semearSacola(page);
      await abrirSacola(page);

      const gaveta = page.getByRole('dialog');
      const caixa = await gaveta.boundingBox();
      expect(caixa).not.toBeNull();
      // a gaveta nunca é mais larga que a tela nem passa da altura visível
      expect(caixa!.width).toBeLessThanOrEqual(largura + 1);
      expect(caixa!.height).toBeLessThanOrEqual(740 + 1);

      // o botão principal fica dentro da área visível, não escondido embaixo
      const continuar = gaveta.getByRole('button', { name: 'Continuar', exact: true });
      await expect(continuar).toBeVisible();
      const b = await continuar.boundingBox();
      expect(b!.y + b!.height).toBeLessThanOrEqual(740 + 1);
    });
  }

  test('o formulário de endereço rola sem cortar o botão', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'entrega');

    const gaveta = page.getByRole('dialog');
    const enviar = gaveta.getByRole('button', { name: 'Continuar para o pagamento' });
    await enviar.scrollIntoViewIfNeeded();
    await expect(enviar).toBeVisible();
    await expect(enviar).toBeInViewport();
  });
});

test.describe('acessibilidade', () => {
  test('a gaveta é um diálogo modal com nome', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    const gaveta = page.getByRole('dialog');
    await expect(gaveta).toHaveAttribute('aria-modal', 'true');
    await expect(gaveta).toHaveAttribute('aria-label', /sacola/i);
  });

  test('Esc fecha a gaveta', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('só existe um controle "Fechar" na gaveta', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    // o fundo escurecido fecha ao toque, mas fica fora da árvore de
    // acessibilidade: dois botões "Fechar" confundiriam o leitor de tela
    await expect(page.getByRole('button', { name: 'Fechar' })).toHaveCount(1);
  });

  test('os campos de endereço têm rótulo associado e erro anunciado', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'entrega');

    const gaveta = page.getByRole('dialog');
    for (const rotulo of ['Rua ou avenida', 'Bairro', 'CEP']) {
      await expect(gaveta.getByLabel(rotulo)).toBeVisible();
    }

    await gaveta.getByRole('button', { name: 'Continuar para o pagamento' }).click();
    // o erro é anunciado e ligado ao campo
    const rua = gaveta.getByLabel('Rua ou avenida');
    await expect(rua).toHaveAttribute('aria-invalid', 'true');
    await expect(gaveta.getByRole('alert').first()).toBeVisible();
  });

  test('o link de pular para o cardápio é o primeiro do teclado', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/');
    await page.waitForLoadState('load');

    // A repetição cobre a hidratação: enquanto o Next assume a página, um
    // `evaluate` pode cair junto com o contexto que está sendo trocado. O que
    // se afirma continua sendo estrito — o primeiro Tab tem que chegar no
    // link de pular, e em nenhum outro lugar.
    await expect(async () => {
      // o foco precisa começar do documento. Clicar no canto não serve: o
      // cabeçalho é fixo e cobre aquele ponto, e o clique cairia no logo.
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.keyboard.press('Tab');
      const focado = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
      expect(focado).toMatch(/Pular para o cardápio/i);
    }).toPass({ timeout: 15_000 });
  });

  test('nenhuma imagem fica sem o atributo alt', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/');
    await page.waitForLoadState('load');

    // `alt` AUSENTE é o defeito: o leitor de tela lê o nome do arquivo.
    // `alt=""` é diferente — é a marcação correta para imagem decorativa.
    const semAtributo = await page.evaluate(
      () => Array.from(document.images).filter((i) => !i.hasAttribute('alt')).length,
    );
    expect(semAtributo).toBe(0);
  });

  test('as fatias do lanche são decorativas, e o conjunto tem um nome só', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/');

    // as sete fatias formam UMA figura: descrevê-las uma a uma faria o leitor
    // de tela anunciar "pão, tomate, alface…" como se fossem sete imagens
    const fatias = await page.evaluate(() =>
      Array.from(document.images)
        .filter((i) => (i.currentSrc || i.src).includes('/lanche/'))
        .map((i) => i.getAttribute('alt')),
    );
    expect(fatias.length).toBeGreaterThan(0);
    for (const alt of fatias) expect(alt).toBe('');

    // o hero monta o lanche em duas variantes (celular e desktop); basta uma
    // delas expor a figura com nome para o leitor de tela
    const conjunto = page.getByRole('img', { name: /lanche da michel food house/i }).first();
    await expect(conjunto).toBeVisible();
  });

  test('as fotos dos produtos têm descrição', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/');
    await page.waitForLoadState('load');

    // o next/image reescreve o endereço para /_next/image?url=%2Fprodutos%2F…
    const fotos = await page.evaluate(() =>
      Array.from(document.images)
        .filter((i) => decodeURIComponent(i.currentSrc || i.src).includes('/produtos/'))
        .map((i) => i.getAttribute('alt')),
    );
    expect(fotos.length).toBeGreaterThan(0);
    for (const alt of fotos) expect(alt?.trim()).toBeTruthy();
  });
});

test.describe('instalável na tela inicial', () => {
  test('o manifesto tem tudo que o Android e o iPhone pedem', async ({ request }) => {
    const r = await request.get('/manifest.webmanifest');
    expect(r.ok()).toBe(true);
    const m = await r.json();

    expect(m.name).toContain('Michel Food House');
    expect(m.short_name).toBeTruthy();
    expect(m.start_url).toBeTruthy();
    expect(m.display).toBe('standalone');
    expect(m.theme_color).toBe('#f2620c');
    expect(m.background_color).toBeTruthy();

    const tamanhos = (m.icons as { sizes: string; purpose?: string }[]).map((i) => i.sizes);
    expect(tamanhos).toContain('192x192');
    expect(tamanhos).toContain('512x512');
    // o Android recorta o ícone: sem maskable, a marca sai cortada
    expect(m.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
  });

  test('os arquivos de ícone existem de verdade', async ({ request }) => {
    for (const caminho of [
      '/icones/icone-192.png',
      '/icones/icone-512.png',
      '/icones/maskable-192.png',
      '/icones/maskable-512.png',
      '/icones/apple-touch-icon.png',
    ]) {
      const r = await request.get(caminho);
      expect(r.ok(), caminho).toBe(true);
      expect(r.headers()['content-type']).toContain('image/png');
    }
  });

  test('a página aponta o manifesto e o ícone do iPhone', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/');
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  });

  test('o service worker nunca guarda pedido, pagamento, login nem painel', async ({ request }) => {
    const sw = await (await request.get('/sw.js')).text();
    for (const rota of [
      '/api/checkout',
      '/api/pedido',
      '/api/auth/',
      '/api/webhook/',
      '/api/whatsapp/',
      // a área do caixa: guardada, continuaria abrindo depois do logout
      '/admin',
    ]) {
      expect(sw, `${rota} precisa estar na lista de nunca cachear`).toContain(rota);
    }
    // e assume a versão nova sozinho, sem o cliente reinstalar o app
    expect(sw).toContain('skipWaiting');
    expect(sw).toContain('clients.claim');
  });
});

test.describe('SEO', () => {
  test('o canônico aponta para o endereço de produção', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/');
    const canonico = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonico).toBeTruthy();
    // nunca um domínio que ainda não existe
    expect(canonico).not.toContain('michelfoodhouse.com.br');
  });

  test('sitemap e robots respondem e combinam com o canônico', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    expect(xml).toContain('politica-de-privacidade');

    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain('Sitemap:');
  });

  test('o JSON-LD do restaurante é válido', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/');
    const blocos = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocos.length).toBeGreaterThan(0);
    const restaurante = blocos.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'Restaurant');
    expect(restaurante).toBeTruthy();
    expect(restaurante.address).toBeTruthy();
    expect(restaurante.telephone).toBeTruthy();
  });

  test('a política de privacidade abre e está ligada no rodapé', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Política de privacidade' });
    await expect(link).toBeVisible();
    // esperar pela URL junto do clique evita perder a navegação que começa
    // enquanto o Next ainda está assumindo a página
    await Promise.all([page.waitForURL(/politica-de-privacidade/), link.click()]);
    await expect(page.getByRole('heading', { name: 'Política de privacidade' })).toBeVisible();
    // fala do que o site realmente coleta
    await expect(page.getByText(/Endereço/).first()).toBeVisible();
    await expect(page.getByText(/LGPD|13\.709/).first()).toBeVisible();
  });
});

test.describe('service worker não atrapalha a primeira visita', () => {
  test('a página não recarrega sozinha quando o worker assume', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/');
    await page.waitForLoadState('load');

    /**
     * Marca o contexto de execução da página.
     *
     * Contar evento de navegação não serve: o roteador do Next faz
     * `replaceState` ao hidratar, e isso conta como navegação sem a página
     * ter recarregado. Um recarregamento DE VERDADE destrói o contexto de
     * JavaScript, e com ele esta marca — que é justamente o que o cliente
     * perderia se estivesse preenchendo o endereço.
     */
    await page.evaluate(() => {
      (window as unknown as { __marca?: number }).__marca = 1;
    });

    // tempo de sobra para o worker instalar, ativar e chamar clients.claim()
    await page.waitForTimeout(3000);

    const sobreviveu = await page.evaluate(
      () => (window as unknown as { __marca?: number }).__marca === 1,
    );
    expect(
      sobreviveu,
      'o service worker recarregou a página na primeira visita e apagaria o que o cliente tivesse digitado',
    ).toBe(true);
  });

  test('o worker fica no comando depois de instalar', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/');
    await page.waitForLoadState('load');

    // `clients.claim()` faz o worker assumir a página já aberta — é o que
    // permite servir do cache sem esperar o próximo carregamento
    await expect(async () => {
      const controlada = await page.evaluate(
        () => Boolean(navigator.serviceWorker?.controller),
      );
      expect(controlada).toBe(true);
    }).toPass({ timeout: 15_000 });
  });
});
