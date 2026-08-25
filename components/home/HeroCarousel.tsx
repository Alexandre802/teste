'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { slides } from '@/data/banners';
import { business } from '@/data/business';
import { linkWhatsApp } from '@/lib/whatsapp';
import { IconeLoja, IconeSeta, IconeTelefone, IconeWhatsApp } from '@/components/ui/Icons';

const INTERVALO = 5000; // 5s — dentro da janela de 4 a 6 combinada
const PAUSA_APOS_INTERACAO = 9000;

/**
 * Carrossel do banner principal. CSS puro: o trilho é um flex que anda com
 * `translateX` e uma transição de 500ms — sem biblioteca de animação.
 *
 * O loop infinito vem de clonar o último slide antes do primeiro e o primeiro
 * depois do último. Ao chegar em um clone, a transição é desligada por um
 * quadro e a posição salta para o slide real equivalente: quem olha vê um giro
 * contínuo, sem o rebobinar de um `índice % n`.
 */
export default function HeroCarousel() {
  const n = slides.length;
  const estendido = [slides[n - 1], ...slides, slides[0]];

  const [pos, setPos] = useState(1); // 0 e n+1 são os clones
  const [semTransicao, setSemTransicao] = useState(false);
  const [pausado, setPausado] = useState(false);
  const retomar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toqueX = useRef<number | null>(null);

  const atual = ((pos - 1) % n + n) % n;

  /** Interação do usuário congela o giro automático por alguns segundos. */
  const pausarUmPouco = useCallback(() => {
    setPausado(true);
    if (retomar.current) clearTimeout(retomar.current);
    retomar.current = setTimeout(() => setPausado(false), PAUSA_APOS_INTERACAO);
  }, []);

  const avancar = useCallback(() => setPos((p) => p + 1), []);
  const voltar = useCallback(() => setPos((p) => p - 1), []);

  function irPara(indice: number) {
    pausarUmPouco();
    setPos(indice + 1);
  }

  // giro automático — parado quando a aba está oculta, no hover/foco, ou para
  // quem pediu menos movimento no sistema
  useEffect(() => {
    if (pausado || n <= 1) return;
    const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (menosMovimento) return;

    const relogio = setInterval(() => {
      if (!document.hidden) avancar();
    }, INTERVALO);
    return () => clearInterval(relogio);
  }, [pausado, avancar, n]);

  useEffect(() => () => { if (retomar.current) clearTimeout(retomar.current); }, []);

  /** Chegou em um clone: salta para o slide real sem transição. */
  function aoTerminarTransicao() {
    if (pos === n + 1) {
      setSemTransicao(true);
      setPos(1);
    } else if (pos === 0) {
      setSemTransicao(true);
      setPos(n);
    }
  }

  // religa a transição no quadro seguinte ao salto
  useEffect(() => {
    if (!semTransicao) return;
    const id = requestAnimationFrame(() => setSemTransicao(false));
    return () => cancelAnimationFrame(id);
  }, [semTransicao]);

  return (
    <section aria-label="Destaques da loja" aria-roledescription="carrossel" className="shell pt-4">
      <div className="overflow-hidden rounded-card">
        <div
          className="group relative"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
          onFocusCapture={() => setPausado(true)}
          onBlurCapture={() => setPausado(false)}
          onTouchStart={(e) => {
            toqueX.current = e.touches[0].clientX;
            pausarUmPouco();
          }}
          onTouchEnd={(e) => {
            if (toqueX.current === null) return;
            const distancia = e.changedTouches[0].clientX - toqueX.current;
            if (Math.abs(distancia) > 45) (distancia < 0 ? avancar : voltar)();
            toqueX.current = null;
          }}
        >
          <div
            onTransitionEnd={aoTerminarTransicao}
            className="flex"
            style={{
              transform: `translateX(-${pos * 100}%)`,
              transition: semTransicao ? 'none' : 'transform 500ms ease',
            }}
          >
            {estendido.map((slide, indice) => {
              const real = ((indice - 1) % n + n) % n;
              const visivel = indice === pos;
              return (
                <div
                  key={`${slide.id}-${indice}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${real + 1} de ${n}`}
                  aria-hidden={!visivel}
                  inert={!visivel}
                  className={`relative w-full shrink-0 bg-gradient-to-r ${slide.fundo}`}
                >
                  <div className="relative flex min-h-[17rem] items-center sm:min-h-[18rem] lg:min-h-[19.5rem]">
                    {/* a foto ocupa só a faixa da direita, como na referência; a
                        própria imagem tem a borda esquerda esmaecida e por isso
                        encosta no fundo sem emenda visível */}
                    {slide.imagem ? (
                      <div
                        className="pointer-events-none absolute inset-y-0 right-0 w-[52%] sm:w-[48%] lg:w-[45%]"
                        /* a foto encosta no fundo azul por um degradê de máscara:
                           o recorte muda de largura conforme a tela e um
                           esmaecimento gravado no arquivo apareceria cortado */
                        style={{
                          maskImage: 'linear-gradient(to right, transparent 0%, #000 28%)',
                          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 28%)',
                        }}
                      >
                        <Image
                          src={slide.imagem}
                          alt={slide.imagemAlt}
                          fill
                          sizes="(max-width: 640px) 55vw, (max-width: 1024px) 50vw, 560px"
                          priority={indice === 1}
                          className="object-cover object-center"
                        />
                      </div>
                    ) : null}

                    <div className="relative z-10 max-w-[60%] px-5 py-7 sm:max-w-[56%] sm:px-8 sm:py-9 lg:max-w-[54%] lg:px-10">
                      <h2 className="text-[1.5rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[2.125rem] lg:text-[2.5rem]">
                        {slide.titulo}
                        {slide.tituloDestaque ? (
                          <>
                            <br />
                            {slide.tituloDestaque}
                          </>
                        ) : null}
                      </h2>
                      <p className="mt-2 max-w-md text-[13px] leading-snug text-white/90 sm:mt-3 sm:text-base">
                        {slide.subtitulo}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                        <Link
                          href={slide.cta.href}
                          tabIndex={visivel ? undefined : -1}
                          className="whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-brand-700 transition-colors hover:bg-brand-50 sm:px-7 sm:py-3 sm:text-[15px]"
                        >
                          {slide.cta.texto}
                        </Link>
                        {slide.ctaWhatsApp ? (
                          <a
                            href={linkWhatsApp()}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={visivel ? undefined : -1}
                            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-wa px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-wa-dark sm:px-7 sm:py-3 sm:text-[15px]"
                          >
                            <IconeWhatsApp className="h-[18px] w-[18px]" />
                            Pedir no WhatsApp
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* setas: só no desktop, como combinado */}
          <button
            type="button"
            onClick={() => { pausarUmPouco(); voltar(); }}
            aria-label="Banner anterior"
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-700 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 lg:grid"
          >
            <IconeSeta className="h-5 w-5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => { pausarUmPouco(); avancar(); }}
            aria-label="Próximo banner"
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-700 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 lg:grid"
          >
            <IconeSeta className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2">
            {slides.map((slide, indice) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => irPara(indice)}
                aria-label={`Ir para o banner ${indice + 1}: ${slide.titulo} ${slide.tituloDestaque ?? ''}`}
                aria-current={indice === atual}
                className={`h-2 rounded-full transition-all ${
                  indice === atual ? 'w-6 bg-white' : 'w-2 bg-white/55 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* faixa de contato — igual à referência, presa ao pé do banner */}
        <div className="bg-brand-850">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3 text-white sm:justify-start sm:gap-x-8 sm:px-8">
            <a
              href={business.telefoneLink}
              className="flex items-center gap-2 text-[13px] font-semibold hover:underline sm:text-[15px]"
            >
              <IconeTelefone className="h-[18px] w-[18px]" />
              {business.telefone}
            </a>
            <span aria-hidden="true" className="hidden h-5 w-px bg-white/25 sm:block" />
            <a
              href={linkWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[13px] font-semibold hover:underline sm:text-[15px]"
            >
              <IconeWhatsApp className="h-[18px] w-[18px]" />
              {business.whatsapp}
            </a>
            <span aria-hidden="true" className="hidden h-5 w-px bg-white/25 sm:block" />
            <span className="flex items-center gap-2 text-[13px] font-semibold sm:text-[15px]">
              <IconeLoja className="h-[18px] w-[18px]" />
              Loja física em {business.cidadeUf}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
