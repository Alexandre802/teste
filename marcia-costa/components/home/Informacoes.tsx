import type { ComponentType } from "react";
import {
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  ShoppingBasket,
} from "lucide-react";

import {
  INFORMACAO_A_CADASTRAR,
  paymentMethods,
  restaurant,
  temEndereco,
  temHorarios,
  temInstagram,
} from "@/data/restaurant";
import { cidadesAtendidas } from "@/data/deliveryZones";
import { linkConversa } from "@/lib/whatsapp";
import { IconeInstagram } from "@/components/ui/IconeInstagram";

/**
 * Informacoes da casa. O que a Marcia ainda nao confirmou aparece como
 * "Informacao a cadastrar" -- o site nunca preenche com suposicao.
 */
export function Informacoes() {
  const conversa = linkConversa();

  return (
    <section id="informacoes" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <p className="text-[11px] font-bold uppercase tracking-wide text-laranja">
        Fale com a gente
      </p>
      <h2 className="fonte-titulo mt-1 text-2xl font-extrabold text-tinta sm:text-3xl">
        Informações
      </h2>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <Bloco icone={MapPin} termo="Endereço">
          {temEndereco ? restaurant.address : INFORMACAO_A_CADASTRAR}
        </Bloco>

        <Bloco icone={MessageCircle} termo="WhatsApp">
          {conversa ? (
            <a
              href={conversa}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-whatsapp-escuro underline underline-offset-2"
            >
              Chamar no WhatsApp
            </a>
          ) : (
            INFORMACAO_A_CADASTRAR
          )}
        </Bloco>

        <Bloco icone={Clock} termo="Horários">
          {temHorarios ? (
            <ul className="space-y-0.5">
              {restaurant.openingHours.map((faixa) => (
                <li key={faixa.dias}>
                  {faixa.dias}: {faixa.horario}
                </li>
              ))}
            </ul>
          ) : (
            INFORMACAO_A_CADASTRAR
          )}
        </Bloco>

        <Bloco icone={ShoppingBasket} termo="Região atendida">
          {cidadesAtendidas.join(" e ")}
        </Bloco>

        <Bloco icone={CreditCard} termo="Formas de pagamento">
          {paymentMethods.map((forma) => forma.label).join(" · ")}
        </Bloco>

        <Bloco icone={IconeInstagram} termo="Instagram">
          {temInstagram ? (
            <a
              href={`https://instagram.com/${restaurant.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-laranja underline underline-offset-2"
            >
              @{restaurant.instagram}
            </a>
          ) : (
            INFORMACAO_A_CADASTRAR
          )}
        </Bloco>

        {(restaurant.instadelivery || restaurant.ifood) && (
          <Bloco icone={ShoppingBasket} termo="Também pedimos por">
            <span className="flex flex-wrap gap-3">
              {restaurant.instadelivery && (
                <a
                  href={restaurant.instadelivery}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-laranja underline underline-offset-2"
                >
                  Instadelivery
                </a>
              )}
              {restaurant.ifood && (
                <a
                  href={restaurant.ifood}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-laranja underline underline-offset-2"
                >
                  iFood
                </a>
              )}
            </span>
          </Bloco>
        )}
      </dl>
    </section>
  );
}

function Bloco({
  icone: Icone,
  termo,
  children,
}: {
  icone: ComponentType<{ className?: string }>;
  termo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-bloco border border-borda bg-white p-5 shadow-carta">
      <Icone
        className="mt-0.5 h-5 w-5 shrink-0 text-laranja"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="text-[13px] font-bold uppercase tracking-wide text-tinta-suave">
          {termo}
        </dt>
        <dd className="mt-1 break-words text-[15px] text-tinta">{children}</dd>
      </div>
    </div>
  );
}
