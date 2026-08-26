/**
 * Monta a prévia em arquivo único.
 *
 * Pega a exportação estática de `out/` e embute tudo — CSS, JavaScript,
 * fontes e fotos — dentro de um só HTML. Serve para mandar o site para o
 * cliente ver antes de ele ir ao ar, sem servidor e sem domínio.
 *
 *   PREVIA_ESTATICA=1 next build && node scripts/previa.mjs
 *   (ou simplesmente: npm run previa)
 *
 * O resultado sai em previa/allp-fit-previa.html.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const out = join(raiz, 'out');
const destino = join(raiz, 'previa', 'allp-fit-previa.html');

if (!existsSync(join(out, 'index.html'))) {
  console.error('Falta a exportação: rode PREVIA_ESTATICA=1 npx next build antes.');
  process.exit(1);
}

const tipos = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const dataUri = (caminho) => {
  const extensao = caminho.slice(caminho.lastIndexOf('.'));
  const tipo = tipos[extensao] ?? 'application/octet-stream';
  return `data:${tipo};base64,${readFileSync(caminho).toString('base64')}`;
};

let html = readFileSync(join(out, 'index.html'), 'utf8');
const pesos = [];

// ── CSS: entra inteiro, com as fontes viradas data: URI ───────────────────
html = html.replace(
  /<link rel="stylesheet" href="(\/_next\/[^"]+\.css)"[^>]*>/g,
  (_, href) => {
    const arquivoCss = join(out, href);
    let css = readFileSync(arquivoCss, 'utf8');

    css = css.replace(/url\((\.\.\/[^)"']+)\)/g, (todo, relativo) => {
      const arquivo = resolve(dirname(arquivoCss), relativo);
      if (!existsSync(arquivo)) return todo;
      pesos.push(['fonte', relativo, readFileSync(arquivo).length]);
      return `url(${dataUri(arquivo)})`;
    });

    // As variáveis de fonte ficam em classes aplicadas ao <html>. A prévia é
    // embutida em outra página, então elas são redeclaradas no :root.
    const variaveis = [...css.matchAll(/\.[A-Za-z0-9_-]*variable\{([^}]*--font[^}]*)\}/g)]
      .map((m) => m[1])
      .join(';');

    return `<style>${css}${variaveis ? `\n:root{${variaveis}}` : ''}</style>`;
  },
);

// ── JavaScript: cada chunk vira script embutido, na mesma ordem ───────────
//
// Os chunks descobrem o próprio endereço por `document.currentScript` — o
// runtime do Turbopack para se registrar, e o Next para achar o prefixo dos
// assets, que exige um <script> de verdade com src contendo "/_next/". Em
// script embutido não há src nenhum, e sem isso a hidratação morre calada.
//
// A saída: antes de cada chunk, `document.currentScript` passa a devolver um
// elemento <script> real, criado e nunca inserido na página (script solto não
// baixa nem executa nada), com o src do chunk. Assim o código roda exatamente
// como rodaria servido em arquivos separados, sem precisar ser remendado.
//
// O elemento do último chunk continua valendo depois que ele termina: parte da
// inicialização do Next roda em microtarefa, já fora do script, e ali o
// `document.currentScript` de verdade seria nulo.
const ponteCurrentScript = `<script>(function(){
  var descritor = Object.getOwnPropertyDescriptor(Document.prototype, 'currentScript');
  var atual = null;

  Object.defineProperty(document, 'currentScript', {
    configurable: true,
    get: function () { return atual || descritor.get.call(document); },
  });

  window.__previaChunk = function (caminho) {
    var falso = document.createElement('script');
    falso.setAttribute('src', caminho);
    atual = falso;
  };

})();<\/script>`;

html = html.replace(
  /<script src="(\/_next\/[^"]+\.js)"([^>]*)><\/script>/g,
  (_, src, atributos) => {
    // O pacote `noModule` são os polyfills para navegador antigo: quem entende
    // módulos ES — todo navegador que roda este site — pula esse arquivo. Fica
    // de fora da prévia porque ele carrega pares substitutos soltos (\uD800 e
    // afins) que atravessam mal quando o HTML vira um arquivo só.
    if (/\bnoModule\b/i.test(atributos)) {
      pesos.push(['ignorado', src, 0]);
      return '';
    }

    const js = readFileSync(join(out, src), 'utf8').replaceAll('</script', '<\\/script');
    pesos.push(['js', src, js.length]);
    return `<script>window.__previaChunk(${JSON.stringify(src)});\n${js}</script>`;
  },
);

// ── fotos ─────────────────────────────────────────────────────────────────
for (const nome of ['salao', 'esteiras', 'teto-led', 'musculacao', 'fachada']) {
  const caminho = join(out, 'fotos', `${nome}.webp`);
  const uri = dataUri(caminho);
  const antes = html.length;
  html = html.replaceAll(`/fotos/${nome}.webp`, uri);
  pesos.push(['foto', nome, html.length - antes]);
}

// ── o que não faz sentido numa página embutida ────────────────────────────
html = html
  .replace(/<link rel="preload"[^>]*>/g, '')
  .replace(/<link rel="icon"[^>]*>/g, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>/g, '')
  .replace(/<link rel="canonical"[^>]*>/g, '')
  .replace(/<meta property="og:[^>]*>/g, '')
  .replace(/<meta name="twitter:[^>]*>/g, '');

// O mapa do Google não carrega dentro da prévia (a página embutida bloqueia
// enquadramento de outros domínios). No lugar dele entra um aviso honesto,
// com o mesmo visual do restante e o link para abrir o mapa de verdade.
html = html.replace(/<iframe[^>]*maps[^>]*><\/iframe>/g, (iframe) => {
  const [, endereco] = iframe.match(/src="([^"]*)"/) ?? [];
  const link = endereco
    ? endereco.replace('/maps?q=', '/maps/search/?api=1&query=').replace('&output=embed', '')
    : 'https://www.google.com/maps';
  return `<div class="flex h-[24rem] w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(53,16,120,0.55),transparent_65%)] px-6 text-center md:h-[34rem]">
      <p class="font-display text-lg font-bold text-white">Mapa do Google</p>
      <p class="max-w-xs text-sm text-cinza">Nesta prévia o mapa não é carregado. No site publicado, ele aparece aqui com a localização da unidade.</p>
      <a href="${link}" target="_blank" rel="noopener noreferrer" class="mt-1 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white">Abrir no Google Maps</a>
    </div>`;
});

// ── a página publicada recebe <head> e <body> próprios ────────────────────
const titulo = 'Allp Fit Academia';
const cabeca = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'));
const corpo = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const estilos = [...cabeca.matchAll(/<style>[\s\S]*?<\/style>/g)].map((m) => m[0]).join('\n');
const scriptsDaCabeca = [...cabeca.matchAll(/<script>[\s\S]*?<\/script>/g)].map((m) => m[0]).join('\n');

const final = `<title>${titulo}</title>\n${estilos}\n${ponteCurrentScript}\n${scriptsDaCabeca}\n${corpo}\n`;
writeFileSync(destino, final);

const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
const soma = (tipo) => pesos.filter((p) => p[0] === tipo).reduce((t, p) => t + p[2], 0);
console.log(`prévia: ${destino}`);
console.log(`  total ${mb(final.length)} — js ${mb(soma('js'))}, fotos ${mb(soma('foto'))}, fontes ${mb(soma('fonte'))}`);
console.log(`  sobrou referência externa? ${/(src|href)="\/_next/.test(final) ? 'SIM — conferir' : 'não'}`);

const soltos = (final.match(/\\u[dD][89a-fA-F][0-9a-fA-F]{2}/g) ?? []).length + (final.match(/\uFFFD/g) ?? []).length;
console.log(`  pares substitutos soltos: ${soltos === 0 ? 'nenhum' : `${soltos} — conferir`}`);
