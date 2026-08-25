'use client';

/**
 * Estrutura em bento grid, só com fotos da própria unidade.
 *
 * Ao passar o mouse a foto cresce de leve, o nome da área sobe e um fio de luz
 * acende na borda. O clique abre a foto em tela cheia.
 */
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { ItemStagger, Stagger } from '@/components/motion/Reveal';
import { Lightbox } from '@/components/ui/Lightbox';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { blocosEstrutura } from '@/data/gallery';
import { cn } from '@/lib/utils';

/** Formato de cada bloco no desktop; no celular todos ficam em coluna. */
const areas: Record<string, string> = {
  grande: 'md:col-span-2 md:row-span-2 aspect-[4/5] md:aspect-auto',
  alto: 'md:col-span-1 md:row-span-2 aspect-[4/5] md:aspect-auto',
  largo: 'md:col-span-2 md:row-span-1 aspect-[16/10] md:aspect-auto',
  normal: 'md:col-span-1 md:row-span-1 aspect-[4/3] md:aspect-auto',
};

export function Structure() {
  const [aberta, setAberta] = useState<number | null>(null);
  const fotos = blocosEstrutura.map((bloco) => bloco.foto);

  return (
    <section id="estrutura" className="relative isolate bg-surface py-20 md:py-28">
      <div aria-hidden className="glow-azul anim-brilho right-[-14%] top-[16%] h-[26rem] w-[26rem] opacity-25" />

      <div className="shell">
        <SectionHeading
          sobrescrito="Estrutura"
          titulo="Conheça a estrutura Allp Fit"
          apoio={
            <>
              Salão amplo, pé-direito alto e iluminação em LED de ponta a ponta.
              Todas as fotos abaixo são da unidade da Av. Celso Garcia Cid.
            </>
          }
        />

        <Stagger
          className="mt-12 grid grid-cols-1 gap-3.5 md:auto-rows-[13.5rem] md:grid-cols-4 md:gap-4"
          intervalo={0.08}
        >
          {blocosEstrutura.map((bloco, i) => (
            <ItemStagger key={bloco.foto.id} y={28} className={cn('min-w-0', areas[bloco.span])}>
              <button
                type="button"
                onClick={() => setAberta(i)}
                aria-label={`Ampliar foto: ${bloco.foto.titulo}`}
                className="group relative block h-full w-full overflow-hidden rounded-[1.4rem] border border-white/10 text-left transition-[border-color,box-shadow] duration-500 hover:border-ciano/45 hover:shadow-[0_0_40px_-12px_rgba(0,221,253,0.45)]"
              >
                <Image
                  src={bloco.foto.src}
                  alt={bloco.foto.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />

                {/* leitura do texto sobre a foto */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-void/95 via-void/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ciano to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-90"
                />

                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                  <span className="min-w-0">
                    <span className="block font-display text-[1.05rem] font-bold leading-tight text-white md:text-lg">
                      {bloco.foto.titulo}
                    </span>
                    <span className="mt-1 block max-h-0 overflow-hidden text-xs leading-relaxed text-cinza opacity-0 transition-[max-height,opacity] duration-500 group-hover:max-h-16 group-hover:opacity-100 motion-reduce:max-h-16 motion-reduce:opacity-100">
                      {bloco.foto.legenda}
                    </span>
                  </span>

                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Maximize2 size={15} aria-hidden />
                  </span>
                </span>
              </button>
            </ItemStagger>
          ))}
        </Stagger>
      </div>

      <Lightbox fotos={fotos} indice={aberta} onFechar={() => setAberta(null)} onTrocar={setAberta} />
    </section>
  );
}
