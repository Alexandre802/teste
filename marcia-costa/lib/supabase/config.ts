/**
 * Configuração do Supabase.
 *
 * A URL e a chave anônima são públicas por natureza — elas vão para o
 * navegador de qualquer jeito, e é a RLS que protege os dados. Por isso usam
 * NEXT_PUBLIC_. A chave de serviço (service_role) NÃO entra aqui e nunca
 * pode receber o prefixo NEXT_PUBLIC_: ela ignora a RLS.
 *
 * Enquanto não houver projeto configurado, o painel diz isso na tela em vez
 * de fingir que funciona, e o site público segue como antes.
 */

export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
).trim();

export const supabaseConfigurado =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;
