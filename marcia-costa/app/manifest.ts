import type { MetadataRoute } from "next";

import { restaurant } from "@/data/restaurant";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: restaurant.name,
    short_name: restaurant.shortName,
    description: restaurant.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#e75c16",
    lang: "pt-BR",
    categories: ["food", "shopping"],
    icons: [
      { src: "/icons/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icone-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
