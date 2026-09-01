import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/guard'
import { getPublicSettings } from '@/lib/settings'
import { AdminShell } from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
}

/**
 * Proteção server-side do painel.
 *
 * `requireAdmin` roda antes de qualquer filho renderizar: sem sessão, a
 * resposta é um redirecionamento, não uma página vazia com dados no HTML.
 */
export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()
  const settings = await getPublicSettings()

  return (
    <AdminShell email={session.email} businessName={settings.businessName}>
      {children}
    </AdminShell>
  )
}
