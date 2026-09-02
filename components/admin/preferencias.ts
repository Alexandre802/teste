'use client';

/**
 * Preferências do APARELHO, guardadas no `localStorage`.
 *
 * Vale a distinção: dado financeiro nunca mora no navegador — fica no banco,
 * atrás da RLS. Aqui só existe ajuste de interface, que é diferente por
 * aparelho de propósito: o tablet da cozinha quer apitar a cada pedido; o
 * celular da dona, no almoço de domingo, talvez não.
 *
 * Exposto como "store externa" para o React ler com `useSyncExternalStore` em
 * vez de um efeito que copia o valor para o estado. Além de evitar a
 * renderização extra, o `storage` do navegador avisa as OUTRAS abas: mudar a
 * preferência numa aba atualiza todas na hora.
 */

const CHAVE_SOM = 'comida-caseira-som-pedido';

const ouvintes = new Set<() => void>();

function avisar() {
  for (const ouvinte of ouvintes) ouvinte();
}

function inscrever(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  // outra aba mexeu na preferência
  window.addEventListener('storage', avisar);
  return () => {
    ouvintes.delete(ouvinte);
    if (ouvintes.size === 0) window.removeEventListener('storage', avisar);
  };
}

function lerSom(): boolean {
  try {
    return localStorage.getItem(CHAVE_SOM) === 'sim';
  } catch {
    // navegador com armazenamento bloqueado: segue sem som
    return false;
  }
}

/**
 * O que o servidor "vê".
 *
 * Precisa ser falso e constante: no servidor não existe `localStorage`, e um
 * valor diferente do primeiro render do navegador quebraria a hidratação.
 */
function lerSomNoServidor(): boolean {
  return false;
}

export const preferenciaSom = {
  inscrever,
  ler: lerSom,
  lerNoServidor: lerSomNoServidor,
  gravar(ligado: boolean) {
    try {
      localStorage.setItem(CHAVE_SOM, ligado ? 'sim' : 'nao');
    } catch {
      // não persiste, mas a sessão atual continua respeitando a escolha
    }
    avisar();
  },
};
