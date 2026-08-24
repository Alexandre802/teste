import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Fotos hospedadas no Google (perfil do Google Maps). Trocar por arquivos
    // locais em /public assim que houver ensaio fotográfico próprio.
    remotePatterns: [{ protocol: 'https', hostname: 'lh3.googleusercontent.com' }],
  },
};

export default nextConfig;
