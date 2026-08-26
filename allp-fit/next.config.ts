import type { NextConfig } from 'next';

/**
 * `PREVIA_ESTATICA=1` gera uma exportação estática em `out/`, usada por
 * `npm run previa` para montar o arquivo único que se manda para o cliente
 * ver antes de o site ir ao ar. No build normal nada disso é ligado.
 */
const previa = process.env.PREVIA_ESTATICA === '1';

const nextConfig: NextConfig = {
  ...(previa ? { output: 'export' as const } : {}),
  images: {
    // As fotos são arquivos locais em /public/fotos; AVIF/WebP reduzem o peso
    // das versões servidas pelo next/image. Na exportação estática não há
    // servidor para otimizar, então as fotos vão como estão.
    formats: ['image/avif', 'image/webp'],
    unoptimized: previa,
  },
};

export default nextConfig;
