import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Todas as imagens do site são locais, em /public. Se um dia as fotos dos
    // produtos vierem de um CDN, libere o domínio aqui em `remotePatterns`.
  },
};

export default nextConfig;
