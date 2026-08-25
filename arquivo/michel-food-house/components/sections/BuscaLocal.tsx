import { business } from '@/lib/business';
import { searchSections } from '@/lib/seo';
import { Reveal } from '../ui/Reveal';

/**
 * Conteúdo de busca local — VISÍVEL, indexável e útil para quem lê.
 *
 * Substitui a ideia de um "menu oculto" de palavras-chave: texto escondido
 * que só o buscador enxerga é cloaking, viola as políticas de spam do Google
 * e coloca o domínio em risco de rebaixamento. Aqui os mesmos termos viram
 * conteúdo real, com links que levam ao cardápio.
 */
export default function BuscaLocal() {
  return (
    <section aria-labelledby="busca-titulo" className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <Reveal>
          <h2 id="busca-titulo" className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold leading-tight text-white">
            O que servimos em {business.address.city}
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            A {business.name} fica no {business.address.district}, em {business.address.city}-
            {business.address.state}, e atende no salão, para retirada e para entrega. Abaixo, o que
            as pessoas costumam procurar por aqui — tudo leva direto ao cardápio.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {searchSections.map((section, i) => (
            <Reveal key={section.title} delay={0.04 * i}>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                {section.title}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-x-1.5 gap-y-1.5">
                {section.terms.map((term) => (
                  <li key={term}>
                    <a
                      href="#cardapio"
                      className="inline-block rounded-full bg-white/10 px-3 py-1.5 text-xs text-muted ring-1 ring-inset ring-flame/15 transition-colors hover:bg-white/18 hover:text-white"
                    >
                      {term}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
