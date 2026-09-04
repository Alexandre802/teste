import { expect, test } from '@playwright/test';

const QUADROS = 192;
const FPS = 24;

type Pagina = import('@playwright/test').Page;

/**
 * Rola até a fração pedida do percurso do hero e espera o quadro assentar.
 *
 * `behavior: 'instant'` é obrigatório: o site usa `scroll-behavior: smooth`,
 * então um `scrollTo` comum ficaria animando e o teste leria o quadro no meio
 * do caminho.
 */
const irPara = async (page: Pagina, fracao: number) => {
  await page.evaluate((f) => {
    const secao = document.getElementById('inicio')!;
    const percorrivel = secao.offsetHeight - window.innerHeight;
    window.scrollTo({ top: Math.round(percorrivel * f), behavior: 'instant' });
  }, fracao);
  await page.waitForTimeout(500);
};

/** Lê o quadro que está na tela junto com o progresso que o produziu. */
const estadoDoHero = (page: Pagina) =>
  page.evaluate(() => {
    const secao = document.getElementById('inicio')!;
    const percorrivel = secao.offsetHeight - window.innerHeight;
    const bruto = percorrivel > 0 ? -secao.getBoundingClientRect().top / percorrivel : 0;
    const video = document.querySelector<HTMLVideoElement>('.__remotion-player video');

    return {
      progresso: Math.min(1, Math.max(0, bruto)),
      t: video ? video.currentTime : null,
      pausado: video ? video.paused : null,
    };
  });

test.describe('hero com scroll-scrub', () => {
  test('o quadro exibido é função linear do scroll, para os dois lados', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.__remotion-player video')).toHaveCount(1, { timeout: 30_000 });
    await page.waitForTimeout(2500);

    // Ida e volta: o percurso tem que ser reversível.
    for (const fracao of [0, 0.25, 0.5, 0.75, 1, 0.5, 0]) {
      await irPara(page, fracao);
      const estado = await estadoDoHero(page);

      // O esperado sai do progresso medido, não da fração pedida: um pixel de
      // diferença no scroll não pode reprovar o teste.
      const esperado = Math.round(estado.progresso * (QUADROS - 1)) / FPS;

      expect(estado.t).not.toBeNull();
      expect(Math.abs(estado.t! - esperado), `fração ${fracao}`).toBeLessThanOrEqual(1 / FPS);
      expect(estado.pausado, 'o vídeo nunca toca sozinho').toBe(true);
    }
  });

  test('sem scroll a câmera fica parada', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.__remotion-player video')).toHaveCount(1, { timeout: 30_000 });
    await page.waitForTimeout(2500);

    await irPara(page, 0.4);
    const antes = (await estadoDoHero(page)).t;
    await page.waitForTimeout(2000);
    const depois = (await estadoDoHero(page)).t;

    expect(depois).toBe(antes);
  });

  test('o conteúdo comercial só aparece no fim do percurso', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const bloco = page.locator('.hero-final');
    const opacidade = () => bloco.evaluate((el) => Number(getComputedStyle(el).opacity));

    await irPara(page, 0);
    expect(await opacidade()).toBe(0);

    // Durante o movimento nada de texto de venda na frente da imagem.
    await irPara(page, 0.5);
    expect(await opacidade()).toBe(0);
    await irPara(page, 0.8);
    expect(await opacidade()).toBe(0);

    await irPara(page, 1);
    expect(await opacidade()).toBeGreaterThan(0.98);
    await expect(page.getByRole('button', { name: 'Ver imóveis' })).toBeVisible();
  });

  test('o convite para rolar some assim que o movimento começa', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const convite = page.locator('.hero-convite');
    const opacidade = () => convite.evaluate((el) => Number(getComputedStyle(el).opacity));

    await irPara(page, 0);
    expect(await opacidade()).toBe(1);
    await irPara(page, 0.2);
    expect(await opacidade()).toBe(0);
  });

  test('“Ver imóveis” rola até o catálogo', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    await irPara(page, 1);

    await page.getByRole('button', { name: 'Ver imóveis' }).click();
    await page.waitForTimeout(1500);

    const topo = await page.evaluate(() =>
      Math.round(document.getElementById('imoveis')!.getBoundingClientRect().top),
    );
    expect(Math.abs(topo)).toBeLessThan(8);
  });
});

test.describe('prefers-reduced-motion', () => {
  test('entrega o último quadro parado, com o conteúdo já visível', async ({ page }) => {
    const pedidosDeVideo: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('hero-scrub')) pedidosDeVideo.push(r.url());
    });

    // Emulado na própria página, antes do primeiro paint: o CSS que encolhe o
    // hero precisa valer já na primeira renderização.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(2500);

    const estado = await page.evaluate(() => ({
      alturaSecao: document.getElementById('inicio')!.offsetHeight,
      alturaTela: window.innerHeight,
      opacidadeFinal: getComputedStyle(document.querySelector('.hero-final')!).opacity,
      posterFinal: getComputedStyle(document.querySelector('.hero-poster-final')!).display,
      temPlayer: Boolean(document.querySelector('.__remotion-player')),
    }));

    expect(estado.alturaSecao).toBe(estado.alturaTela);
    expect(estado.opacidadeFinal).toBe('1');
    expect(estado.posterFinal).not.toBe('none');
    expect(estado.temPlayer, 'o Player nem chega a montar').toBe(false);
    expect(pedidosDeVideo, 'e o vídeo nem é baixado').toHaveLength(0);
  });
});
