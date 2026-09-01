'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarClock, House, Info, MessageCircle } from 'lucide-react'

/**
 * Navegação de celular. Quatro destinos no máximo, e o do WhatsApp só aparece
 * quando existe um número configurado — botão que não leva a lugar nenhum não
 * entra na tela.
 */
export function BottomNav({ whatsappUrl }: { whatsappUrl: string | null }) {
  const pathname = usePathname()

  const items = [
    { href: '/', label: 'Início', Icon: House },
    { href: '/meus-agendamentos', label: 'Meus horários', Icon: CalendarClock },
    { href: '/informacoes', label: 'Mais', Icon: Info },
  ]

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-line)] bg-base/95 backdrop-blur-sm sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-lg">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] transition-colors duration-150 ${
                  active ? 'text-gold' : 'text-muted'
                }`}
              >
                <item.Icon size={19} aria-hidden />
                {item.label}
              </Link>
            </li>
          )
        })}
        {whatsappUrl ? (
          <li className="flex-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] text-muted"
            >
              <MessageCircle size={19} aria-hidden />
              WhatsApp
            </a>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}
