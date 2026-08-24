'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Logo } from '../ui/Logo';

/**
 * O lema da casa. Aparece no banner das fotos do próprio estabelecimento,
 * então é conteúdo real da marca, não enfeite.
 */
export default function Versiculo() {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="lema-titulo" className="py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <motion.figure
          initial={reduce ? false : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative mx-auto flex max-w-4xl flex-col items-center gap-6 overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-12 sm:py-16"
        >
          <Logo size={72} />

          <h2
            id="lema-titulo"
            className="text-[clamp(1.75rem,4.5vw,3rem)] font-extrabold leading-tight tracking-tight text-white text-balance"
          >
            Deus é bom o tempo todo
          </h2>

          <span className="h-px w-16 bg-white/40" aria-hidden="true" />

          <blockquote className="max-w-2xl text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-white/90">
            <p>
              &ldquo;Tudo o que fizerem, façam-no de todo o coração, como para o Senhor, e não
              para os homens.&rdquo;
            </p>
          </blockquote>

          <figcaption className="text-xs font-extrabold uppercase tracking-[0.28em] text-white/70">
            Colossenses 3:23
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
