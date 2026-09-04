import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // O repositório guarda mais de um projeto; sem isto o Turbopack sobe um
  // nível procurando a raiz e encontra o lockfile errado.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
