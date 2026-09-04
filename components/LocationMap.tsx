import { ExternalLink, MapPin } from 'lucide-react';
import { enderecoCompleto, mapaEmbedUrl, mapaLinkUrl, siteConfig } from '@/lib/site-config';

/**
 * Mapa real, por embed do Google Maps — funciona sem chave de API. Se o embed
 * for bloqueado (rede corporativa, extensão), o endereço e o link continuam
 * abaixo dele: a informação nunca depende do iframe.
 */
export const LocationMap = () => (
  <div className="flex h-full flex-col">
    <div className="relative overflow-hidden rounded-card border border-dourado/20 bg-carvao-claro">
      <iframe
        src={mapaEmbedUrl}
        title={`Mapa com a localização do escritório: ${enderecoCompleto}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        // `color-scheme: dark` faz a tela de erro do próprio navegador sair
        // escura, caso a rede bloqueie o embed — nada de retângulo branco.
        style={{ colorScheme: 'dark' }}
        className="block h-[280px] w-full border-0 bg-carvao-claro sm:h-[340px] lg:h-[420px]"
      />
    </div>

    <div className="mt-4 flex flex-col gap-4 rounded-card border border-dourado/20 bg-card px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-texto">
        <MapPin aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-dourado" />
        <span>
          {siteConfig.address.linha1} — {siteConfig.address.bairro}
          <br />
          {siteConfig.address.cidade}/{siteConfig.address.estado} · CEP {siteConfig.address.cep}
        </span>
      </p>

      <a
        href={mapaLinkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="botao-contorno flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-botao px-5 text-[0.85rem] font-medium transition duration-300 hover:-translate-y-0.5 hover:border-dourado-claro hover:text-dourado-claro"
      >
        Ver no Google Maps
        <ExternalLink aria-hidden="true" strokeWidth={1.5} className="size-4" />
      </a>
    </div>
  </div>
);
