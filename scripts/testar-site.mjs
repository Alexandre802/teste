/**
 * Bateria de testes do site, num navegador de verdade.
 *
 * Cobre o que quebra sem aparecer no build: link âncora que não leva a lugar
 * nenhum, botão coberto por outro elemento, carrinho que não persiste, busca
 * que não acha, carrossel que não gira, menu que não fecha.
 *
 *   npm run build && npm start &
 *   npm test                       # espera o site em http://localhost:3000
 *
 * Outro endereço: BASE=http://localhost:3100 npm test
 * Outro Chrome:   CHROME_PATH=/caminho/do/chrome npm test
 */
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000';

function acharNavegador() {
  const candidatos = [
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  return candidatos.find((c) => existsSync(c));
}

const executablePath = acharNavegador();
if (!executablePath) {
  console.error('Não achei um Chrome. Aponte com CHROME_PATH=/caminho/do/chrome.');
  process.exit(1);
}

const ok = [];
const falhas = [];
const checa = (nome, cond, detalhe = '') =>
  (cond ? ok : falhas).push(`${cond ? '✓' : '✗'} ${nome}${detalhe ? ' — ' + detalhe : ''}`);

const nav = await chromium.launch({ executablePath });
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => falhas.push('✗ erro de página: ' + e.message.slice(0, 120)));
p.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('404')) falhas.push('✗ console: ' + m.text().slice(0, 120));
});

/* ── âncoras: nenhum link pode apontar para o vazio, em página nenhuma ── */
for (const rota of ['/', '/carrinho', '/login']) {
  await p.goto(BASE + rota, { waitUntil: 'networkidle' });
  const mortos = await p.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href').slice(1))
      .filter((id) => id && !document.getElementById(id)));
  checa(`âncoras de ${rota}`, mortos.length === 0, mortos.join(', ') || 'todas resolvem');
}

/* ── cada espécie leva à sua seção, logo abaixo do cabeçalho fixo ── */
for (const esp of ['cachorros', 'gatos', 'peixes', 'aves', 'coelhos', 'repteis']) {
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.locator(`main a[href="/#${esp}"]`).first().click();
  await p.waitForTimeout(900);
  const r = await p.evaluate((e) => {
    const el = document.getElementById(e);
    return el ? { topo: Math.round(el.getBoundingClientRect().top),
                  secao: el.closest('section')?.querySelector('h2')?.innerText } : null;
  }, esp);
  checa(`espécie ${esp}`, r !== null && Math.abs(r.topo - 176) < 24, r ? `${r.secao} @ ${r.topo}px` : 'alvo não existe');
}

/* ── departamentos ── */
await p.goto(BASE, { waitUntil: 'networkidle' });
const deps = await p.locator('#departamentos ul a').count();
checa('cards de departamento', deps >= 13, `${deps} cards`);

/* ── nada pode cobrir os botões principais ── */
const cobertos = await p.evaluate(() => {
  const fora = [];
  const alvos = ['a[href="/carrinho"]', 'button[aria-label="Abrir menu"]', 'input[type="search"]'];
  for (const s of alvos) {
    const el = document.querySelector(s);
    if (!el) { fora.push(s + ' não existe'); continue; }
    const b = el.getBoundingClientRect();
    const quem = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
    if (quem && !el.contains(quem) && quem !== el) fora.push(s + ' coberto por ' + quem.tagName);
  }
  return fora;
});
checa('botões do topo recebem clique', cobertos.length === 0, cobertos.join('; ') || 'todos livres');

/* ── o botão flutuante do WhatsApp não pode roubar toque de nenhum card ── */
{
  const celular = await (await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  await celular.goto(BASE, { waitUntil: 'networkidle' });
  await celular.waitForTimeout(700);
  await celular.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });

  let roubados = 0;
  for (let y = 0; y < 12000; y += 200) {
    await celular.evaluate((v) => window.scrollTo(0, v), y);
    await celular.waitForTimeout(60);
    roubados += await celular.evaluate(() => {
      const fab = document.querySelector('a[aria-label^="Falar no WhatsApp"]');
      if (!fab) return 0;
      let n = 0;
      document.querySelectorAll('button[aria-label^="Adicionar"]').forEach((el) => {
        const b = el.getBoundingClientRect();
        // o que está sob o cabeçalho fixo é rolagem normal, não obstrução
        if (b.top < 176 || b.bottom > innerHeight || b.width === 0) return;
        const centro = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
        if (centro && centro !== el && !el.contains(centro) && fab.contains(centro)) n++;
      });
      return n;
    });
  }
  checa('bolha do WhatsApp não cobre botão de card', roubados === 0, `${roubados} card(s) bloqueado(s)`);

  const opacidade = () => celular.locator('a[aria-label^="Falar no WhatsApp"]').evaluate((e) => getComputedStyle(e).opacity);
  const rolarAte = async (y) => { await celular.evaluate((v) => window.scrollTo(0, v), y); await celular.waitForTimeout(500); };
  await rolarAte(0);
  checa('bolha aparece no topo', (await opacidade()) === '1');
  await rolarAte(1400);
  checa('bolha some ao descer', (await opacidade()) === '0');
  await rolarAte(1000);
  checa('bolha volta ao subir', (await opacidade()) === '1');

  await celular.goto(BASE + '/carrinho', { waitUntil: 'networkidle' });
  await celular.waitForTimeout(400);
  checa('carrinho não tem bolha (a página já é um CTA de WhatsApp)',
        (await celular.locator('a[aria-label^="Falar no WhatsApp"]').count()) === 0);
  await celular.close();
}

/* ── busca ── */
const campo = p.getByRole('combobox');
for (const [termo, esperado] of [['premier', 'premier'], ['ração cachorro', 'cães'], ['whiskas', 'whiskas'], ['arranhador', 'arranhador']]) {
  await campo.fill(termo);
  await p.waitForTimeout(350);
  const n = await p.getByRole('option').count();
  const txt = n ? (await p.getByRole('option').first().innerText()).toLowerCase() : '';
  checa(`busca "${termo}"`, n > 0 && txt.includes(esperado), `${n} resultados`);
}
await campo.fill('');
await p.keyboard.press('Escape');

/* ── carrinho ── */
await p.goto(BASE, { waitUntil: 'networkidle' });
const contador = () => p.locator('a[href="/carrinho"] span').first().innerText();
const add = p.locator('button[aria-label^="Adicionar"]');
await add.nth(0).click(); await p.waitForTimeout(150);
await add.nth(1).click(); await p.waitForTimeout(150);
await add.nth(1).click(); await p.waitForTimeout(400);
checa('contador soma', (await contador()) === '3', `contador=${await contador()}`);
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600);
checa('carrinho persiste no recarregar', (await contador()) === '3');

await p.goto(BASE + '/carrinho', { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
checa('carrinho lista os itens', (await p.locator('main ul > li').count()) === 2);
await p.locator('button[aria-label^="Aumentar"]').first().click(); await p.waitForTimeout(300);
checa('aumentar quantidade', (await contador()) === '4');
await p.locator('button[aria-label^="Diminuir"]').first().click(); await p.waitForTimeout(300);
checa('diminuir quantidade', (await contador()) === '3');

const zap = await p.locator('a[href*="wa.me"]').filter({ hasText: 'Fechar pedido' }).getAttribute('href');
checa('pedido vai para o WhatsApp da casa', zap.includes('wa.me/5512981676145'), zap.split('?')[0]);
checa('mensagem leva a lista do pedido', decodeURIComponent(zap).includes('•'));

await p.locator('button[aria-label^="Remover"]').first().click(); await p.waitForTimeout(300);
checa('remover item', (await p.locator('main ul > li').count()) === 1);
await p.getByText('Esvaziar carrinho').click(); await p.waitForTimeout(400);
checa('esvaziar carrinho', await p.getByText('Seu carrinho está vazio').isVisible());

/* ── carrossel ── */
await p.goto(BASE, { waitUntil: 'networkidle' });
const trilho = p.locator('[aria-roledescription="carrossel"] .flex').first();
const pos = async () => (await trilho.getAttribute('style')).match(/translateX\(-(\d+)%\)/)?.[1];
checa('transição do carrossel em 300ms', (await trilho.getAttribute('style')).includes('300ms'));
const antes = await pos();
await p.locator('button[aria-label="Próximo banner"]').click({ force: true });
await p.waitForTimeout(600);
checa('seta avança', (await pos()) !== antes, `${antes}% → ${await pos()}%`);
await p.locator('button[aria-label^="Ir para o banner 3"]').click();
await p.waitForTimeout(600);
checa('indicador salta', (await pos()) === '300');
await p.locator('button[aria-label="Próximo banner"]').click({ force: true });
await p.waitForTimeout(900);
checa('loop infinito volta ao primeiro', (await pos()) === '100');

/* ── menu lateral ── */
const gaveta = p.locator('[role="dialog"]');
const fechada = async () => (await gaveta.getAttribute('inert')) !== null;
checa('menu começa fora do foco', await fechada());
await p.locator('button[aria-label="Abrir menu"]').click(); await p.waitForTimeout(400);
checa('menu abre', !(await fechada()));
checa('foco entra na gaveta', await p.evaluate(() => document.querySelector('[role="dialog"]').contains(document.activeElement)));
await p.keyboard.press('Escape'); await p.waitForTimeout(400);
checa('Esc fecha', await fechada());

/* ── login ── */
await p.goto(BASE + '/login', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
checa('formulário de login é POST', (await p.locator('form').getAttribute('method'))?.toLowerCase() === 'post');
await p.locator('#email').fill('nao-e-email');
await p.locator('#senha').fill('123456');
await p.getByRole('button', { name: 'Entrar', exact: true }).click();
await p.waitForTimeout(400);
checa('valida e-mail', await p.locator('form p[role="alert"]').isVisible());
checa('senha não vaza na URL', !p.url().includes('senha='), p.url());

/* ── celular ── */
const m = await (await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
await m.goto(BASE, { waitUntil: 'networkidle' });
await m.waitForTimeout(800);
checa('sem rolagem horizontal', (await m.evaluate(() => document.documentElement.scrollWidth)) <= 390);
await m.locator('button[aria-label="Abrir menu"]').click(); await m.waitForTimeout(400);
checa('menu no celular', (await m.locator('[role="dialog"]').getAttribute('inert')) === null);

console.log(ok.join('\n'));
console.log('\n' + (falhas.length ? 'FALHAS:\n' + [...new Set(falhas)].join('\n') : `${ok.length} verificações, nenhuma falha`));
await nav.close();
process.exit(falhas.length ? 1 : 0);
