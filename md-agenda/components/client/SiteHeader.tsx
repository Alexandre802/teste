import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { Wordmark } from '@/components/ui/Logo'

export function SiteHeader({ businessName }: { businessName: string }) {
  return (
    <header className="flex items-center justify-between gap-4 pt-5">
      <Link href="/" aria-label={`${businessName} — início`}>
        <Wordmark businessName={businessName} />
      </Link>
      <Link
        href="/meus-agendamentos"
        className="hidden items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] text-muted transition-colors duration-150 hover:border-line-strong hover:text-ink sm:inline-flex"
      >
        <CalendarClock size={15} aria-hidden />
        Meus agendamentos
      </Link>
    </header>
  )
}
