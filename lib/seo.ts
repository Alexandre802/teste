import type { Metadata } from "next";

import {
  restaurant,
  temEndereco,
  temHorarios,
  temInstagram,
} from "@/data/restaurant";
import { cidadesAtendidas } from "@/data/deliveryZones";

const descricao =
  "Marmitas frescas e comida caseira com entrega em " +
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
  keywords: [
    "marmita",
    "comida caseira",
    "marmitex",
    "bebidas",
    "delivery",
    "Jacareí",
    "São José dos Campos",
  ],
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

  if (restaurant.phone) {
    schema.telephone = `+${restaurant.phone}`;
  }

  if (temInstagram) {
    schema.sameAs = [`https://instagram.com/${restaurant.instagram}`];
  }

  if (temHorarios) {
    schema.openingHours = restaurant.openingHours.map(
      (faixa) => `${faixa.dias} ${faixa.horario}`,
    );
  }

  return schema;
}
