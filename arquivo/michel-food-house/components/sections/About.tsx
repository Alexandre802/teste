import { aboutText, differentials } from '@/lib/business';
import { BurgerMark } from '../ui/Icons';
import { Reveal } from '../ui/Reveal';

export default function About() {
  return (
    <section id="sobre" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/75">
              Sobre nós
            </p>
            {/* Sem <br />: a tag não gera espaço no conteúdo de texto, e a
                frase chegava grudada ("Uma lanchonetede bairro, feitapara
                voltar.") para leitor de tela e para o buscador. A largura
                máxima é que decide onde quebrar. */}
            <h2 className="mt-3 max-w-[13ch] text-balance text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold leading-[0.95] tracking-tight text-white">
              Uma lanchonete de bairro, feita{' '}
              <span className="text-realce">para voltar.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-white/90">{aboutText}</p>

            <ul className="mt-9 flex flex-col gap-4">
              {differentials.map((item) => (
                <li key={item.title} className="glass flex gap-4 rounded-3xl p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/18 text-white">
                    <BurgerMark className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
