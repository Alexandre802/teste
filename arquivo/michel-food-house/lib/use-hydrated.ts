'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * `false` no servidor e no primeiro render do cliente, `true` depois.
 *
 * Usado por quem lê estado do localStorage (sacola, cliente, histórico): sem
 * isso o HTML do servidor e o primeiro render do cliente divergem e o React
 * acusa erro de hidratação. Resolve com useSyncExternalStore em vez de
 * setState dentro de efeito, que dispara render em cascata.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
