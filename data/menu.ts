import type { Category, Product } from "@/types";

/**
 * CARDAPIO DA COMIDA CASEIRA DA MARCIA COSTA
 * ---------------------------------------------------------------------------
 * Este e o unico lugar onde produto, descricao e preco existem. Nenhum
 * componente escreve nome ou valor de item.
 *
 * ORIGEM DOS DADOS: cada item abaixo foi transcrito das telas de referencia
 * enviadas pela propria casa (marcia-costa/referencias/02-cardapio.png). Nada
 * foi inventado e nada veio de outro restaurante.
 *
 * ATENCAO: enquanto `confirmado` for false, o site trata o item como
 * "em conferencia" e mostra um aviso honesto no topo do cardapio. Depois que a
 * Marcia confirmar nome, descricao e preco de um item, troque para
 * `confirmado: true`. Quando todos estiverem confirmados o aviso some sozinho.
 *
 * COMO ATUALIZAR:
 *  - preco: campo `price`, em reais (25 = R$ 25,00; 25.5 = R$ 25,50).
 *  - foto: coloque o arquivo em public/images/products/ e aponte em `image`.
 *          Item sem foto propria usa `image: null` e cai no placeholder da
 *          marca. Nunca reaproveite a foto de um item em outro.
 *  - opcoes (tamanho, carne, adicionais): preencha `options`. O que nao existir
 *          aqui nao aparece na tela -- o site nao inventa acompanhamento.
 *  - tirar do ar sem apagar: `available: false`.
 */

export const categories: Category[] = [
  { id: "marmitas", name: "Marmitas", icon: "Utensils" },
  { id: "lanches", name: "Lanches", icon: "Sandwich" },
  { id: "acai", name: "Açaí", icon: "IceCreamBowl" },
  { id: "bebidas", name: "Bebidas", icon: "CupSoda" },
  { id: "porcoes", name: "Porções", icon: "Drumstick" },
  { id: "sobremesas", name: "Sobremesas", icon: "Cake" },
  { id: "promocoes", name: "Promoções", icon: "Tag" },
];

export const products: Product[] = [
  {
    id: "marmita-padrao",
    name: "Marmita Padrão",
    description: "Arroz, feijão, carne do dia, farofa, legumes e salada.",
    price: 25,
    image: "/images/products/marmita-padrao.jpg",
    category: "marmitas",
    featured: true,
    available: true,
    badge: "Mais pedido",
    confirmado: false,
  },
  {
    id: "marmita-especial",
    name: "Marmita Especial",
    description:
      "Arroz, feijão, carne do dia, farofa, legumes, salada e um adicional.",
    price: 28,
    image: "/images/products/marmita-especial.jpg",
    category: "marmitas",
    featured: true,
    available: true,
    confirmado: false,
  },
  {
    id: "marmitex-noturna",
    name: "Marmitex Noturna",
    description: "Opções especiais para a noite. Servida a partir das 18h.",
    price: 27,
    image: "/images/products/marmitex-noturna.jpg",
    category: "marmitas",
    featured: true,
    available: true,
    confirmado: false,
  },
  {
    id: "lasanha",
    name: "Lasanha",
    description:
      "Lasanha de carne moída ao molho bolonhesa com queijo gratinado.",
    price: 25,
    image: "/images/products/lasanha.jpg",
    category: "marmitas",
    featured: true,
    available: true,
    confirmado: false,
  },
  {
    id: "beirute-com-fritas",
    name: "Beirute com fritas",
    description:
      "Pão sírio, carne, queijo, maionese especial e fritas crocantes.",
    price: 26,
    image: "/images/products/beirute-com-fritas.jpg",
    category: "lanches",
    featured: true,
    available: true,
    confirmado: false,
  },
  {
    id: "acai-500ml",
    name: "Açaí 500ml",
    description: "Açaí puro com granola, banana, leite em pó e acompanhamento.",
    price: 16,
    image: "/images/products/acai-500ml.jpg",
    category: "acai",
    featured: true,
    available: true,
    confirmado: false,
  },
];

/** Categorias que realmente tem item disponivel -- as outras nem aparecem. */
export function categoriasComProduto(): Category[] {
  return categories.filter((categoria) =>
    products.some(
      (produto) =>
        produto.category === categoria.id && produto.available !== false,
    ),
  );
}

export function produtosDisponiveis(): Product[] {
  return products.filter((produto) => produto.available !== false);
}

export function produtosDaCategoria(categoriaId: string): Product[] {
  return produtosDisponiveis().filter(
    (produto) => produto.category === categoriaId,
  );
}

export function produtosDestaque(): Product[] {
  return produtosDisponiveis().filter((produto) => produto.featured);
}

export function buscarProduto(id: string): Product | undefined {
  return products.find((produto) => produto.id === id);
}

/** true enquanto existir item cujo preco/descricao a casa ainda nao confirmou. */
export const cardapioEmConferencia = produtosDisponiveis().some(
  (produto) => produto.confirmado !== true,
);
