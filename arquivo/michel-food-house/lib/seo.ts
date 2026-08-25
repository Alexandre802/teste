import { business, fullAddress } from './business';
import { categories, products } from './catalog';

/**
 * Termos de busca do negócio, agrupados por intenção.
 *
 * Estes termos alimentam CONTEÚDO VISÍVEL (a seção "O que servimos em
 * Jacareí"), o `keywords` do metadata e os textos alternativos. Não existe
 * bloco de texto escondido para robô: texto oculto que só o buscador enxerga
 * é cloaking, contraria as políticas de spam do Google e coloca o domínio em
 * risco de rebaixamento ou remoção do índice.
 */
export const searchTerms = {
  marca: [
    'Michel Food House', 'Michel Food House Jacareí', 'Michel Food House Bandeira Branca',
    'cardápio Michel Food House', 'preços Michel Food House', 'pedido Michel Food House',
    'WhatsApp Michel Food House', 'telefone Michel Food House', 'endereço Michel Food House',
    'Michel Food House delivery', 'Michel Food House avaliações', 'Michel Food House 4,8 estrelas',
    'lanches Michel Food House', 'Michel Food House Bandeira Branca I',
  ],
  lugar: [
    'lanchonete em Jacareí', 'lanchonete Bandeira Branca', 'lanche em Jacareí', 'lanches em Jacareí',
    'restaurante em Jacareí', 'restaurante Bandeira Branca Jacareí', 'restaurante Bandeira Branca I',
    'comida em Jacareí', 'onde comer lanche em Jacareí', 'onde comer hambúrguer em Jacareí',
    'onde comer à noite em Jacareí', 'jantar em Jacareí', 'fast food Jacareí',
    'lanche Bandeira Branca I Jacareí', 'delivery Bandeira Branca I',
    'lanchonete perto de mim Jacareí', 'hambúrguer perto de mim Jacareí',
    'lanche perto de mim Jacareí', 'delivery perto de mim Jacareí', 'comida perto de mim Jacareí',
    'lanche tradicional perto de mim',
  ],
  tradicionais: [
    'lanche tradicional', 'lanches tradicionais', 'hambúrguer em Jacareí', 'hambúrguer tradicional',
    'x salada Jacareí', 'x bacon Jacareí', 'x egg Jacareí', 'x egg bacon Jacareí', 'x tudo Jacareí',
    'x burguer Jacareí', 'x frango Jacareí', 'x frango bacon Jacareí', 'x frango egg Jacareí',
    'x frangão Jacareí', 'x calabresa Jacareí', 'x churrasco Jacareí', 'hot dog Jacareí',
    'hot bacon Jacareí', 'hot frango Jacareí', 'hot calabresa Jacareí', 'hot cheddar Jacareí',
    'hot catupiry Jacareí', 'hot egg Jacareí', 'hot misto Jacareí', 'salsichão Jacareí',
    'misto quente Jacareí', 'queijo quente Jacareí', 'bauru Jacareí', 'americano lanche Jacareí',
  ],
  beirutes: [
    'beirute Jacareí', 'beirute de frango Jacareí', 'beirute de carne Jacareí',
    'beirute de calabresa Jacareí', 'beirute vegetariano Jacareí', 'beirute americano Jacareí',
    'beirute de hambúrguer Jacareí', 'beirute frango bacon Jacareí', 'beirute frango egg Jacareí',
    'beirute especial Jacareí',
  ],
  combosPorcoes: [
    'lanche master Jacareí', 'master de frango Jacareí', 'master tudo Jacareí',
    'combo lanche Jacareí', 'combo hot dog Jacareí', 'combo x salada Jacareí',
    'combo x egg Jacareí', 'combo x egg bacon Jacareí', 'combo infantil Jacareí',
    'lanche kids Jacareí', 'porção de batata Jacareí', 'batata frita Jacareí',
    'batata simples Jacareí', 'lanche com porção de batata', 'hambúrguer com batata frita',
    'combo para família Jacareí',
  ],
  gourmet: [
    'lanche gourmet Jacareí', 'x salada gourmet Jacareí', 'x burguer gourmet Jacareí',
    'x bacon gourmet Jacareí', 'especial da casa Jacareí', 'bacon cheddar Jacareí',
    'hambúrguer 180g Jacareí', 'pão brioche hambúrguer', 'hambúrguer caseiro Jacareí',
    'hambúrguer bovino Jacareí', 'lanche caseiro Jacareí',
  ],
  acaiBebidas: [
    'açaí Jacareí', 'açaí 300 ml Jacareí', 'açaí 500 ml Jacareí', 'açaí delivery Jacareí',
    'suco natural Jacareí', 'suco laranja Jacareí', 'suco goiaba Jacareí',
    'suco maracujá Jacareí', 'suco manga Jacareí',
  ],
  ingredientes: [
    'lanche com cheddar Jacareí', 'lanche com bacon Jacareí', 'lanche com frango Jacareí',
    'lanche com calabresa Jacareí', 'lanche com ovo Jacareí', 'lanche com catupiry Jacareí',
    'lanche com vinagrete Jacareí', 'lanche com tomate Jacareí', 'lanche com alface Jacareí',
    'lanche com batata palha', 'lanche com presunto e queijo', 'lanche com contra filé Jacareí',
  ],
  pedido: [
    'comida delivery Jacareí', 'delivery de lanche Jacareí', 'delivery Jacareí',
    'entrega de lanche Jacareí', 'pedido de lanche online', 'pedir lanche online Jacareí',
    'lanche no WhatsApp Jacareí', 'pedir pelo WhatsApp Jacareí', 'retirada de lanche Jacareí',
    'lanche para retirada Jacareí', 'lanche para entrega Jacareí', 'lanchonete delivery Jacareí',
    'lanchonete aberta à noite Jacareí', 'lanche noturno Jacareí',
  ],
  publico: [
    'lanche bem servido Jacareí', 'lanche caprichado Jacareí', 'lanche delicioso Jacareí',
    'melhor lanche Jacareí', 'lanche barato Jacareí', 'lanche custo benefício Jacareí',
    'lanche R$ 20 a R$ 40 Jacareí', 'lanche para família Jacareí', 'lanchonete familiar Jacareí',
    'lanche para casal Jacareí', 'lanche para crianças Jacareí', 'lanche completo Jacareí',
    'lanche grande Jacareí', 'lanche reforçado Jacareí',
  ],
} as const;

export const allSearchTerms: string[] = Object.values(searchTerms).flat();

/** Blocos da seção visível "O que servimos em Jacareí". */
export const searchSections = [
  { title: 'Lanches tradicionais', terms: searchTerms.tradicionais },
  { title: 'Beirutes', terms: searchTerms.beirutes },
  { title: 'Combos, porções e Master', terms: searchTerms.combosPorcoes },
  { title: 'Linha gourmet', terms: searchTerms.gourmet },
  { title: 'Açaí e bebidas', terms: searchTerms.acaiBebidas },
  { title: 'Entrega e retirada', terms: searchTerms.pedido },
  { title: 'Bandeira Branca e região', terms: searchTerms.lugar },
] as const;

/** JSON-LD Restaurant. Só campos confirmados — sem horário de fechamento. */
export function restaurantJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: business.name,
    slogan: business.slogan,
    description: business.description,
    url: business.siteUrl,
    telephone: business.phoneE164,
    priceRange: business.priceRangeSchema,
    servesCuisine: ['Lanches', 'Hambúrguer', 'Beirute', 'Açaí'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: business.rating.value,
      reviewCount: business.rating.count,
      bestRating: 5,
    },
    hasMenu: {
      '@type': 'Menu',
      name: `Cardápio ${business.name}`,
      hasMenuSection: categories.map((category) => ({
        '@type': 'MenuSection',
        name: category.label,
        hasMenuItem: products
          .filter((p) => p.category === category.id && p.available)
          .map((p) => ({
            '@type': 'MenuItem',
            name: p.name,
            ...(p.description ? { description: p.description } : {}),
            offers: { '@type': 'Offer', price: p.price.toFixed(2), priceCurrency: 'BRL' },
          })),
      })),
    },
    acceptsReservations: false,
    publicAccess: true,
    smokingAllowed: false,
    keywords: allSearchTerms.join(', '),
    areaServed: { '@type': 'City', name: 'Jacareí' },
    // Serviços confirmados pelo perfil do Google.
    additionalProperty: business.services.map((s) => ({
      '@type': 'PropertyValue',
      name: 'Serviço',
      value: s,
    })),
    // Endereço legível, para leitores que não montam o PostalAddress.
    alternateName: `${business.name} — ${fullAddress}`,
  };
}
