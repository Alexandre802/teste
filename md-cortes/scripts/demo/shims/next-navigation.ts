'use client';

import { useSyncExternalStore } from 'react';

/**
 * Substituto do roteador do Next para a prévia de página única.
 *
 * A prévia é um arquivo HTML só, sem servidor que resolva /inicio ou /perfil.
 * Então a rota vive no fim do endereço (#/inicio) e o resto do aplicativo nem
 * fica sabendo: `usePathname` continua devolvendo "/inicio", e os componentes
 * seguem iguais aos que rodam em produção.
 */

function caminhoAtual(): string {
  const bruto = window.location.hash.replace(/^#/, '');
  return bruto.startsWith('/') ? bruto : '/';
}

function assinar(avisar: () => void) {
  window.addEventListener('hashchange', avisar);
  return () => window.removeEventListener('hashchange', avisar);
}

export function usePathname(): string {
  return useSyncExternalStore(assinar, caminhoAtual, () => '/');
}

export function useRouter() {
  return {
    push(destino: string) {
      window.location.hash = destino;
    },
    replace(destino: string) {
      // replace de verdade: navegar para trás não volta para a tela de login
      // depois de entrar, como acontece no aplicativo publicado.
      window.location.replace(`#${destino}`);
    },
    back() {
      window.history.back();
    },
    forward() {
      window.history.forward();
    },
    refresh() {},
    prefetch() {},
  };
}

export function useSearchParams() {
  return new URLSearchParams();
}
