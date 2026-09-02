import type { MetadataRoute } from "next";

import { restaurant } from "@/data/restaurant";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  const rotas = ["", "/cardapio", "/pedido", "/pagamento"];
  return rotas.map((rota) => ({
    url: `${restaurant.siteUrl}${rota}`,
    lastModified: agora,
    changeFrequency: rota === "" ? ("weekly" as const) : ("monthly" as const),
    priority: rota === "" ? 1 : 0.8,
  }));
}
