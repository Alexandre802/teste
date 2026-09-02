"use client";

import { useSyncExternalStore } from "react";

const semAssinatura = () => () => {};
const noNavegador = () => true;
const noServidor = () => false;

/**
 * true so depois que o React assumiu a pagina no navegador.
 *
 * O carrinho vive no localStorage, que nao existe no servidor. Sem esta
 * guarda, o HTML gerado no servidor (carrinho vazio) briga com o primeiro
 * render do navegador (carrinho cheio) e o React reclama de hidratacao.
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(semAssinatura, noNavegador, noServidor);
}
