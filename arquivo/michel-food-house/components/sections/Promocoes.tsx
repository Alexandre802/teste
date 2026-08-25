import { business, whatsappUrl } from '@/lib/business';
import { WhatsAppIcon } from '../ui/Icons';
import { Reveal } from '../ui/Reveal';
import { SplitHeading } from '../ui/Motion';

/**
 * Estrutura pronta para promoções. Enquanto `promocoes` estiver vazio, a
 * seção mostra o aviso discreto — nenhuma promoção é inventada.
 * Para publicar uma, basta acrescentar um item ao array.
 */
interface Promo {
  title: string;
  detail: string;
  validity?: string;
}

export const promocoes: Promo[] = [];

export default function Promocoes() {
  return (
    <section id="promocoes" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/75">
            Promoções
          </p>
          <SplitHeading text="O que está rolando" className="mt-3 text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold leading-none tracking-tight text-white" />
        </Reveal>

        {promocoes.length === 0 ? (
          <Reveal delay={0.08}>
            <div className="glass mt-8 flex flex-col items-start gap-5 rounded-[var(--radius-card)] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <p className="max-w-xl text-lg leading-relaxed text-white/90">
                Fique de olho nas novidades da {business.name}. Quando tiver promoção, ela aparece
                aqui primeiro.
              </p>
              <a
                href={whatsappUrl(
                  `Olá! Quero ficar sabendo das promoções da ${business.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/55 px-6 py-3.5 font-extrabold text-white transition-all hover:-translate-y-0.5 hover:border-white hover:text-white"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Me avisa no WhatsApp
              </a>
            </div>
          </Reveal>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {promocoes.map((promo, i) => (
              <Reveal key={promo.title} delay={0.06 * i} className="h-full">
                <li className="glass flex h-full flex-col rounded-[var(--radius-card)] p-7">
                  <h3 className="text-xl font-extrabold text-white">{promo.title}</h3>
                  <p className="mt-2 flex-1 leading-relaxed text-muted">{promo.detail}</p>
                  {promo.validity && (
                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white">
                      {promo.validity}
                    </p>
                  )}
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
