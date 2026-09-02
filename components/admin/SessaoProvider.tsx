'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/admin/supabase-browser';
import { caixaConfigurado } from '@/lib/admin/config';
import type { UsuarioAdmin } from '@/lib/admin/tipos';

/**
 * Quem está usando o painel.
 *
 * Duas perguntas diferentes, e é importante não confundi-las:
 *
 *   `usuario` — entrou no Supabase Auth. Só isso.
 *   `perfil`  — está na tabela de administradores, com papel e permissão.
 *
 * Conta de autenticação NÃO é permissão. Alguém pode ter senha válida e não
 * ter acesso ao caixa — é o estado de quem foi criado no painel do Supabase e
 * ainda não foi ligado à casa. Nesse caso o painel diz isso em português, em
 * vez de mostrar todas as telas vazias como se não houvesse venda nenhuma.
 */

interface Sessao {
  supabase: SupabaseClient | null;
  usuario: User | null;
  perfil: UsuarioAdmin | null;
  carregando: boolean;
  /** Sessão válida E autorizada no caixa. */
  autorizado: boolean;
  sair: () => Promise<void>;
}

const Contexto = createContext<Sessao | null>(null);

/**
 * Quem está logado, como um estado só.
 *
 * Os três campos andam juntos: chegam da mesma resposta e mudam ao mesmo
 * tempo. Separados em três `useState`, uma troca de conta renderizava a tela
 * com o usuário novo e o perfil velho no meio do caminho — e por um instante
 * o painel decidia a permissão pelo perfil errado.
 *
 * `resolvido` marca "já sei a resposta". `carregando` sai daí, derivado.
 */
interface EstadoSessao {
  resolvido: boolean;
  usuario: User | null;
  perfil: UsuarioAdmin | null;
}

const NAO_RESOLVIDO: EstadoSessao = { resolvido: false, usuario: null, perfil: null };

export function SessaoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [estado, setEstado] = useState<EstadoSessao>(NAO_RESOLVIDO);

  useEffect(() => {
    if (!supabase) return;

    let vivo = true;

    const resolver = async (u: User | null) => {
      if (!u) {
        if (vivo) setEstado({ resolvido: true, usuario: null, perfil: null });
        return;
      }

      const { data } = await supabase
        .from('comida_caseira_users')
        .select('user_id, name, email, role, active')
        .eq('user_id', u.id)
        .maybeSingle();

      if (!vivo) return;
      setEstado({
        resolvido: true,
        usuario: u,
        // `active: false` é conta desligada — trata como sem acesso
        perfil: data && data.active ? (data as UsuarioAdmin) : null,
      });
    };

    void supabase.auth.getUser().then(({ data }) => resolver(data.user ?? null));

    // Mantém a tela em dia quando a sessão troca em OUTRA aba, ou quando o
    // token é renovado no meio do expediente.
    const { data: inscricao } = supabase.auth.onAuthStateChange((_evento, sessao) =>
      resolver(sessao?.user ?? null),
    );

    return () => {
      vivo = false;
      inscricao.subscription.unsubscribe();
    };
  }, [supabase]);

  const sair = useCallback(async () => {
    await supabase?.auth.signOut();
    setEstado({ resolvido: true, usuario: null, perfil: null });
    router.replace('/admin/login');
    // o proxy decide a rota pelo cookie; sem o refresh ele ainda vê o antigo
    router.refresh();
  }, [supabase, router]);

  const valor = useMemo<Sessao>(
    () => ({
      supabase,
      usuario: estado.usuario,
      perfil: estado.perfil,
      // sem Supabase configurado não há o que carregar: a tela mostra na hora
      // o aviso de "fluxo de caixa não configurado"
      carregando: caixaConfigurado && !estado.resolvido,
      autorizado: Boolean(estado.usuario && estado.perfil),
      sair,
    }),
    [supabase, estado, sair],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao(): Sessao {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useSessao precisa estar dentro de <SessaoProvider>');
  return ctx;
}

/**
 * Cliente Supabase já garantido.
 *
 * As telas só renderizam depois do guarda de sessão, então a essa altura o
 * cliente existe. Encapsular o `!` num lugar só evita espalhar `if (!supabase)`
 * por vinte telas.
 */
export function useSupabase(): SupabaseClient {
  const { supabase } = useSessao();
  if (!supabase) throw new Error('Supabase não configurado');
  return supabase;
}
