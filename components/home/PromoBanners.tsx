import Image from 'next/image';
import Link from 'next/link';
import { banneresPromo } from '@/data/banners';

/**
 * Os dois banners promocionais menores — cachorros e gatos — logo abaixo das
 * categorias. As mesmas campanhas aparecem grandes no carrossel do topo; aqui
 * elas viram chamada fixa, como na referência.
 */
export default function PromoBanners() {
  return (
    <section id="promocoes" aria-label="Promoções" className="shell pt-8">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {banneresPromo.map((banner) => (
          <div
            key={banner.id}
            className={`relative overflow-hidden rounded-card bg-gradient-to-r ${banner.fundo}`}
          >
            {banner.imagem ? (
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[48%]"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, #000 30%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 30%)',
                }}
              >
                <Image
                  src={banner.imagem}
                  alt={banner.imagemAlt}
                  fill
                  sizes="(max-width: 640px) 50vw, 290px"
                  className="object-cover object-center"
                />
              </div>
            ) : null}

            <div className="relative z-10 max-w-[64%] px-5 py-6 sm:py-7">
              <p className="text-[15px] font-semibold leading-tight text-white sm:text-lg">
                {banner.titulo}
              </p>
              <p className="text-[1.375rem] font-extrabold leading-tight tracking-tight text-white sm:text-[1.75rem]">
                {banner.destaque}
              </p>
              <p className="mt-1.5 text-[12px] leading-snug text-white/90 sm:text-[13px]">
                {banner.subtitulo}
              </p>
              <Link
                href={banner.cta.href}
                className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-brand-700 transition-colors hover:bg-brand-50"
              >
                {banner.cta.texto}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
