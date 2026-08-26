import type { NextConfig } from 'next';

/**
 * MD_cortes sai como site estático (`output: 'export'`): a build gera HTML, CSS
 * e JS em `out/`, sem nenhum processo Node rodando. É isso que permite publicar
 * de graça (GitHub Pages, Netlify drop, pendrive num servidor qualquer) sem
 * contratar hospedagem — todo o "servidor" é o Supabase.
 *
 * NEXT_PUBLIC_BASE_PATH cobre o caso do GitHub Pages, onde o site não fica na
 * raiz do domínio e sim em /<repositorio>.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  // Sem servidor não existe otimizador de imagem sob demanda.
  images: { unoptimized: true },
  // Cada rota vira uma pasta com index.html — funciona em qualquer host estático.
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
