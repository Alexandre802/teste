/*
 * Service worker da Michel Food House.
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ REGRA QUE NÃO SE QUEBRA: pedido, pagamento e login NUNCA passam pelo   │
 * │ cache. Uma resposta guardada de /api/checkout ou /api/pedido significa │
 * │ pedido duplicado, pagamento fantasma ou sessão de outra pessoa.        │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * O que fica em cache: só o que é imutável ou irrelevante se estiver velho —
 * fotos dos produtos, ícones, fontes e os pacotes versionados do Next, cujo
 * nome de arquivo já muda a cada publicação.
 *
 * Atualização: `skipWaiting` + `clients.claim` na ativação. Uma versão nova
 * publicada assume no próximo carregamento, sem o cliente precisar
 * desinstalar o app da tela inicial — que é o pior jeito de descobrir que o
 * cardápio mudou.
 */

const VERSAO = 'mfh-v1';
const CACHE_ESTATICO = `${VERSAO}-estatico`;

/** Nada aqui pode ser servido do cache, em hipótese alguma. */
const NUNCA_CACHEAR = [
  '/api/checkout',
  '/api/pedido',
  '/api/auth/',
  '/api/webhook/',
  '/api/whatsapp/',
];

/** Caminhos cujo conteúdo é versionado ou imutável. */
const PODE_CACHEAR = ['/_next/static/', '/produtos/', '/lanche/', '/marca/', '/icones/'];

self.addEventListener('install', (evento) => {
  // assume na hora, sem esperar as abas antigas fecharem
  self.skipWaiting();
  evento.waitUntil(
    caches
      .open(CACHE_ESTATICO)
      .then((cache) =>
        cache.addAll(['/icones/icone-192.png', '/marca/logo-128.png']).catch(() => undefined),
      ),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((c) => !c.startsWith(VERSAO)).map((c) => caches.delete(c))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (evento) => {
  // a página pede a troca imediata quando detecta uma versão nova esperando
  if (evento.data === 'assumir-agora') self.skipWaiting();
});

self.addEventListener('fetch', (evento) => {
  const req = evento.request;

  // POST, PUT e afins nunca são interceptados
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // outro domínio (mapa do Google, fontes) segue direto para a rede
  if (url.origin !== self.location.origin) return;

  // pedido, pagamento e login: rede, sempre, sem tocar no cache
  if (NUNCA_CACHEAR.some((p) => url.pathname.startsWith(p))) return;

  // qualquer outra rota de API também vai direto para a rede
  if (url.pathname.startsWith('/api/')) return;

  const cacheavel = PODE_CACHEAR.some((p) => url.pathname.startsWith(p));

  if (cacheavel) {
    // cache primeiro: são arquivos versionados, o conteúdo não muda sob o
    // mesmo nome
    evento.respondWith(
      caches.match(req).then(
        (guardado) =>
          guardado ??
          fetch(req).then((resposta) => {
            if (resposta.ok && resposta.status === 200) {
              const copia = resposta.clone();
              caches.open(CACHE_ESTATICO).then((cache) => cache.put(req, copia));
            }
            return resposta;
          }),
      ),
    );
    return;
  }

  // páginas: rede primeiro, cache só como rede de segurança para quem ficou
  // sem sinal no meio do pedido. O cardápio e os preços vêm sempre frescos
  // quando há conexão.
  if (req.mode === 'navigate') {
    evento.respondWith(
      fetch(req)
        .then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone();
            caches.open(CACHE_ESTATICO).then((cache) => cache.put(req, copia));
          }
          return resposta;
        })
        .catch(() => caches.match(req).then((guardado) => guardado ?? caches.match('/'))),
    );
  }
});
