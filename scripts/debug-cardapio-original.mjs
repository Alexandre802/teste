const BASE = 'https://app.instadelivery.com.br/api/';
const SLUG = 'comidacaseiradamarciacosta';
const UA = { accept: 'application/json,text/html,application/javascript,*/*', 'user-agent': 'Mozilla/5.0' };

async function json(url) {
  const r = await fetch(url, { headers: UA });
  const text = await r.text();
  try { return { status:r.status, data:JSON.parse(text) }; }
  catch { return { status:r.status, text:text.slice(0,2000) }; }
}

const standard = await json(BASE + 'stores/by-slug/' + SLUG);
const store = standard.data || {};
const groups = Array.isArray(store.groups) ? store.groups : [];
console.log('[BASE_MENU]' + JSON.stringify({ status:standard.status, id:store.id, groupCount:groups.length, itemCount:groups.reduce((n,g)=>n+(g.itens?.length||0),0), groups:groups.map(g=>({id:g.id,name:g.name,order:g.order,itemCount:g.itens?.length||0})) }));

const table = await json(BASE + 'stores/by-slug/' + SLUG + '/table');
const tableGroups = Array.isArray(table.data?.groups) ? table.data.groups : [];
console.log('[TABLE_MENU]' + JSON.stringify({ status:table.status, keys:table.data?Object.keys(table.data):[], groupCount:tableGroups.length, itemCount:tableGroups.reduce((n,g)=>n+(g.itens?.length||0),0), groups:tableGroups.map(g=>({id:g.id,name:g.name,order:g.order,itemCount:g.itens?.length||0})) }));

try {
  const shell = await fetch('https://instadelivery.com.br/' + SLUG, { headers: UA }).then(r => r.text());
  const srcs = [...shell.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]).filter(src => src.startsWith('/js/'));
  const targetSrc = srcs.find(s => /^\/js\/45\./.test(s)) || srcs.at(-1);
  if (!targetSrc) throw new Error('chunk de serviços não encontrado');
  const text = await fetch(new globalThis.URL(targetSrc, 'https://instadelivery.com.br').toString(), { headers: UA }).then(r => r.text());

  const routes = new Set();
  for (const m of text.matchAll(/\.a\.(get|post|put|delete)\(\"([^\"]+)\"/g)) routes.add(m[1].toUpperCase() + ' ' + m[2]);
  for (const m of text.matchAll(/\.a\.(get|post|put|delete)\(\"([^\"]+)\"\.concat\(/g)) routes.add(m[1].toUpperCase() + ' ' + m[2] + '{...}');
  const filtered = [...routes].filter(x => /store|menu|group|item|complement|product|catalog/i.test(x));
  console.log('[API_ROUTES]' + JSON.stringify({ chunk:targetSrc, count:filtered.length, routes:filtered }));

  const terms = ['menu-groups','menu_groups','menuGroups','menu group','complements','items','itens','groups','store_time','schedule','by-slug'];
  for (const term of terms) {
    const lower = text.toLowerCase();
    let pos = 0; let n = 0;
    while (n < 8) {
      const at = lower.indexOf(term.toLowerCase(), pos);
      if (at < 0) break;
      console.log('[CHUNK_SNIP]' + JSON.stringify({ term, at, text:text.slice(Math.max(0,at-650), Math.min(text.length,at+term.length+1200)) }));
      pos = at + term.length; n++;
    }
  }
} catch (e) {
  console.log('[DISCOVERY_ERROR]' + JSON.stringify({ message:String(e) }));
}
