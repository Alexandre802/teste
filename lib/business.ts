/**
 * Dados do negócio. Ponto único de verdade — alterar aqui reflete no site
 * inteiro (header, footer, contato, WhatsApp, JSON-LD, metadata).
 *
 * TUDO AQUI PRECISA SER CONFIRMADO PELO PROPRIETÁRIO antes de virar
 * propaganda. O que está escrito veio do perfil público da casa no Google e
 * do cardápio impresso; nada foi deduzido. O horário, em particular, está
 * incompleto de propósito: só a abertura foi confirmada.
 */

/**
 * Endereço de produção enquanto não há domínio próprio.
 *
 * É o alias que o cliente já divulga. Não trocar sem combinar: link antigo
 * quebrado custa mais que domínio bonito.
 */
const PRODUCAO_ATUAL = 'https://teste-steel-five-45.vercel.app';
export const business = {
  name: 'Michel Food House',
  slogan: 'O sabor que impressiona na primeira mordida.',
  description:
    'Lanches tradicionais, beirutes, combos, gourmet, açaí e muito mais. Conheça a Michel Food House em Jacareí e faça seu pedido.',

  phoneDisplay: '(12) 98844-7711',
  phoneE164: '+5512988447711',
  whatsapp: '5512988447711',

  address: {
    street: 'R. Fidêncio José de Souza, 100',
    district: 'Bandeira Branca I',
    city: 'Jacareí',
    state: 'SP',
    postalCode: '12323-390',
    country: 'BR',
  },

  /** Único horário confirmado. Não preencher fechamento sem confirmação. */
  opensAt: '19:00',
  openingNote: 'Abre às 19:00',

  rating: { value: 4.8, count: 46, source: 'Google' },
  priceRange: 'R$ 20–40 por pessoa',
  priceRangeSchema: '$$',

  services: ['Refeição no local', 'Retirada na porta', 'Entrega sem contato'],

  /** Trocar por coordenadas exatas se quiser precisão no mapa. */
  mapsQuery:
    'Michel Food House, R. Fidêncio José de Souza, 100, Bandeira Branca I, Jacareí - SP, 12323-390',

  /**
   * Endereço público do site, usado em canônico, Open Graph, sitemap e JSON-LD.
   *
   * Ordem de precedência:
   *   1. NEXT_PUBLIC_SITE_URL — o domínio próprio, quando existir. Trocar
   *      esta variável é a única coisa necessária no dia da migração.
   *   2. O alias de produção da Vercel, que é estável entre publicações.
   *   3. O endereço de produção atual, escrito abaixo.
   *
   * Repare que NEXT_PUBLIC_VERCEL_URL não entra: ela aponta para o deployment
   * específico (muda a cada publicação), e usá-la no canônico faria o Google
   * indexar um endereço diferente por publicação.
   */
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
      : PRODUCAO_ATUAL),
} as const;

export const fullAddress = `${business.address.street} - ${business.address.district}, ${business.address.city} - ${business.address.state}, ${business.address.postalCode}`;

export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.mapsQuery)}`;
export const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(business.mapsQuery)}&output=embed`;

export function whatsappUrl(message: string): string {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * Depoimentos reais do perfil do Google. Não editar o sentido do texto
 * nem acrescentar avaliações que não existam.
 */
export const reviews = [
  { text: 'Lugar familiar e agradável. A família gostou, lanche top.' },
  { text: 'Excelente comida, atendimento rápido e boa localização.' },
  { text: 'Boas opções de lanches, deliciosos lanches servidos!' },
  { text: 'Super recomendo, atendimento nota 10, lanche maravilhoso. Vale a pena conferir.' },
  { text: 'Lanche delicioso, super caprichado, preço muito bom, produtos de qualidade.' },
] as const;

export const differentials = [
  {
    title: 'Lanches bem servidos',
    text: 'Porção generosa no pão, no recheio e no acompanhamento. Você sente no peso da embalagem.',
  },
  {
    title: 'Ingredientes de qualidade',
    text: 'Carne, frango, bacon e queijo selecionados, montados na hora do seu pedido.',
  },
  {
    title: 'Atendimento que conquista',
    text: 'Pedido conferido, entrega combinada e um time que trata cliente como vizinho.',
  },
] as const;

export const aboutText =
  'Lanches caprichados, porções generosas e aquele sabor que faz você querer voltar. Na Michel Food House, cada pedido é preparado para entregar uma experiência simples, saborosa e bem servida.';
