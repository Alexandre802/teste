import type { Metadata } from "next";

import {
  restaurant,
  temEndereco,
  temHorarios,
  temInstagram,
} from "@/data/restaurant";
import { cidadesAtendidas } from "@/data/deliveryZones";
import { palavrasChave } from "@/data/palavras-chave";
import { avaliacoes, mediaDasNotas } from "@/data/avaliacoes";

const descricao =
  "Marmitas frescas, comida caseira, lanches e açaí com entrega em " +
  cidadesAtendidas.join(" e ") +
  ". Monte seu pedido e envie pelo WhatsApp.";

export const metadataPadrao: Metadata = {
  metadataBase: new URL(restaurant.siteUrl),
  title: {
    default: `${restaurant.name} — Marmitas e comida caseira`,
    template: `%s · ${restaurant.name}`,
  },
  description: descricao,
  applicationName: restaurant.name,
  /**
   * As mesmas 100 palavras que aparecem na seção "O que entregamos, e onde".
   * O Google ignora esta meta tag desde 2009 — quem ranqueia é o conteúdo
   * visível. Ela fica aqui porque alguns buscadores menores ainda leem, e
   * porque não custa nada. O trabalho de verdade está em BuscaLocal.tsx.
   */
  keywords: palavrasChave,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: restaurant.name,
    title: `${restaurant.name} — Marmitas e comida caseira`,
    description: descricao,
    url: restaurant.siteUrl,
    images: [
      {
        url: "/images/banners/hero.jpg",
        width: 900,
        height: 1784,
        alt: "Marmita da Comida Caseira da Márcia Costa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${restaurant.name} — Marmitas e comida caseira`,
    description: descricao,
  },
  robots: { index: true, follow: true },
};

/**
 * Schema.org Restaurant. So entram campos com dado confirmado: o que a casa
 * ainda nao informou simplesmente nao aparece no schema.
 */
export function schemaRestaurante(): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: descricao,
    servesCuisine: "Comida caseira brasileira",
    url: restaurant.siteUrl,
    image: `${restaurant.siteUrl}/images/banners/hero.jpg`,
    areaServed: cidadesAtendidas.map((cidade) => ({
      "@type": "City",
      name: cidade.replace(" - SP", ""),
    })),
  };

  if (temEndereco) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressRegion: "SP",
      addressCountry: "BR",
    };
  }

  if (restaurant.whatsapp) {
    schema.telephone = `+${restaurant.whatsapp}`;
  }

  if (temInstagram) {
    schema.sameAs = [`https://instagram.com/${restaurant.instagram}`];
  }

  if (temHorarios) {
    schema.openingHours = restaurant.openingHours.map(
      (faixa) => `${faixa.dias} ${faixa.horario}`,
    );
  }

  // Nota agregada só entra no schema se existir avaliação de verdade.
  // Estrela inventada em resultado de busca é motivo de penalização — e é
  // mentira para quem clica.
  const media = mediaDasNotas();
  if (media !== null) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: media,
      reviewCount: avaliacoes.length,
      bestRating: 5,
      worstRating: 1,
    };
    schema.review = avaliacoes.map((avaliacao) => ({
      "@type": "Review",
      author: { "@type": "Person", name: avaliacao.nome },
      datePublished: avaliacao.data,
      reviewBody: avaliacao.texto,
      reviewRating: {
        "@type": "Rating",
        ratingValue: avaliacao.nota,
        bestRating: 5,
        worstRating: 1,
      },
    }));
  }

  return schema;
}
