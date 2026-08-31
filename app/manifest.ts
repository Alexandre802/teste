import type { MetadataRoute } from 'next';
import { business } from '@/lib/business';

/**
 * Manifesto do app instalável.
 *
 * É o que faz o Chrome no Android oferecer "Instalar aplicativo" e o que o
 * iPhone lê ao "Adicionar à Tela de Início". Serve a um caso concreto: quem
 * pede lanche pede de novo, e um ícone na tela inicial economiza o cliente
 * ter que achar o site outra vez.
 *
 * `display: standalone` abre sem a barra do navegador, então o site precisa
 * ter sua própria navegação — tem, o cabeçalho é fixo.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${business.name} — Lanches em Jacareí`,
    short_name: business.name,
    description: business.description,
    start_url: '/?fonte=app',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['food', 'shopping'],
    // Cor da barra de status e cor da tela de abertura: as duas saem do
    // laranja da marca, definido em app/globals.css
    theme_color: '#f2620c',
    background_color: '#f2620c',
    icons: [
      { src: '/icones/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icones/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // O Android recorta o ícone em círculo ou quadrado arredondado. O
      // maskable tem margem para a marca não ser cortada nesse recorte.
      { src: '/icones/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icones/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Ver o cardápio', url: '/#cardapio' },
      { name: 'Como chegar', url: '/#contato' },
    ],
  };
}
