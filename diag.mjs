import { chromium } from '/home/user/teste/node_modules/playwright-core/index.mjs';
const B='http://127.0.0.1:3200';
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await nav.newContext({ viewport:{width:1280,height:900} })).newPage();

for (const rota of ['/', '/carrinho', '/login']) {
  await p.goto(B+rota, { waitUntil:'networkidle' });
  await p.waitForTimeout(600);
  const quebrados = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(a => {
      const href = a.getAttribute('href');
      const id = href.replace(/^\/?#/, '');
      const existe = !!document.getElementById(id);
      const mesmaPagina = href.startsWith('#');
      if (mesmaPagina && !existe) out.push({ href, texto: a.innerText.trim().slice(0,26), problema: 'âncora não existe nesta página' });
    });
    return out;
  });
  console.log(`\n${rota} → ${quebrados.length} link(s) âncora que não levam a lugar nenhum`);
  for (const q of quebrados.slice(0,8)) console.log('  ', JSON.stringify(q));
  if (quebrados.length > 8) console.log('   ...e mais', quebrados.length-8);
}

// as seis espécies, uma a uma, a partir da home
await p.goto(B, { waitUntil:'networkidle' });
console.log('\n=== espécies a partir da home ===');
for (const esp of ['cachorros','gatos','peixes','aves','coelhos','repteis']) {
  await p.goto(B, { waitUntil:'networkidle' }); await p.waitForTimeout(400);
  const link = p.locator(`main a[href="/#${esp}"]`).first();
  const existe = await link.count();
  if (!existe) { console.log(' ', esp.padEnd(10), 'SEM LINK na home'); continue; }
  await link.click(); await p.waitForTimeout(900);
  const r = await p.evaluate((e) => {
    const el = document.getElementById(e);
    return { temAlvo: !!el, topo: el ? Math.round(el.getBoundingClientRect().top) : null, y: Math.round(scrollY),
             secao: el ? (el.closest('section')?.querySelector('h2')?.innerText || '?') : null };
  }, esp);
  console.log(' ', esp.padEnd(10), JSON.stringify(r));
}
await nav.close();
