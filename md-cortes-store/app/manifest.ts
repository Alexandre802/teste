import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.shortName,
    description: "Controle de vendas e estoque da MD Cortes Store.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["business", "productivity"],
    icons: [
      { src: BRAND.logo.icon192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: BRAND.logo.icon512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: BRAND.logo.maskable, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Registrar venda", short_name: "Vender", url: "/venda" },
      { name: "Entrada de estoque", short_name: "Entrada", url: "/entrada" },
      { name: "Ver estoque", short_name: "Estoque", url: "/estoque" },
    ],
  };
}
