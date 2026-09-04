/**
 * Configuração central do demonstrativo.
 *
 * ATENÇÃO: os dados abaixo são FICTÍCIOS, criados só para a demonstração.
 * Telefone, WhatsApp, e-mail, endereço e perfis sociais precisam ser trocados
 * pelos dados reais do cliente antes de qualquer publicação — um número de
 * telefone inventado pode pertencer a alguém de verdade.
 *
 * Trocando os valores deste arquivo o demonstrativo inteiro se adapta a outra
 * imobiliária: nenhuma dessas informações aparece escrita dentro de JSX.
 */
export const siteConfig = {
  name: 'Sua Imobiliária',
  tagline: 'Viver bem é aqui',
  descricao:
    'Mais que imóveis, ajudamos você a construir o próximo capítulo da sua história.',

  /** Número em formato internacional, só dígitos — é o que o wa.me usa. */
  whatsapp: '5512998765432',
  whatsappExibicao: '(12) 9 9876-5432',
  whatsappMensagem:
    'Olá! Vim pelo site e gostaria de saber mais sobre os imóveis disponíveis.',

  phone: '+551234567890',
  phoneExibicao: '(12) 3456-7890',

  email: 'contato@imobiliaria.com.br',

  address: {
    linha1: 'Av. das Palmeiras, 1000',
    bairro: 'Jardim das Colinas',
    cidade: 'São José dos Campos',
    estado: 'SP',
    cep: '12242-000',
  },

  horario: [
    { dias: 'Segunda a Sexta', horas: '9h às 18h' },
    { dias: 'Sábado', horas: '9h às 13h' },
  ],

  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  youtube: 'https://youtube.com/',
  linkedin: 'https://linkedin.com/',

  autor: 'Alexandre Soluções Digitais',
  ano: 2026,
} as const;

/** Endereço em uma linha — usado no mapa, no rodapé e nos links externos. */
export const enderecoCompleto = [
  siteConfig.address.linha1,
  siteConfig.address.bairro,
  `${siteConfig.address.cidade}/${siteConfig.address.estado}`,
].join(', ');

/** wa.me funciona sem nenhuma credencial: é o caminho garantido. */
export const whatsappUrl = (mensagem: string = siteConfig.whatsappMensagem) =>
  `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(mensagem)}`;

export const telefoneUrl = `tel:${siteConfig.phone}`;
export const emailUrl = `mailto:${siteConfig.email}`;

/** Embed do Google Maps sem chave de API. */
export const mapaEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  `${enderecoCompleto} - CEP ${siteConfig.address.cep}`,
)}&hl=pt-BR&z=15&output=embed`;

export const mapaLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${enderecoCompleto} - CEP ${siteConfig.address.cep}`,
)}`;

export const navegacao = [
  { rotulo: 'Início', href: '#inicio' },
  { rotulo: 'Imóveis', href: '#imoveis' },
  { rotulo: 'Sobre nós', href: '#sobre' },
  { rotulo: 'Localização', href: '#localizacao' },
  { rotulo: 'Contato', href: '#contato' },
] as const;

export const servicos = [
  'Compra',
  'Venda',
  'Locação',
  'Administração de imóveis',
  'Consultoria imobiliária',
] as const;
