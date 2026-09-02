"use client";

import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from "./config";

/**
 * Cliente do navegador. Devolve null quando não há projeto configurado, para
 * quem chama tratar a ausência em vez de estourar um erro obscuro.
 */
export function criarClienteNavegador() {
  if (!supabaseConfigurado) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
