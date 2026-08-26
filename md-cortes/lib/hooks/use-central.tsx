'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useNotificacoes, type RetornoNotificacoes } from './use-notificacoes';
import { useAvisosDoSistema } from './use-pwa';
import { useSessao } from './use-sessao';
import { useToasts } from './use-toasts';

type ValorCentral = RetornoNotificacoes & {
  /** Estado da permissão de aviso do sistema operacional. */
  avisos: ReturnType<typeof useAvisosDoSistema>;
};

const Contexto = createContext<ValorCentral | null>(null);

/**
 * Uma única assinatura de notificações para o app inteiro.
 *
 * Se cada tela assinasse a sua, o Maicon receberia o mesmo toast duas vezes ao
 * abrir duas rotas. Aqui a escuta nasce no topo: o sino, o painel e o aviso do
 * sistema bebem todos da mesma fonte.
 */
export function ProvedorDaCentral({ children }: { children: ReactNode }) {
  const { ehAdmin } = useSessao();
  const { mostrar } = useToasts();
  const avisos = useAvisosDoSistema();

  const aoChegar = useCallback(
    (n: { title: string; message: string }) => {
      // Dentro do app: o toast do canto superior.
      mostrar({ tipo: 'aviso', titulo: 'Novo corte', descricao: n.message });
      // Fora do app, no mesmo aparelho: o aviso do sistema, se autorizado.
      void avisos.avisar(n.title, n.message);
    },
    [mostrar, avisos],
  );

  const central = useNotificacoes({ ativo: ehAdmin, aoChegar });

  const valor = useMemo<ValorCentral>(() => ({ ...central, avisos }), [central, avisos]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCentral(): ValorCentral {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useCentral precisa estar dentro de <ProvedorDaCentral>.');
  return valor;
}
