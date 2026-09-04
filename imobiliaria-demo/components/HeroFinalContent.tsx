'use client';

import { IconeWhatsApp } from './ui/IconeWhatsApp';
import { whatsappUrl } from '@/lib/site-config';

type Props = {
  /** Quando falso o bloco ainda está invisível: não recebe clique nem foco. */
  visivel: boolean;
};

const irParaImoveis = () => {
  document.getElementById('imoveis')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/**
 * Conteúdo comercial do hero.
 *
 * Ele só entra depois que a câmera terminou o percurso — enquanto o movimento
 * acontece, nada de texto de venda na frente da imagem. A opacidade e o
 * deslocamento são escritos direto no DOM pelo componente de scroll; o que
 * chega por prop é apenas se o bloco já está clicável.
 */
export const HeroFinalContent = ({ visivel }: Props) => (
  <div
    className="flex h-full flex-col items-center justify-start px-6 pt-[13vh] text-center lg:pt-[15vh]"
    aria-hidden={!visivel}
    // O bloco fica sobre o vídeo o tempo todo; só aceita interação no fim.
    inert={!visivel}
  >
    <p className="sobrescrito text-dourado-claro">Imóveis de alto padrão</p>

    <span aria-hidden="true" className="mt-5 block h-px w-14 bg-dourado/70" />

    <h1 className="mt-7 max-w-3xl font-serif text-[clamp(1.8rem,7.5vw,3.6rem)] leading-[1.08] font-light text-branco">
      Encontre o imóvel ideal
      <br />
      para viver com <span className="text-dourado-claro">exclusividade.</span>
    </h1>

    <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-texto sm:text-base">
      Casas selecionadas, atendimento personalizado e oportunidades únicas.
    </p>

    <div className="mt-9 flex w-full max-w-[19rem] flex-col gap-3.5 sm:max-w-sm">
      <button
        type="button"
        onClick={irParaImoveis}
        className="botao-champanhe flex min-h-[52px] items-center justify-center rounded-botao px-6 text-[0.95rem] font-semibold tracking-wide transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
      >
        Ver imóveis
      </button>

      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="botao-contorno flex min-h-[52px] items-center justify-center gap-2.5 rounded-botao px-6 text-[0.95rem] font-medium tracking-wide transition duration-300 hover:-translate-y-0.5 hover:border-dourado-claro hover:text-dourado-claro"
      >
        <span className="flex size-6 items-center justify-center rounded-full border border-creme/55">
          <IconeWhatsApp className="size-3.5" />
        </span>
        Falar no WhatsApp
      </a>
    </div>
  </div>
);
