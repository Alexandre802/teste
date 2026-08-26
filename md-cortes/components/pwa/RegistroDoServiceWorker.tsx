'use client';

import { useServiceWorker } from '@/lib/hooks/use-pwa';

/** Só existe para rodar o efeito de registro dentro da árvore de cliente. */
export function RegistroDoServiceWorker() {
  useServiceWorker();
  return null;
}
