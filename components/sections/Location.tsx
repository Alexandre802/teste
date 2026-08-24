import {
  business,
  fullAddress,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  whatsappUrl,
} from '@/lib/business';
import { PhoneIcon, PinIcon, WhatsAppIcon } from '../ui/Icons';
import { Reveal } from '../ui/Reveal';

export default function Location() {
  return (
    <section id="contato" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/75">
            Contato
          </p>
          <h2 className="mt-3 text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold leading-none tracking-tight text-white">
            Vem pra Michel
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <Reveal>
            <div className="glass flex h-full flex-col gap-6 rounded-[var(--radius-card)] p-7 sm:p-9">
              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/18 text-white">
                  <PinIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                    Endereço
                  </h3>
                  <address className="mt-1.5 not-italic leading-relaxed text-white/90">
                    {business.address.street}
                    <br />
                    {business.address.district}
                    <br />
                    {business.address.city} - {business.address.state}, {business.address.postalCode}
                  </address>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/18 text-white">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                    Telefone
                  </h3>
                  <a
                    href={`tel:${business.phoneE164}`}
                    className="mt-1.5 block text-lg font-bold text-white hover:text-white"
                  >
                    {business.phoneDisplay}
                  </a>
                  <p className="mt-1 text-sm text-muted">{business.openingNote}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                  Serviços
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {business.services.map((service) => (
                    <li
                      key={service}
                      className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white/90 ring-1 ring-inset ring-white/35"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row">
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 font-extrabold text-cocoa transition-transform hover:-translate-y-0.5"
                >
                  <PinIcon className="h-5 w-5" />
                  Como chegar
                </a>
                <a
                  href={whatsappUrl(`Olá! Gostaria de falar com a ${business.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/55 px-6 py-3.5 font-extrabold text-white transition-all hover:-translate-y-0.5 hover:border-white hover:text-white"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Chamar no WhatsApp
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass h-full min-h-[22rem] overflow-hidden rounded-[var(--radius-card)] p-1.5">
              <iframe
                src={mapsEmbedUrl}
                title={`Mapa — ${business.name}, ${fullAddress}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[21rem] w-full rounded-[1.3rem]"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
