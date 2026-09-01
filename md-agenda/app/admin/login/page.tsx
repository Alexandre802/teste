import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Wordmark } from '@/components/ui/Logo'
import { LoginForm } from '@/components/admin/LoginForm'
import { getAdminSession, isAdminAuthConfigured } from '@/lib/auth/admin'
import { getPublicSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Entrar no painel',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect('/admin')
  const settings = await getPublicSettings()

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-10">
      <div className="mb-8">
        <Wordmark size="lg" businessName={settings.businessName} />
      </div>

      <h1 className="text-[26px] leading-tight text-display">Painel do {settings.barberName}</h1>
      <p className="mt-2 mb-7 text-[14px] text-muted">
        Acesso restrito. A agenda dos clientes fica em outra área e não pede login.
      </p>

      <LoginForm authConfigured={isAdminAuthConfigured()} />
    </main>
  )
}
