'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, caixaConfigurado } from './config';

/**
 * Cliente do navegador, usado pelas telas do painel.
 *
 * Guardado num módulo em vez de criado por componente: cada instância abre a
 * própria conexão de tempo real, e um cliente por tela deixaria websockets
 * pendurados a cada navegação.
 *
 * Devolve `null` quando o Supabase não está configurado. É proposital — a
 * alternativa seria um cliente que parece funcionar e falha na primeira
 * consulta, que é exatamente o tipo de função falsa que este projeto proíbe.
 */
let cliente: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (!caixaConfigurado) return null;
  cliente ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cliente;
}
