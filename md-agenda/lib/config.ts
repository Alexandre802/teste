/**
 * Leitura de ambiente. Nenhum valor real vive aqui — só o nome da variável e
 * o que fazer quando ela falta.
 *
 * Nada de segredo em NEXT_PUBLIC_*: esse prefixo entrega o valor ao navegador.
 */

function read(name: string): string | null {
  const value = process.env[name]
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const supabaseUrl = () => read('NEXT_PUBLIC_SUPABASE_URL')
export const supabaseAnonKey = () => read('NEXT_PUBLIC_SUPABASE_ANON_KEY')
export const supabaseServiceRoleKey = () => read('SUPABASE_SERVICE_ROLE_KEY')

/** O front só consegue falar com o Supabase com URL e chave anônima. */
export function isSupabasePublicConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey())
}

/** O servidor grava agendamento com a service role, nunca o navegador. */
export function isSupabaseServerConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseServiceRoleKey())
}

/**
 * Banco local em memória, para desenvolvimento e para a suíte automatizada.
 *
 * Só liga quando pedido explicitamente E quando não há Supabase configurado —
 * um ambiente com banco real jamais cai nele por acidente. Enquanto está
 * ligado, a interface diz na tela que os dados não são permanentes.
 */
export function isLocalStoreEnabled(): boolean {
  return read('MD_AGENDA_LOCAL_STORE') === '1' && !isSupabaseServerConfigured()
}

export function isDatabaseConfigured(): boolean {
  return isSupabaseServerConfigured() || isLocalStoreEnabled()
}

export const siteUrl = () => read('NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000'

/** Número do Maicon no formato internacional só com dígitos. */
export function whatsappNumber(): string | null {
  const raw = read('MAICON_WHATSAPP_NUMBER')
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 12 ? digits : null
}

export const whatsappToken = () => read('WHATSAPP_TOKEN')
export const whatsappPhoneNumberId = () => read('WHATSAPP_PHONE_NUMBER_ID')
export const whatsappVerifyToken = () => read('WHATSAPP_VERIFY_TOKEN')

/** A Cloud API é um extra. Sem ela o wa.me continua entregando o pedido. */
export function isWhatsappCloudApiConfigured(): boolean {
  return Boolean(whatsappToken() && whatsappPhoneNumberId())
}

/** Segredo usado para assinar o cookie da sessão local do painel. */
export const localAdminSecret = () => read('MD_AGENDA_LOCAL_ADMIN_SECRET')
export const localAdminEmail = () => read('MD_AGENDA_LOCAL_ADMIN_EMAIL')
export const localAdminPassword = () => read('MD_AGENDA_LOCAL_ADMIN_PASSWORD')

export function isLocalAdminConfigured(): boolean {
  return Boolean(
    isLocalStoreEnabled() && localAdminEmail() && localAdminPassword() && localAdminSecret(),
  )
}
