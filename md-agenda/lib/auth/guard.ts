import 'server-only'

import { redirect } from 'next/navigation'
import { getAdminSession, type AdminSession } from './admin'

/**
 * Proteção server-side. Chamada no layout do painel e no topo de cada Server
 * Action — a página nunca é montada para quem não tem sessão.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return session
}

/** Versão para rotas de API: devolve null em vez de redirecionar. */
export async function adminOrNull(): Promise<AdminSession | null> {
  return getAdminSession()
}
