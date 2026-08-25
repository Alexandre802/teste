import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // As fotos são arquivos locais em /public/fotos; AVIF/WebP reduzem o peso
    // das versões servidas pelo next/image.
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
