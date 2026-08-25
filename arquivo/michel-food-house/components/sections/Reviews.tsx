'use client';

import { business, reviews } from '@/lib/business';
import { StarIcon } from '../ui/Icons';
import { Reveal } from '../ui/Reveal';
import { CountUp, SplitHeading } from '../ui/Motion';

function Stars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-white" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} className={className} filled={i <= Math.round(value)} />
      ))}
    </span>
  );
}

export default function Reviews() {
  return (
    <section aria-labelledby="avaliacoes-titulo" className="py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/75">
            Avaliações
          </p>
          <SplitHeading id="avaliacoes-titulo" text="Quem prova, recomenda" className="mt-3 text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold leading-none tracking-tight text-white" />

          <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full glass px-7 py-4">
            <span className="text-4xl font-extrabold leading-none text-white tabular-nums">
              <CountUp to={business.rating.value} decimals={1} />
            </span>
            <span className="text-sm text-muted">/ 5</span>
            <Stars value={business.rating.value} className="h-5 w-5" />
            <span className="text-sm text-white/85">
              <CountUp to={business.rating.count} /> avaliações no {business.rating.source}
            </span>
          </div>
        </Reveal>

        <ul className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <Reveal key={review.text} delay={0.06 * i} className="h-full">
              <li className="glass flex h-full flex-col gap-4 rounded-[var(--radius-card)] p-6 transition-transform duration-300 hover:-translate-y-1">
                <Stars value={5} />
                <blockquote className="text-[0.95rem] leading-relaxed text-white/90">
                  “{review.text}”
                </blockquote>
                <p className="mt-auto text-xs font-semibold uppercase tracking-wider text-muted">
                  Avaliação no Google
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
