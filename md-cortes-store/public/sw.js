/* MD Cortes Store — service worker.
 *
 * Faz três coisas:
 *  1. guarda a casca do app para abrir sem internet;
 *  2. recebe o lembrete por Web Push quando o app está fechado;
 *  3. leva direto para a venda ou para o estoque ao tocar na notificação.
 *
 * Os dados da loja NÃO passam por aqui: quem cuida disso é o IndexedDB do app,
 * que é quem sabe o que já foi sincronizado e o que ainda está na fila.
 */

const VERSAO = "md-cortes-v1";
const CASCA = `casca-${VERSAO}`;
const ESTATICO = `estatico-${VERSAO}`;
const OFFLINE = "/offline.html";

const PRECACHE = [OFFLINE, "/marca/logo.svg", "/marca/monograma.svg", "/marca/icone-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CASCA)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((c) => !c.endsWith(VERSAO)).map((c) => caches.delete(c))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "pular-espera") self.skipWaiting();
});

function ehEstatico(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/marca/") ||
    /\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase fala direto com a rede.

  // Navegação: tenta a rede (dados sempre frescos) e cai para o cache.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CASCA).then((cache) => cache.put(request, copia));
          return resposta;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match(OFFLINE))),
    );
    return;
  }

  if (ehEstatico(url)) {
    event.respondWith(
      caches.match(request).then((cacheado) => {
        const rede = fetch(request)
          .then((resposta) => {
            const copia = resposta.clone();
            caches.open(ESTATICO).then((cache) => cache.put(request, copia));
            return resposta;
          })
          .catch(() => cacheado);
        return cacheado || rede;
      }),
    );
  }
});

// ------------------------------------------------------------------ lembrete

self.addEventListener("push", (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = { body: event.data ? event.data.text() : "" };
  }

  const titulo = dados.title || "MD Cortes Store";
  const opcoes = {
    body: dados.body || "Maicon, você vendeu? Como está o estoque?",
    icon: "/marca/icone-192.png",
    badge: "/marca/icone-192.png",
    tag: dados.tag || "lembrete-md",
    renotify: true,
    data: { url: dados.url || "/" },
    actions: [
      { action: "venda", title: "Registrar venda" },
      { action: "estoque", title: "Atualizar estoque" },
    ],
  };
  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino =
    event.action === "venda"
      ? "/venda"
      : event.action === "estoque"
        ? "/estoque"
        : event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      for (const janela of janelas) {
        if ("focus" in janela) {
          janela.navigate?.(destino);
          return janela.focus();
        }
      }
      return self.clients.openWindow(destino);
    }),
  );
});
