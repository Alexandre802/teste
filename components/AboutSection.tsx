import Image from 'next/image';
import { Aperture, ClipboardList, Gem, Handshake, Users, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { SectionHeading } from './ui/SectionHeading';
import { Reveal } from './ui/Reveal';
import { AboutFeatures } from './AboutFeatures';
import { IconeWhatsApp } from './ui/IconeWhatsApp';
import { whatsappUrl } from '@/lib/site-config';

type Detalhe = { icone: LucideIcon; titulo: string; texto: string };

const detalhes: Detalhe[] = [
  { icone: ClipboardList, titulo: 'Consultoria', texto: 'Análise do perfil e objetivos do cliente.' },
  { icone: Aperture, titulo: 'Curadoria', texto: 'Seleção precisa de imóveis exclusivos.' },
  { icone: Handshake, titulo: 'Negociação', texto: 'Condições vantajosas e negociações seguras.' },
  { icone: UsersRound, titulo: 'Acompanhamento', texto: 'Do início ao pós-venda, sempre ao seu lado.' },
];

export const AboutSection = () => (
  <section id="sobre">
    {/* ---------- Abertura + primeiro bloco, sobre creme ---------- */}
    <div className="textura-papel bg-creme px-5 pt-20 pb-16 sm:pt-24 sm:pb-20">
      <SectionHeading
        tom="claro"
        sobrescrito="Apresentação"
        titulo={
          <>
            Conheça uma imobiliária
            <br /> feita para imóveis{' '}
            <span className="text-dourado">exclusivos.</span>
          </>
        }
        descricao="Atendimento personalizado, seleção criteriosa e acompanhamento em cada etapa da compra."
        className="mx-auto max-w-3xl"
      />

      <div className="mx-auto mt-12 grid max-w-6xl items-stretch gap-5 lg:grid-cols-2">
        <Reveal className="flex">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-card sm:aspect-[16/10] lg:aspect-auto lg:min-h-[420px]">
            <Image
              src="/imagens/sobre/excelencia.webp"
              alt="Casa de alto padrão iluminada ao anoitecer, com piscina e coqueiros no jardim."
              fill
              sizes="(min-width: 1024px) 44vw, 92vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex">
          <div className="flex w-full flex-col justify-center rounded-card border border-[#c9b48c]/60 bg-creme-escuro/45 px-6 py-9 sm:px-9 sm:py-11">
            <span className="flex size-14 items-center justify-center self-center rounded-full border border-dourado/50 lg:self-start">
              <Gem aria-hidden="true" strokeWidth={1.2} className="size-6 text-dourado" />
            </span>

            <h3 className="mt-6 text-center font-serif text-[1.6rem] leading-tight font-light text-[#2a2118] sm:text-[1.85rem] lg:text-left">
              Excelência em cada escolha.
            </h3>

            <p className="mt-4 text-center text-[0.95rem] leading-relaxed text-[#6b5f4f] lg:text-left">
              Selecionamos apenas imóveis que atendem aos mais altos padrões de localização,
              arquitetura e valorização.
            </p>

            <div className="mt-7 flex items-start gap-3 border-t border-[#c9b48c]/50 pt-6">
              <Users
                aria-hidden="true"
                strokeWidth={1.3}
                className="mt-0.5 size-5 shrink-0 text-dourado"
              />
              <p className="text-[0.9rem] leading-relaxed text-[#6b5f4f]">
                Foco total no que realmente importa: encontrar o imóvel ideal para você.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>

    {/* ---------- Faixa escura ---------- */}
    <div className="bg-carvao px-5 py-20 sm:py-24">
      <SectionHeading
        titulo={
          <>
            Mais do que imóveis,
            <br /> uma experiência de{' '}
            <span className="text-dourado-claro">escolha.</span>
          </>
        }
        descricao="Unimos conhecimento de mercado, relacionamento e discrição para transformar a busca pelo imóvel ideal em uma jornada segura, eficiente e prazerosa."
        className="mx-auto max-w-3xl"
      />

      <AboutFeatures />
    </div>

    {/* ---------- Segundo bloco institucional, de volta ao creme ---------- */}
    <div className="textura-papel bg-creme px-5 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-stretch gap-5 lg:grid-cols-2">
        <Reveal className="flex">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-card sm:aspect-[16/10] lg:aspect-auto lg:min-h-[440px]">
            <Image
              src="/imagens/sobre/detalhes.webp"
              alt="Sala de estar ampla com janelões voltados para o mar durante o pôr do sol."
              fill
              sizes="(min-width: 1024px) 44vw, 92vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex">
          <div className="flex w-full flex-col justify-center rounded-card border border-[#c9b48c]/60 bg-creme-escuro/45 px-6 py-9 sm:px-9 sm:py-11">
            <h3 className="text-center font-serif text-[1.75rem] leading-tight font-light text-[#2a2118] sm:text-[2.1rem]">
              Atuação com atenção
              <br /> aos <span className="text-dourado">detalhes.</span>
            </h3>

            <p className="mt-4 text-center text-[0.95rem] leading-relaxed text-[#6b5f4f]">
              Cuidamos de todos os detalhes para que você tenha tranquilidade e segurança na
              decisão.
            </p>

            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {detalhes.map(({ icone: Icone, titulo, texto }) => (
                <li key={titulo} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dourado/45">
                    <Icone aria-hidden="true" strokeWidth={1.3} className="size-4 text-dourado" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-[0.92rem] font-semibold text-[#2a2118]">{titulo}</h4>
                    <p className="mt-1 text-[0.82rem] leading-relaxed text-[#6b5f4f]">{texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>

    {/* ---------- Chamada final da apresentação ---------- */}
    <div className="bg-carvao px-5 py-20 sm:py-24">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span aria-hidden="true" className="block h-px w-14 bg-dourado/60" />

        <p className="mt-8 font-serif text-[clamp(1.7rem,7.2vw,2.5rem)] leading-[1.15] font-light text-branco">
          Encontre seu próximo imóvel
          <br /> com{' '}
          <span className="text-dourado-claro">exclusividade.</span>
        </p>

        <a
          href={whatsappUrl('Olá! Gostaria de falar com um especialista sobre os imóveis.')}
          target="_blank"
          rel="noopener noreferrer"
          className="botao-dourado mt-9 flex min-h-[54px] w-full max-w-[20rem] items-center justify-center gap-2.5 rounded-botao px-6 text-[0.95rem] font-semibold tracking-wide transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
        >
          <span className="flex size-6 items-center justify-center rounded-full border border-[#14100a]/45">
            <IconeWhatsApp className="size-3.5" />
          </span>
          Falar com especialista
        </a>
      </Reveal>
    </div>
  </section>
);
