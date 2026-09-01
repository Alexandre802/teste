'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings,
  UsersRound,
} from 'lucide-react'
import { LogoMark } from '@/components/ui/Logo'
import { logoutAction } from '@/app/admin/actions'

const LINKS = [
  { href: '/admin', label: 'Início', Icon: LayoutDashboard },
  { href: '/admin/agenda', label: 'Agenda', Icon: CalendarDays },
  { href: '/admin/clientes', label: 'Clientes', Icon: UsersRound },
  { href: '/admin/servicos', label: 'Serviços', Icon: Scissors },
  { href: '/admin/configuracoes', label: 'Ajustes', Icon: Settings },
]

/** Sidebar no desktop, barra inferior no celular. Mesma identidade da área do cliente, sem o hero. */
export function AdminShell({
  email,
  businessName,
  children,
}: {
  email: string
  businessName: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  function isActive(href: string) {
    return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
  }

  return (
    <div className="min-h-dvh sm:flex">
      <aside className="hidden w-60 shrink-0 border-r border-[color:var(--color-line)] px-4 py-6 sm:flex sm:flex-col">
        <Link href="/admin" className="mb-8 flex items-center gap-2.5">
          <LogoMark size={28} className="text-gold" />
          <div className="leading-none">
            <p className="text-[15px] font-semibold text-ink">{businessName}</p>
            <p className="mt-1 text-[10px] tracking-[0.16em] text-muted uppercase">Painel</p>
          </div>
        </Link>

        <nav aria-label="Painel">
          <ul className="grid gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition-colors duration-150 ${
                    isActive(link.href)
                      ? 'bg-surface-2 text-gold'
                      : 'text-muted hover:bg-white/4 hover:text-ink'
                  }`}
                >
                  <link.Icon size={17} aria-hidden />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-6">
          <p className="truncate text-[12px] text-muted" title={email}>
            {email}
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-2 inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-danger"
            >
              <LogOut size={15} aria-hidden />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 px-4 pb-24 sm:px-8 sm:pb-10">{children}</main>

      <nav
        aria-label="Painel"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-line)] bg-base/95 backdrop-blur-sm sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="flex">
          {LINKS.filter((link) => link.href !== '/admin/servicos').map((link) => (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] transition-colors duration-150 ${
                  isActive(link.href) ? 'text-gold' : 'text-muted'
                }`}
              >
                <link.Icon size={19} aria-hidden />
                {link.label === 'Ajustes' ? 'Mais' : link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
