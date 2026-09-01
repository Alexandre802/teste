/*
 * Service worker do MD_agenda.
 *
 * Regra de ouro: nada que mude estado passa pelo cache. Criação de
 * agendamento, cancelamento, painel e chamadas do Supabase vão sempre à rede.
 * Um horário confirmado guardado em cache seria uma tela mentindo para o
 * cliente.
 *
 * Estático (JS, CSS, fonte, ícone) vem do cache primeiro, com atualização em
 * segundo plano. Navegação é rede primeiro, com a página offline como último
 * recurso.
 */

const VERSION = 'md-agenda-v1'
const STATIC_CACHE = `${VERSION}-estatico`
const PAGES_CACHE = `${VERSION}-paginas`
const OFFLINE_URL = '/offline'

const NUNCA_CACHEAR = [
  '/api/',
  '/admin',
  '/icons/',
  '/manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .catch(() => undefined),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

// A página avisa quando a nova versão pode assumir.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

function ehEstatico(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    /\.(?:css|js|woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg|ico)$/.test(url.pathname)
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (NUNCA_CACHEAR.some((prefixo) => url.pathname.startsWith(prefixo))) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const resposta = await fetch(request)
          return resposta
        } catch {
          const cache = await caches.open(PAGES_CACHE)
          const offline = await cache.match(OFFLINE_URL)
          return (
            offline ??
            new Response('Você está sem conexão.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
          )
        }
      })(),
    )
    return
  }

  if (!ehEstatico(url)) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      const guardado = await cache.match(request)

      const rede = fetch(request)
        .then((resposta) => {
          if (resposta.ok) cache.put(request, resposta.clone())
          return resposta
        })
        .catch(() => undefined)

      return guardado ?? (await rede) ?? Response.error()
    })(),
  )
})
