/**
 * Configuração do Supabase.
 *
 * A URL e a chave anônima/publishable são públicas por natureza — elas vão
 * para o navegador de qualquer jeito, e é a RLS que protege os dados.
 *
 * As variáveis da Vercel continuam tendo prioridade. Os valores abaixo são
 * apenas o fallback público da Comida Caseira para o painel não depender de
 * configuração manual no dashboard da Vercel.
 *
 * NUNCA coloque uma chave service_role aqui: ela ignora a RLS.
 */

const SUPABASE_URL_PADRAO = "https://qtxcqlzfqfckcjpeboeo.supabase.co";
const SUPABASE_ANON_KEY_PADRAO =
  "sb_publishable_TWIxTBn8_aWmtlX3xnvLNA_9ZthmAiz";

export const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? SUPABASE_URL_PADRAO
).trim();

export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? SUPABASE_ANON_KEY_PADRAO
).trim();

export const supabaseConfigurado =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;
