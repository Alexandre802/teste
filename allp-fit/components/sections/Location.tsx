/**
 * Localização: endereço, telefone, rota e o mapa do Google incorporado (sem
 * chave de API — é a incorporação pública do próprio Maps), ao lado do cartão
 * de horários.
 */
import { MapPin, Navigation, Phone } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { BotaoLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Hours } from '@/components/sections/Hours';
import { academy, enderecoCompleto, links, mensagens, whatsapp } from '@/data/academy';

export function Location() {
  return (
    <section id="localizacao" className="relative isolate bg-surface py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          sobrescrito="Localização"
          titulo="Perto de você."
          apoio={<>No Centro de Londrina, na Av. Celso Garcia Cid, com estacionamento em frente.</>}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <div className="grid gap-6">
            <Reveal className="card p-6">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-roxo/35 to-azul/20 text-ciano">
                  <MapPin size={17} aria-hidden />
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-white">{academy.nomeCompleto}</p>
                  <address className="mt-1.5 text-sm not-italic leading-relaxed text-cinza">
                    {academy.endereco.rua}
                    <br />
                    {academy.endereco.bairro} — {academy.endereco.cidade}/{academy.endereco.estado}
                    <br />
                    CEP {academy.endereco.cep}
                  </address>

                  <a
                    href={links.telefone}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-laranja"
                  >
                    <Phone size={15} aria-hidden />
                    {academy.telefone.exibicao}
                  </a>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <BotaoLink
                  href={links.rota}
                  target="_blank"
                  rel="noopener noreferrer"
                  variante="led"
                  className="w-full sm:w-auto"
                >
                  <Navigation size={16} aria-hidden />
                  Como chegar
                </BotaoLink>
                <BotaoLink
                  href={whatsapp(mensagens.geral)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  Chamar no WhatsApp
                </BotaoLink>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <Hours />
            </Reveal>
          </div>

          <Reveal delay={0.12} y={34}>
            <div>
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-void">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-ciano to-transparent"
                />
                <iframe
                  title={`Mapa com a localização da ${academy.nomeCompleto} — ${enderecoCompleto}`}
                  src={links.mapaEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[24rem] w-full border-0 grayscale-[0.25] contrast-[1.05] md:h-[34rem]"
                />
              </div>

              <p className="mt-3 text-xs text-white/45">
                O mapa não carregou?{' '}
                <a
                  href={links.perfilMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white/75 underline decoration-ciano/60 underline-offset-4 hover:text-white"
                >
                  Abra a Allp Fit no Google Maps
                </a>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
