import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // O repositorio tem outro projeto na raiz, com lockfile proprio. Sem isto o
  // Turbopack escolhe a pasta de cima como raiz do workspace e avisa a cada
  // build.
  turbopack: { root: path.resolve(process.cwd()) },
  images: {
    formats: ["image/avif", "image/webp"],
    // As fotos vivem no CDN da casa. Em ambiente sem saida para esse CDN (CI,
    // maquina offline), otimizar cada imagem vira espera longa e inutil: o
    // sinalizador desliga a otimizacao sem mexer no que vai para producao.
    unoptimized: process.env.IMAGENS_SEM_OTIMIZACAO === "1",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-images.ifood.com.br",
      },
      {
        protocol: "https",
        hostname: "instadelivery-public.nyc3.cdn.digitaloceanspaces.com",
      },
      // As fotos dos produtos sao servidas pelo CDN que a propria casa usa nos
      // marketplaces. Sao as fotos dela; o site nao hospeda copia. Se o CDN
      // sair do ar, FotoProduto cai no selo da marca em vez de quebrar a tela.
    ],
  },
};

export default nextConfig;
