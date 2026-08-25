'use client';

import { useSyncExternalStore } from 'react';

/** Assinatura vazia: o valor nunca muda depois da hidratação. */
const semAssinatura = () => () => {};

/**
 * `false` no servidor e no primeiro render do cliente, `true` depois.
 *
 * O carrinho vive no localStorage, que o servidor não enxerga: sem isso o HTML
 * do servidor diria "0 itens" e o cliente diria "3", e o React acusaria erro de
 * hidratação. Componentes que leem o carrinho mostram o estado vazio até este
 * hook virar.
 *
 * `useSyncExternalStore` é o caminho certo aqui justamente porque tem um
 * instantâneo separado para o servidor — dá para distinguir os dois lados sem
 * disparar um setState dentro de efeito.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    semAssinatura,
    () => true, // cliente
    () => false, // servidor
  );
}
