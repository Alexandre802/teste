'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { galleryPhotos } from '@/lib/photos';
import { Reveal } from '../ui/Reveal';
import { CloseIcon } from '../ui/Icons';

/** Galeria com lightbox. Fotos reais da casa, sem rótulo de produto. */
export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section aria-labelledby="galeria-titulo" className="py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-flame-soft">
            Galeria
          </p>
          <h2 id="galeria-titulo" className="mt-3 text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold leading-none tracking-tight text-cream">
            Direto da chapa
          </h2>
        </Reveal>

        <ul className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {galleryPhotos.map((photo, i) => (
            <Reveal key={photo.src} delay={0.05 * i} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
              <li className="h-full list-none">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Ampliar foto: ${photo.alt}`}
                  className="group relative block h-full w-full overflow-hidden rounded-3xl ring-1 ring-inset ring-flame/20"
                >
                  <span className={`block ${i === 0 ? 'aspect-square' : 'aspect-[4/5]'}`}>
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes={i === 0 ? '(max-width: 640px) 92vw, 46vw' : '(max-width: 640px) 46vw, 23vw'}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </span>
                  <span className="absolute inset-0 bg-ink/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-ink/95 p-5"
            role="dialog"
            aria-modal="true"
            aria-label={galleryPhotos[open].alt}
            onClick={() => setOpen(null)}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Fechar"
              className="absolute right-5 top-5 rounded-full bg-ink-3 p-3 text-cream"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              className="relative h-[76vh] w-full max-w-4xl"
            >
              <Image
                src={galleryPhotos[open].src}
                alt={galleryPhotos[open].alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
