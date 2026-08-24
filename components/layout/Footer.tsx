import { business, whatsappUrl } from '@/lib/business';
import { BurgerMark, WhatsAppIcon } from '../ui/Icons';

const LINKS = [
  { href: '#inicio', label: 'Início' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#contato', label: 'Contato' },
];

export default function Footer() {
  return (
    <footer className="border-t border-flame/20 bg-ink-2/60 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <BurgerMark className="h-9 w-9 text-gold" />
              <span className="text-lg font-extrabold text-cream">{business.name}</span>
            </div>
            <p className="mt-3 max-w-sm text-muted">{business.slogan}</p>
            <p className="mt-5 text-sm text-muted">
              ★ {business.rating.value.toString().replace('.', ',')} · {business.rating.count}{' '}
              avaliações no Google · {business.priceRange}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gold">Endereço</h3>
            <address className="mt-3 not-italic leading-relaxed text-muted">
              {business.address.street}
              <br />
              {business.address.district}
              <br />
              {business.address.city} - {business.address.state}
            </address>
            <a
              href={`tel:${business.phoneE164}`}
              className="mt-3 inline-block font-bold text-cream hover:text-gold"
            >
              {business.phoneDisplay}
            </a>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gold">Navegar</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-muted transition-colors hover:text-gold">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={whatsappUrl(`Olá! Vim pelo site da ${business.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted transition-colors hover:text-gold"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-flame/15 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
          </p>
          <p>{business.openingNote}</p>
        </div>
      </div>
    </footer>
  );
}
