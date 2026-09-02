import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from "./config";

/**
 * Cliente do servidor, com a sessão vindo dos cookies.
 * Devolve null quando não há projeto configurado.
 */
export async function criarClienteServidor() {
  if (!supabaseConfigurado) return null;

  const armazem = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => armazem.getAll(),
      setAll: (novos) => {
        try {
          for (const { name, value, options } of novos) {
            armazem.set(name, value, options);
          }
        } catch {
          // Server Component não pode escrever cookie. Quem renova a sessão é
          // o proxy.ts, então aqui o silêncio é o comportamento correto.
        }
      },
    },
  });
}

/**
 * Usuário do painel na requisição atual, ou null.
 *
 * Usa getUser(), que valida o token no servidor do Supabase. getSession() lê
 * o cookie sem validar e não serve para decidir acesso.
 */
export async function usuarioDoPainel() {
  const supabase = await criarClienteServidor();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("comida_caseira_users")
    .select("user_id, nome, role, ativo")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!perfil?.ativo) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    nome: perfil.nome as string,
    role: perfil.role as "owner" | "manager" | "cashier",
  };
}
