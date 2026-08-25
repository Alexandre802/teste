'use client';

/**
 * Faixa de conversão sobre foto da unidade. Usada duas vezes: depois dos
 * planos e no fecho da página. Com `luz`, uma banda de luz atravessa o fundo
 * devagar — o mesmo gesto das fitas de LED do salão.
 */
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { BotaoLink } from '@/components/ui/Button';
import { NeonLines } from '@/components/ui/NeonLines';
import { mensagens, whatsapp } from '@/data/academy';
import type { Foto } from '@/data/gallery';
import { cn } from '@/lib/utils';

type Props = {
  id?: string;
  sobrescrito: string;
  titulo: string;
  texto: string;
  foto: Foto;
  rotuloPrimario: string;
  hrefPrimario: string;
  mensagemWhatsapp?: string;
  /** Título gigante + luz percorrendo o fundo (fecho da página). */
  destaque?: boolean;
};

export function CtaBanner({
  id,
  sobrescrito,
  titulo,
  texto,
  foto,
  rotuloPrimario,
  hrefPrimario,
  mensagemWhatsapp = mensagens.matricula,
  destaque = false,
}: Props) {
  const semMovimento = useReducedMotion();

  return (
    <section
      id={id}
      className={cn(
        'relative isolate grain overflow-hidden',
        destaque ? 'py-24 md:py-36' : 'py-20 md:py-28',
      )}
    >
      <Image
        src={foto.src}
        alt={foto.alt}
        fill
        sizes="100vw"
        quality={78}
        className="-z-20 object-cover object-center"
      />

      {/* véu roxo/azul: a foto continua legível e a marca continua no comando */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(9,9,15,0.9)_0%,rgba(53,16,120,0.66)_45%,rgba(34,87,255,0.38)_100%)]"
      />
      {/* leve escurecida geral: mantém o texto legível sem apagar a foto */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-void/15" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(90%_75%_at_50%_50%,rgba(9,9,15,0.55)_0%,transparent_70%)]"
      />
      <NeonLines variante="transicao" className="-z-10 opacity-40" />

      {destaque && (
        <motion.div
          aria-hidden
          className="absolute inset-y-0 -z-10 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(0,221,253,0.16),transparent)]"
          animate={semMovimento ? undefined : { x: ['-40%', '340%'] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <div className="shell relative text-center">
        <Reveal>
          <span className="eyebrow justify-center">{sobrescrito}</span>
        </Reveal>

        <TextReveal
          centro
          texto={titulo}
          className={cn(
            'mx-auto mt-4 max-w-4xl font-display font-extrabold text-white',
            destaque ? 'display-xl' : 'display-lg',
          )}
          delay={0.05}
        />

        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            {texto}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BotaoLink href={hrefPrimario} tamanho="lg" className="w-full sm:w-auto">
              {rotuloPrimario}
              <ArrowRight
                size={18}
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </BotaoLink>

            <BotaoLink
              href={whatsapp(mensagemWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              variante="led"
              tamanho="lg"
              className="w-full sm:w-auto"
            >
              <MessageCircle size={18} aria-hidden />
              Falar no WhatsApp
            </BotaoLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
