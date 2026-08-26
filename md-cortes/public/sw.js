/* eslint-disable */
/**
 * Service worker do MD_cortes.
 *
 * Escrito à mão de propósito: o app sai como pacote estático, sem etapa de
 * build que gere isto, e o comportamento aqui cabe em poucas linhas.
 *
 * Estratégia:
 *   navegação  → rede primeiro, cache como rede de segurança (o funcionário
 *                nunca fica olhando tela branca no fundo da loja sem sinal)
 *   estáticos  → cache primeiro (o JS do Next tem hash no nome; nunca muda)
 *   Supabase   → nunca passa por aqui; dado de corte não pode vir de cache
 */

const VERSAO = 'md-cortes-v1';
const ESSENCIAIS = ['./', './manifest.webmanifest', './icones/icone-192.png'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(VERSAO)
      .then((cache) => cache.addAll(ESSENCIAIS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((c) => c !== VERSAO).map((c) => caches.delete(c))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== 'GET') return;

  const url = new URL(requisicao.url);
  if (url.origin !== self.location.origin) return; // Supabase e afins: direto na rede.

  if (requisicao.mode === 'navigate') {
    evento.respondWith(
      fetch(requisicao)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(VERSAO).then((cache) => cache.put(requisicao, copia)).catch(() => undefined);
          return resposta;
        })
        .catch(() => caches.match(requisicao).then((r) => r || caches.match('./'))),
    );
    return;
  }

  evento.respondWith(
    caches.match(requisicao).then(
      (emCache) =>
        emCache ||
        fetch(requisicao).then((resposta) => {
          if (resposta.ok && resposta.type === 'basic') {
            const copia = resposta.clone();
            caches
              .open(VERSAO)
              .then((cache) => cache.put(requisicao, copia))
              .catch(() => undefined);
          }
          return resposta;
        }),
    ),
  );
});

/**
 * Web Push de verdade, para quando existir um servidor com a chave VAPID.
 * Enquanto não existe, este ouvinte simplesmente nunca dispara — e o aviso do
 * sistema chega pelo `showNotification` que o app chama ao receber o Realtime.
 */
self.addEventListener('push', (evento) => {
  let dados = { title: 'MD_cortes', body: 'Novo corte registrado.' };
  try {
    if (evento.data) dados = { ...dados, ...evento.data.json() };
  } catch (_) {}
  evento.waitUntil(
    self.registration.showNotification(dados.title, {
      body: dados.body,
      icon: './icones/icone-192.png',
      badge: './icones/badge-72.png',
      tag: 'md-cortes-novo-corte',
    }),
  );
});

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      const aberta = janelas.find((j) => 'focus' in j);
      if (aberta) return aberta.focus();
      return self.clients.openWindow('./inicio/');
    }),
  );
});
