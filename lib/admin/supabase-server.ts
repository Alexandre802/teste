import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, caixaConfigurado } from './config';

/**
 * Cliente do servidor: rotas de API e componentes de servidor.
 *
 * Lê a sessão dos cookies que o `@supabase/ssr` grava no login. Nunca usa a
 * chave `service_role` — este projeto não tem uma. Tudo passa pela RLS ou
 * por função `security definer` que valida os parâmetros.
 */
export async function supabaseServer(): Promise<SupabaseClient | null> {
  if (!caixaConfigurado) return null;

  const jar = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (novos) => {
        try {
          for (const { name, value, options } of novos) jar.set(name, value, options);
        } catch {
          // Componente de servidor não pode escrever cookie. Quem renova a
          // sessão é o proxy, então falhar aqui é esperado e inofensivo.
        }
      },
    },
  });
}

/**
 * Cliente sem sessão, para o que o visitante anônimo faz.
 *
 * Hoje: registrar o pedido do site. Não lê cookie nenhum — a rota de criação
 * de pedido não deve herdar por acidente a sessão de um admin que esteja
 * usando o mesmo navegador.
 */
export function supabaseAnonimo(): SupabaseClient | null {
  if (!caixaConfigurado) return null;
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
