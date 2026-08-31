'use client';

import { useEffect, useState } from 'react';

/**
 * Registra o service worker e avisa quando há versão nova.
 *
 * Sem este aviso, quem instalou o site na tela inicial ficaria preso na
 * versão que baixou: o service worker novo entra em espera até todas as abas
 * fecharem, e app na tela inicial praticamente nunca "fecha". Preço mudado no
 * cardápio não chegaria ao cliente.
 *
 * Só registra em produção. Em desenvolvimento o service worker guarda pacote
 * do Next que muda a cada salvamento e faz a página servir código velho.
 */
export default function RegistrarSW() {
  const [aguardando, setAguardando] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    let registro: ServiceWorkerRegistration | undefined;

    const observar = (reg: ServiceWorkerRegistration) => {
      registro = reg;
      if (reg.waiting) setAguardando(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const novo = reg.installing;
        if (!novo) return;
        novo.addEventListener('statechange', () => {
          // "installed" com controller existente = já havia uma versão no ar
          if (novo.state === 'installed' && navigator.serviceWorker.controller) {
            setAguardando(novo);
          }
        });
      });
    };

    navigator.serviceWorker.register('/sw.js').then(observar).catch(() => undefined);

    // a troca de controlador recarrega a página uma única vez
    let recarregou = false;
    const aoTrocar = () => {
      if (recarregou) return;
      recarregou = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', aoTrocar);

    // procura versão nova quando o cliente volta ao app
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') registro?.update().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', aoVoltar);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', aoTrocar);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, []);

  if (!aguardando) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-cocoa/95 px-4 py-3 text-white shadow-2xl ring-1 ring-white/25 backdrop-blur"
    >
      <p className="flex-1 text-sm font-semibold leading-snug">
        Uma versão nova do cardápio está pronta.
      </p>
      <button
        type="button"
        onClick={() => aguardando.postMessage('assumir-agora')}
        className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-cocoa"
      >
        Atualizar
      </button>
    </div>
  );
}
