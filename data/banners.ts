/**
 * Slides do carrossel principal e os dois banners promocionais menores.
 *
 * `imagem` aponta para um arquivo em /public/banners/. Os arquivos que estão
 * lá hoje são recortes da peça de referência, em baixa resolução, e servem só
 * para o layout ficar de pé — troque por fotografia real de campanha assim que
 * houver. Com `imagem: null` o slide continua funcionando, só sem a foto.
 */

export type Slide = {
  id: string;
  titulo: string;
  tituloDestaque?: string;
  subtitulo: string;
  /** o CTA principal; o segundo botão, quando existe, é sempre o WhatsApp */
  cta: { texto: string; href: string };
  ctaWhatsApp?: boolean;
  imagem: string | null;
  imagemAlt: string;
  /** classes de fundo — azuis amostrados da referência */
  fundo: string;
};

export const slides: Slide[] = [
  {
    id: 'tudo-para-seu-pet',
    titulo: 'Tudo para o seu pet,',
    tituloDestaque: 'perto de você.',
    subtitulo: 'Rações PremieR, acessórios, higiene, brinquedos e muito mais!',
    cta: { texto: 'Ver produtos', href: '/#departamentos' },
    ctaWhatsApp: true,
    imagem: '/banners/cachorro-e-gato.webp',
    imagemAlt: 'Cachorro golden retriever e gato lado a lado',
    fundo: 'from-brand-800 via-brand-700 to-brand-500',
  },
  {
    id: 'ofertas-cachorros',
    titulo: 'Ofertas para',
    tituloDestaque: 'CACHORROS',
    subtitulo: 'Descontos especiais em rações, petiscos e acessórios!',
    cta: { texto: 'Aproveitar ofertas', href: '/#racao-cachorro' },
    imagem: '/banners/cachorro.webp',
    imagemAlt: 'Cachorro golden retriever ao lado de um pote de ração',
    fundo: 'from-brand-500 via-brand-400 to-brand-300',
  },
  {
    id: 'ofertas-gatos',
    titulo: 'Ofertas para',
    tituloDestaque: 'GATOS',
    subtitulo: 'Sachês, areia, arranhadores e muito mais com preços especiais!',
    cta: { texto: 'Ver ofertas', href: '/#racao-gato' },
    imagem: '/banners/gato.webp',
    imagemAlt: 'Gato malhado ao lado de um arranhador',
    fundo: 'from-brand-900 via-brand-850 to-brand-700',
  },
];

/** Os dois banners menores que aparecem depois das categorias por espécie. */
export const banneresPromo = [
  {
    id: 'promo-cachorros',
    titulo: 'Ofertas para',
    destaque: 'CACHORROS',
    subtitulo: 'Descontos especiais em rações, petiscos e acessórios!',
    cta: { texto: 'Aproveitar ofertas', href: '/#racao-cachorro' },
    imagem: '/banners/cachorro.webp',
    imagemAlt: 'Cachorro golden retriever ao lado de um pote de ração',
    fundo: 'from-brand-400 to-brand-500',
  },
  {
    id: 'promo-gatos',
    titulo: 'Ofertas para',
    destaque: 'GATOS',
    subtitulo: 'Sachês, areia, arranhadores e muito mais com preços especiais!',
    cta: { texto: 'Ver ofertas', href: '/#racao-gato' },
    imagem: '/banners/gato.webp',
    imagemAlt: 'Gato malhado ao lado de um arranhador',
    fundo: 'from-brand-900 to-brand-800',
  },
] as const;

/** Cards de benefício, entre o carrossel e as categorias. */
export const beneficios = [
  { icone: 'caminhao', titulo: 'Entrega local', texto: 'Rápida em Jacareí' },
  { icone: 'whatsapp', titulo: 'Atendimento', texto: 'Via WhatsApp' },
  { icone: 'loja', titulo: 'Loja física', texto: 'Em Jacareí - SP' },
  { icone: 'pata', titulo: 'Rações e acessórios', texto: 'Das melhores marcas' },
  { icone: 'cartao', titulo: 'Compra rápida', texto: 'Site seguro e prático' },
  { icone: 'selo', titulo: 'PremieR', texto: 'Super Premium para seu pet' },
] as const;

/** Cards da faixa "Serviços para o seu pet", no fim da página. */
export const servicos = [
  {
    icone: 'tesoura',
    titulo: 'Banho e Tosa',
    texto: 'Cuidado e carinho que seu pet merece.',
    acao: 'Agendar',
    whatsapp: 'Olá! Vim pelo site da Casa de Ração Bandeira Branca e gostaria de agendar banho e tosa.',
  },
  {
    icone: 'atendente',
    titulo: 'Atendimento Especializado',
    texto: 'Dúvidas? Fale com nossa equipe.',
    acao: 'Falar agora',
    whatsapp: 'Olá! Vim pelo site da Casa de Ração Bandeira Branca e tenho uma dúvida sobre um produto.',
  },
  {
    icone: 'caminhao',
    titulo: 'Entrega Local em Jacareí',
    texto: 'Pedidos em até 1 hora* — consulte a região.',
    acao: 'Consultar região',
    whatsapp: 'Olá! Vim pelo site da Casa de Ração Bandeira Branca e gostaria de consultar a entrega para a minha região.',
  },
  {
    icone: 'whatsapp',
    titulo: 'Pedir no WhatsApp',
    texto: 'Compre de forma rápida e prática.',
    acao: 'Pedir agora',
    whatsapp: 'Olá! Vim pelo site da Casa de Ração Bandeira Branca e gostaria de fazer um pedido.',
  },
] as const;
