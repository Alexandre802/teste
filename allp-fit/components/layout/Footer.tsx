/**
 * Rodapé: marca, links rápidos, endereço e contatos. O Instagram só aparece
 * quando o endereço do perfil for preenchido em data/academy.ts.
 */
import { MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { NeonDivider } from '@/components/ui/NeonLines';
import { academy, links, mensagens, whatsapp } from '@/data/academy';
import { notaHorario } from '@/data/businessHours';
import { menuRodape } from '@/lib/navigation';

export function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-void pt-16 pb-28 md:pb-14">
      <NeonDivider className="absolute inset-x-0 top-0" />
      <div aria-hidden className="glow-roxo left-1/2 top-[-6rem] h-[20rem] w-[26rem] -translate-x-1/2 opacity-20" />

      <div className="shell relative">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cinza">
              Academia no Centro de Londrina: musculação, cardio e aulas coletivas
              em um salão amplo, com estrutura para todo tipo de treino.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={whatsapp(mensagens.geral)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-ciano/60"
              >
                WhatsApp
              </a>
              <a
                href={academy.site}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-ciano/60"
              >
                allpfit.com.br
              </a>
              {academy.redes.instagram && (
                <a
                  href={academy.redes.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-ciano/60"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>

          <nav aria-label="Links do rodapé">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/45">
              Navegar
            </p>
            <ul className="mt-4 grid gap-2.5">
              {menuRodape.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-cinza transition-colors hover:text-white"
                  >
                    {item.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/45">
              Contato
            </p>

            <address className="mt-4 text-sm not-italic leading-relaxed text-cinza">
              <span className="flex items-start gap-2">
                <MapPin size={15} aria-hidden className="mt-0.5 shrink-0 text-ciano" />
                <span>
                  {academy.endereco.rua}
                  <br />
                  {academy.endereco.bairro} — {academy.endereco.cidade}/{academy.endereco.estado}
                  <br />
                  CEP {academy.endereco.cep}
                </span>
              </span>

              <a
                href={links.telefone}
                className="mt-4 flex items-center gap-2 font-semibold text-white transition-colors hover:text-laranja"
              >
                <Phone size={15} aria-hidden className="text-ciano" />
                {academy.telefone.exibicao}
              </a>
            </address>

            <p className="mt-4 text-sm text-cinza">{notaHorario}</p>

            <a
              href={links.rota}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-white underline decoration-laranja decoration-2 underline-offset-4 hover:text-laranja"
            >
              Como chegar
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 text-center sm:flex-row sm:text-left md:pr-40">
          <p className="text-xs text-white/45">
            © {ano} {academy.nome}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/35">
            {academy.endereco.cidade}/{academy.endereco.estado}
          </p>
        </div>
      </div>
    </footer>
  );
}
