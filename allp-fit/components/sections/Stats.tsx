/**
 * Faixa de impacto depois do hero.
 *
 * Só o que é número confirmado ganha contador animado (a nota do Google). Onde
 * a academia não informou quantidade, entra um destaque em texto — o site não
 * inventa "+150 equipamentos".
 */
import { Counter } from '@/components/motion/Counter';
import { ItemStagger, Stagger } from '@/components/motion/Reveal';
import { NeonDivider } from '@/components/ui/NeonLines';
import { indicadores } from '@/data/differentials';

export function Stats() {
  return (
    <section aria-label="A Allp Fit em números" className="relative isolate bg-surface">
      <NeonDivider />

      <div className="shell py-14 md:py-20">
        <Stagger
          as="ul"
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8"
          intervalo={0.1}
        >
          {indicadores.map((item) => (
            <ItemStagger as="li" key={item.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-3 top-1 hidden h-10 w-px bg-gradient-to-b from-ciano/70 to-transparent md:block"
              />

              <p className="font-display text-[clamp(1.75rem,4.2vw,2.9rem)] font-extrabold leading-none tracking-[-0.04em] text-white">
                {item.numero !== null ? (
                  <>
                    <Counter valor={item.numero} decimais={item.decimais ?? 0} sufixo={item.sufixo} />
                    {item.id === 'nota' && (
                      <span aria-hidden className="ml-1 align-top text-laranja">
                        ★
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-led">{item.destaque}</span>
                )}
              </p>

              <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/90">
                {item.titulo}
              </p>
              <p className="mt-2 max-w-[22ch] text-sm leading-relaxed text-cinza">{item.descricao}</p>
            </ItemStagger>
          ))}
        </Stagger>
      </div>

      <NeonDivider />
    </section>
  );
}
