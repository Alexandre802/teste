/**
 * Conexão com o Supabase do fluxo de caixa.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Por que a chave anônima pode ser `NEXT_PUBLIC_`                          │
 * │                                                                          │
 * │ A regra do projeto — segredo nunca em `NEXT_PUBLIC_*` — continua de pé.  │
 * │ A chave `anon` do Supabase NÃO é segredo: ela nasceu para ir ao          │
 * │ navegador, e sozinha não abre nada. Quem protege os dados é a RLS, que   │
 * │ nega tudo a quem não está na tabela de administradores.                  │
 * │                                                                          │
 * │ O que seria segredo é a `service_role`, que ignora RLS. Ela não aparece  │
 * │ em lugar nenhum deste projeto, nem no servidor: a criação de pedido pelo │
 * │ cliente passa por uma função `security definer` que valida os            │
 * │ parâmetros. Chave que não existe no código não vaza.                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * O fluxo de caixa está ligado neste ambiente?
 *
 * Sem as duas variáveis não há banco. O painel diz isso em português claro e
 * o site continua funcionando pelo WhatsApp — nada é simulado, nada finge
 * ter gravado.
 */
export const caixaConfigurado = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Fuso de todo o sistema. Venda das 23h tem que cair no dia certo. */
export const FUSO = 'America/Sao_Paulo';
