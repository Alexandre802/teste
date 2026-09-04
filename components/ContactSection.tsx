import Image from 'next/image';
import type { ReactNode } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import { SectionHeading } from './ui/SectionHeading';
import { Reveal } from './ui/Reveal';
import { LocationMap } from './LocationMap';
import { IconeWhatsApp } from './ui/IconeWhatsApp';
import {
  emailUrl,
  siteConfig,
  telefoneUrl,
  whatsappUrl,
} from '@/lib/site-config';

export const ContactSection = () => (
  <section id="localizacao" className="relative isolate overflow-hidden bg-preto">
    {/* Fotografia de fundo com véu escuro suficiente para o texto respirar. */}
    <Image
      src="/imagens/contato/escritorio.webp"
      alt=""
      aria-hidden="true"
      fill
      sizes="100vw"
      className="-z-10 object-cover"
    />
    {/* Escuro o bastante para o texto, claro o bastante para a casa aparecer. */}
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-preto/80" />
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 bg-gradient-to-b from-preto via-transparent to-preto"
    />

    <div className="px-5 py-20 sm:py-24">
      <SectionHeading
        sobrescrito="Localização e contato"
        titulo={
          <>
            Estamos prontos
            <br /> para te atender.
          </>
        }
        descricao="Visite nosso escritório, fale com nossa equipe ou entre em contato pelo WhatsApp. Será um prazer ajudar você a encontrar o imóvel ideal."
        className="mx-auto max-w-3xl"
      />

      <div className="mx-auto mt-12 grid max-w-6xl items-stretch gap-5 lg:grid-cols-2">
        <Reveal className="flex">
          <CartaoDeContato />
        </Reveal>

        <Reveal delay={0.1} className="flex">
          <div className="w-full">
            <LocationMap />
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

const CartaoDeContato = () => (
  <div
    id="contato"
    className="w-full scroll-mt-8 rounded-card border border-dourado/20 bg-card/85 px-6 py-8 backdrop-blur-sm sm:px-8 sm:py-10"
  >
    <dl className="space-y-6">
      <Dado icone={<MapPin aria-hidden="true" strokeWidth={1.4} className="size-[18px] text-dourado" />} rotulo="Nosso endereço">
        {siteConfig.address.linha1}
        <br />
        {siteConfig.address.bairro}
        <br />
        {siteConfig.address.cidade}/{siteConfig.address.estado}
        <br />
        CEP: {siteConfig.address.cep}
      </Dado>

      <Dado icone={<Phone aria-hidden="true" strokeWidth={1.4} className="size-[18px] text-dourado" />} rotulo="Telefone">
        <a href={telefoneUrl} className="transition-colors hover:text-dourado-claro">
          {siteConfig.phoneExibicao}
        </a>
      </Dado>

      <Dado icone={<IconeWhatsApp className="size-4 text-dourado" />} rotulo="WhatsApp">
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-dourado-claro"
        >
          {siteConfig.whatsappExibicao}
        </a>
      </Dado>

      <Dado icone={<Mail aria-hidden="true" strokeWidth={1.4} className="size-[18px] text-dourado" />} rotulo="E-mail">
        <a href={emailUrl} className="break-all transition-colors hover:text-dourado-claro">
          {siteConfig.email}
        </a>
      </Dado>

      <Dado icone={<Clock aria-hidden="true" strokeWidth={1.4} className="size-[18px] text-dourado" />} rotulo="Horário">
        {siteConfig.horario.map((faixa) => (
          <span key={faixa.dias} className="mt-0.5 block first:mt-0">
            {faixa.dias}: {faixa.horas}
          </span>
        ))}
      </Dado>
    </dl>

    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="botao-dourado mt-9 flex min-h-[54px] items-center justify-center gap-2.5 rounded-botao px-6 text-[0.95rem] font-semibold tracking-wide transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
    >
      <span className="flex size-6 items-center justify-center rounded-full border border-[#14100a]/45">
        <IconeWhatsApp className="size-3.5" />
      </span>
      Falar no WhatsApp
    </a>
  </div>
);

type DadoProps = {
  icone: ReactNode;
  rotulo: string;
  children: ReactNode;
};

const Dado = ({ icone, rotulo, children }: DadoProps) => (
  <div className="flex items-start gap-3.5">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dourado/40">
      {icone}
    </span>

    <div className="min-w-0">
      <dt className="sobrescrito text-dourado">{rotulo}</dt>
      <dd className="mt-1.5 text-[0.92rem] leading-relaxed text-branco">{children}</dd>
    </div>
  </div>
);
