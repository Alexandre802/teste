import { Building2, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { navegacao, servicos, siteConfig } from '@/lib/site-config';

const redes = [
  { rotulo: 'Instagram', href: siteConfig.instagram, Icone: Instagram },
  { rotulo: 'Facebook', href: siteConfig.facebook, Icone: Facebook },
  { rotulo: 'YouTube', href: siteConfig.youtube, Icone: Youtube },
  { rotulo: 'LinkedIn', href: siteConfig.linkedin, Icone: Linkedin },
];

export const Footer = () => (
  <footer className="border-t border-dourado/15 bg-preto px-5 pt-16 pb-10">
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marca */}
        <div className="lg:col-span-2 lg:max-w-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-botao border border-dourado/45">
              <Building2 aria-hidden="true" strokeWidth={1.2} className="size-5 text-dourado" />
            </span>
            <span>
              <span className="block font-serif text-[1.35rem] leading-none font-light text-branco">
                {siteConfig.name}
              </span>
              <span className="sobrescrito mt-1.5 block text-dourado">{siteConfig.tagline}</span>
            </span>
          </div>

          <p className="mt-6 max-w-xs text-[0.88rem] leading-relaxed text-texto">
            {siteConfig.descricao}
          </p>

          <ul className="mt-7 flex gap-3">
            {redes.map(({ rotulo, href, Icone }) => (
              <li key={rotulo}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${siteConfig.name} no ${rotulo}`}
                  className="flex size-10 items-center justify-center rounded-full border border-dourado/25 text-texto transition-all duration-300 hover:-translate-y-0.5 hover:border-dourado hover:text-dourado-claro"
                >
                  <Icone aria-hidden="true" strokeWidth={1.4} className="size-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <ColunaDeLinks
          titulo="Navegação"
          itens={navegacao.map((item) => ({ rotulo: item.rotulo, href: item.href }))}
        />

        <ColunaDeTexto titulo="Serviços" itens={[...servicos]} />
      </div>

      <hr className="mt-12 border-0 border-t border-dourado/25" />

      <div className="mt-6 flex flex-col gap-2 text-[0.78rem] text-texto/80 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {siteConfig.ano} {siteConfig.name}. Todos os direitos reservados.
        </p>
        <p>Desenvolvido por {siteConfig.autor}</p>
      </div>

      <p className="mt-4 text-[0.72rem] leading-relaxed text-texto/55">
        Projeto demonstrativo. Imóveis, preços, endereço e contatos são fictícios e servem
        apenas para apresentar o layout.
      </p>
    </div>
  </footer>
);

const ColunaDeLinks = ({
  titulo,
  itens,
}: {
  titulo: string;
  itens: { rotulo: string; href: string }[];
}) => (
  <nav aria-label={titulo}>
    <h2 className="sobrescrito text-dourado">{titulo}</h2>
    <ul className="mt-5 space-y-3">
      {itens.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            className="text-[0.88rem] text-texto underline-offset-4 transition-colors duration-300 hover:text-dourado-claro hover:underline"
          >
            {item.rotulo}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

const ColunaDeTexto = ({ titulo, itens }: { titulo: string; itens: string[] }) => (
  <div>
    <h2 className="sobrescrito text-dourado">{titulo}</h2>
    <ul className="mt-5 space-y-3">
      {itens.map((item) => (
        <li key={item} className="text-[0.88rem] text-texto">
          {item}
        </li>
      ))}
    </ul>
  </div>
);
