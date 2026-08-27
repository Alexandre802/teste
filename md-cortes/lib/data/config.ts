/**
 * As chaves do Supabase.
 *
 * Vêm de um lugar só: as variáveis embutidas na build. Já houve um caminho que
 * deixava configurar pelo aparelho, e ele saiu daqui — num sistema de produção
 * era um buraco, porque bastava escrever no localStorage para repontar o app
 * para outro projeto Supabase, com outro banco e outros usuários.
 *
 * A chave publishable é pública por natureza: ela vai no JavaScript entregue a
 * todo celular que abrir o app. Quem protege os dados é a Row Level Security do
 * `schema.sql`, não o segredo da chave.
 */

export interface ConfigNuvem {
  url: string;
  chave: string;
}

export function lerConfigNuvem(): ConfigNuvem | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim().replace(/\/+$/, '');
  const chave = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
  return url && chave ? { url, chave } : null;
}
