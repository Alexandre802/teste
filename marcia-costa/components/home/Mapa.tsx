import { ExternalLink, MapPin } from "lucide-react";

import {
  INFORMACAO_A_CADASTRAR,
  restaurant,
  temEndereco,
  temMapa,
} from "@/data/restaurant";
import { cidadesAtendidas } from "@/data/deliveryZones";

/**
 * Onde a casa fica, no Google Maps.
 *
 * Três situações, e nenhuma delas finge:
 *  - endereço e chave cadastrados: mapa embutido de verdade;
 *  - endereço sem chave: o endereço aparece com um botão que abre o Google
 *    Maps. Iframe sem chave carrega uma vez e depois passa a devolver erro —
 *    seria um mapa quebrado na cara do cliente;
 *  - sem endereço: a seção diz "Informação a cadastrar".
 */
export function Mapa() {
  const endereco = restaurant.address;
  const linkExterno = temEndereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`
    : null;

  return (
    <section id="onde-estamos" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <p className="text-[11px] font-bold uppercase tracking-wide text-laranja">
        Onde estamos
      </p>
      <h2 className="fonte-titulo mt-1 text-2xl font-extrabold text-tinta sm:text-3xl">
        Nossa cozinha no mapa
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tinta-media">
        Retirada no balcão e entrega em {cidadesAtendidas.join(" e ")}.
      </p>

      <div className="mt-6 overflow-hidden rounded-gigante border border-borda bg-white shadow-carta">
        {temMapa ? (
          <iframe
            title={`Mapa com a localização da ${restaurant.name}`}
            src={`https://www.google.com/maps/embed/v1/place?key=${restaurant.googleMapsKey}&q=${encodeURIComponent(endereco)}&language=pt-BR&region=BR`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-[320px] w-full border-0 sm:h-[420px]"
          />
        ) : (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-creme">
              <MapPin className="h-6 w-6 text-laranja" aria-hidden="true" />
            </span>

            {temEndereco ? (
              <>
                <address className="mt-4 max-w-md not-italic text-[16px] font-semibold leading-relaxed text-tinta">
                  {endereco}
                </address>
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-tinta-suave">
                  O mapa embutido precisa de uma chave do Google Maps
                  configurada. Enquanto isso, o botão abaixo abre o endereço
                  direto no aplicativo.
                </p>
              </>
            ) : (
              <>
                <p className="fonte-titulo mt-4 text-[17px] font-bold text-tinta">
                  {INFORMACAO_A_CADASTRAR}
                </p>
                <p className="mt-1 max-w-md text-[13px] leading-relaxed text-tinta-suave">
                  O endereço da cozinha ainda não foi cadastrado, então não
                  mostramos mapa nenhum aqui. Fale com a gente pelo WhatsApp
                  para combinar a retirada.
                </p>
              </>
            )}

            {linkExterno && (
              <a
                href={linkExterno}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-carta bg-laranja px-5 text-[15px] font-semibold text-white hover:bg-laranja-forte"
              >
                Abrir no Google Maps
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
