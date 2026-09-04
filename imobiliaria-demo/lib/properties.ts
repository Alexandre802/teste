/**
 * Acervo DEMONSTRATIVO. Os imóveis, preços e metragens são fictícios e existem
 * só para mostrar o funcionamento do catálogo — nada aqui corresponde a um
 * imóvel real à venda.
 *
 * As fotos vêm das referências de layout do briefing (ver ASSET_MAP.md). Cada
 * imóvel tem a sua própria foto; nenhuma imagem se repete entre itens.
 */

export type TipoImovel = 'casa' | 'apartamento';

export type Imovel = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  tipo: TipoImovel;
  quartos: number;
  piscina: boolean;
  altoPadrao: boolean;
  /** Área construída em m². */
  area: number;
  /** Preço em reais. */
  preco: number;
  imagem: string;
  alt: string;
};

export const imoveis: Imovel[] = [
  {
    id: 'casa-da-mata',
    nome: 'Casa da Mata',
    cidade: 'São Sebastião',
    estado: 'SP',
    tipo: 'casa',
    quartos: 4,
    piscina: true,
    altoPadrao: true,
    area: 320,
    preco: 8_950_000,
    imagem: '/imagens/imoveis/casa-da-mata.webp',
    alt: 'Casa de madeira e vidro com piscina, cercada por mata fechada ao entardecer.',
  },
  {
    id: 'casa-do-mirante',
    nome: 'Casa do Mirante',
    cidade: 'Ilhabela',
    estado: 'SP',
    tipo: 'casa',
    quartos: 5,
    piscina: true,
    altoPadrao: true,
    area: 450,
    preco: 12_500_000,
    imagem: '/imagens/imoveis/casa-do-mirante.webp',
    alt: 'Sala de estar envidraçada de piso a teto com vista para o mar no fim da tarde.',
  },
  {
    id: 'villa-horizonte',
    nome: 'Villa Horizonte',
    cidade: 'Ubatuba',
    estado: 'SP',
    tipo: 'casa',
    quartos: 4,
    piscina: true,
    altoPadrao: true,
    area: 360,
    preco: 7_800_000,
    imagem: '/imagens/imoveis/villa-horizonte.webp',
    alt: 'Residência iluminada entre coqueiros, com piscina alongada e espreguiçadeiras à noite.',
  },
  {
    id: 'casa-jardim',
    nome: 'Casa Jardim',
    cidade: 'São Sebastião',
    estado: 'SP',
    tipo: 'casa',
    quartos: 3,
    piscina: true,
    altoPadrao: false,
    area: 280,
    preco: 6_450_000,
    imagem: '/imagens/imoveis/casa-jardim.webp',
    alt: 'Casa térrea de linhas retas com piscina refletindo a iluminação quente do interior.',
  },
  {
    id: 'refugio-da-serra',
    nome: 'Refúgio da Serra',
    cidade: 'Petrópolis',
    estado: 'RJ',
    tipo: 'casa',
    quartos: 4,
    piscina: true,
    altoPadrao: false,
    area: 300,
    preco: 5_950_000,
    imagem: '/imagens/imoveis/refugio-da-serra.webp',
    alt: 'Sala integrada à sala de jantar com janelões voltados para a serra coberta de mata.',
  },
  {
    id: 'casa-das-aguas',
    nome: 'Casa das Águas',
    cidade: 'Paraty',
    estado: 'RJ',
    tipo: 'casa',
    quartos: 4,
    piscina: true,
    altoPadrao: true,
    area: 350,
    preco: 7_250_000,
    imagem: '/imagens/imoveis/casa-das-aguas.webp',
    alt: 'Pátio interno com piscina iluminada, palmeira central e paredes de vidro.',
  },
];

export type CategoriaId = 'casas' | 'apartamentos' | 'alto-padrao' | 'piscina';

export const categorias: { id: CategoriaId; rotulo: string }[] = [
  { id: 'casas', rotulo: 'Casas' },
  { id: 'apartamentos', rotulo: 'Apartamentos' },
  { id: 'alto-padrao', rotulo: 'Alto padrão' },
  { id: 'piscina', rotulo: 'Piscina' },
];

const naCategoria = (imovel: Imovel, categoria: CategoriaId) => {
  switch (categoria) {
    case 'casas':
      return imovel.tipo === 'casa';
    case 'apartamentos':
      return imovel.tipo === 'apartamento';
    case 'alto-padrao':
      return imovel.altoPadrao;
    case 'piscina':
      return imovel.piscina;
  }
};

export type Ordenacao = 'relevancia' | 'menor-preco' | 'maior-preco' | 'maior-area';

export const ordenacoes: { id: Ordenacao; rotulo: string }[] = [
  { id: 'relevancia', rotulo: 'Relevância' },
  { id: 'menor-preco', rotulo: 'Menor preço' },
  { id: 'maior-preco', rotulo: 'Maior preço' },
  { id: 'maior-area', rotulo: 'Maior área' },
];

export type Filtros = {
  categoria: CategoriaId;
  busca: string;
  quartosMinimos: number;
  precoMaximo: number | null;
  ordenacao: Ordenacao;
};

export const filtrosIniciais: Filtros = {
  categoria: 'casas',
  busca: '',
  quartosMinimos: 0,
  precoMaximo: null,
  ordenacao: 'relevancia',
};

/** Remove acento e caixa para a busca não depender de digitação exata. */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const filtrarImoveis = (lista: Imovel[], filtros: Filtros): Imovel[] => {
  const termo = normalizar(filtros.busca);

  const encontrados = lista.filter((imovel) => {
    if (!naCategoria(imovel, filtros.categoria)) return false;
    if (imovel.quartos < filtros.quartosMinimos) return false;
    if (filtros.precoMaximo !== null && imovel.preco > filtros.precoMaximo) return false;
    if (!termo) return true;

    const alvo = normalizar(
      `${imovel.nome} ${imovel.cidade} ${imovel.estado} ${imovel.cidade}/${imovel.estado}`,
    );
    return alvo.includes(termo);
  });

  switch (filtros.ordenacao) {
    case 'menor-preco':
      return [...encontrados].sort((a, b) => a.preco - b.preco);
    case 'maior-preco':
      return [...encontrados].sort((a, b) => b.preco - a.preco);
    case 'maior-area':
      return [...encontrados].sort((a, b) => b.area - a.area);
    case 'relevancia':
      return encontrados;
  }
};

const formatadorReal = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export const formatarPreco = (valor: number) =>
  formatadorReal.format(valor).replace(/\u00a0/g, ' ');

export const faixasDePreco: { rotulo: string; valor: number | null }[] = [
  { rotulo: 'Qualquer valor', valor: null },
  { rotulo: 'Até R$ 6 milhões', valor: 6_000_000 },
  { rotulo: 'Até R$ 8 milhões', valor: 8_000_000 },
  { rotulo: 'Até R$ 10 milhões', valor: 10_000_000 },
];

export const faixasDeQuartos: { rotulo: string; valor: number }[] = [
  { rotulo: 'Qualquer', valor: 0 },
  { rotulo: '3 ou mais', valor: 3 },
  { rotulo: '4 ou mais', valor: 4 },
  { rotulo: '5 ou mais', valor: 5 },
];
