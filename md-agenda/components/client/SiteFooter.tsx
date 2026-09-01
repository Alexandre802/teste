import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { formatPhoneBR } from '@/lib/format'

/**
 * Rodapé. Endereço e telefone só aparecem quando alguém os cadastrou no
 * painel — o site não inventa dado de contato.
 */
export function SiteFooter({
  businessName,
  address,
  phone,
}: {
  businessName: string
  address: string | null
  phone: string | null
}) {
  return (
    <footer className="mt-14 border-t border-[color:var(--color-line)] pt-7 pb-6 text-[13px] text-muted">
      <div className="grid gap-3">
        {address ? (
          <p className="flex items-start gap-2">
            <MapPin size={15} className="mt-0.5 shrink-0 text-gold/70" aria-hidden />
            {address}
          </p>
        ) : null}
        {phone ? (
          <p className="flex items-center gap-2">
            <Phone size={15} className="shrink-0 text-gold/70" aria-hidden />
            {formatPhoneBR(phone)}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span>
          {businessName} — Seu horário, sem complicação.
        </span>
        <Link href="/politica-de-privacidade" className="underline underline-offset-4 hover:text-ink">
          Política de privacidade
        </Link>
      </div>
    </footer>
  )
}
