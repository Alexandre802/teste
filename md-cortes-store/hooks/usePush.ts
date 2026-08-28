"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

type Permissao = "indisponivel" | "default" | "granted" | "denied";

/** Base64 url-safe -> bytes, formato exigido pelo PushManager. */
function chaveParaBytes(base64: string): Uint8Array {
  const preenchido = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const normal = preenchido.replace(/-/g, "+").replace(/_/g, "/");
  const bruto = atob(normal);
  return Uint8Array.from(bruto, (char) => char.charCodeAt(0));
}

const SEM_INSCRICAO = () => () => {};

function lerPermissao(): Permissao {
  if (typeof window === "undefined" || !("Notification" in window)) return "indisponivel";
  return Notification.permission as Permissao;
}

/**
 * Permissão de notificação.
 *
 * Nada é pedido na abertura do app: o navegador só recebe o pedido depois que
 * Maicon toca em "Ativar lembretes". Pedir antes disso é a forma mais rápida de
 * levar um "bloquear" definitivo.
 */
export function usePush() {
  // A permissão vive no navegador, não no React: é lida de lá a cada render e
  // no servidor responde "indisponivel", sem divergir na hidratação.
  const doNavegador = useSyncExternalStore<Permissao>(SEM_INSCRICAO, lerPermissao, () => "indisponivel");
  const [aposPedido, setAposPedido] = useState<Permissao | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const permissao = aposPedido ?? doNavegador;

  const ativar = useCallback(async (): Promise<Permissao> => {
    if (typeof window === "undefined" || !("Notification" in window)) return "indisponivel";
    setOcupado(true);
    try {
      const resultado = (await Notification.requestPermission()) as Permissao;
      setAposPedido(resultado);
      if (resultado !== "granted") return resultado;

      // Web Push só entra quando há chave VAPID configurada. Sem ela, o
      // lembrete continua funcionando com o app aberto.
      const chave = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!chave || !("serviceWorker" in navigator) || !("PushManager" in window)) return resultado;

      const registro = await navigator.serviceWorker.ready;
      const existente = await registro.pushManager.getSubscription();
      const inscricao =
        existente ??
        (await registro.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: chaveParaBytes(chave) as BufferSource,
        }));

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(inscricao.toJSON()),
      });
      return resultado;
    } catch {
      return "denied";
    } finally {
      setOcupado(false);
    }
  }, []);

  const desativar = useCallback(async () => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const registro = await navigator.serviceWorker.ready;
    const inscricao = await registro.pushManager.getSubscription();
    if (!inscricao) return;
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint: inscricao.endpoint }),
    });
    await inscricao.unsubscribe();
  }, []);

  return { permissao, ativar, desativar, ocupado };
}
