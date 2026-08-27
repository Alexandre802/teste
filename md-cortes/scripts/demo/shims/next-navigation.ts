'use client';

import { useSyncExternalStore } from 'react';

/**
 * Substituto do roteador do Next para a prévia de página única.
 *
 * A rota fica em memória, e não no endereço. A primeira versão usava #/rota e
 * quebrou: a prévia é servida dentro de um quadro que injeta uma <base>, e com
 * uma <base> presente o href="#/inicio" passa a resolver contra ela em vez de
 * contra o documento. Cada toque virava uma navegação para fora da página.
 *
 * Guardar a rota em memória tira o endereço da conversa e não sobra nada para
 * a <base> atrapalhar. O preço é que recarregar volta ao começo — o que numa
 * prévia não custa nada, porque a sessão continua guardada e o app manda a
 * pessoa direto para o painel.
 */

let rotaAtual = '/';
const ouvintes = new Set<() => void>();

/** Usada também pelo <Link>, que não pode deixar o navegador navegar. */
export function irPara(destino: string): void {
  const limpo = destino.startsWith('/') ? destino : `/${destino}`;
  if (limpo === rotaAtual) return;
  rotaAtual = limpo;
  for (const ouvinte of ouvintes) ouvinte();
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

function ler(): string {
  return rotaAtual;
}

export function usePathname(): string {
  return useSyncExternalStore(assinar, ler, ler);
}

export function useRouter() {
  return {
    push: irPara,
    // Sem histórico de navegador para manipular, empurrar e substituir são a
    // mesma coisa aqui.
    replace: irPara,
    back() {},
    forward() {},
    refresh() {},
    prefetch() {},
  };
}

export function useSearchParams() {
  return new URLSearchParams();
}
