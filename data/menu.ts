import type { Category, Product, ProductOption } from "@/types";
import original from "@/data/menu-original.json";

/**
 * CARDÁPIO OFICIAL — COMIDA CASEIRA DA MÁRCIA COSTA
 *
 * Fonte: cardápio público da própria casa no InstaDelivery.
 * O JSON em menu-original.json contém exatamente os itens que estavam
 * publicados na fonte em 02/09/2026. Não há produto, preço ou foto de outro
 * restaurante neste arquivo.
 */

export const categories: Category[] = original.categories.map((categoria) => ({
  id: categoria.id,
  name: categoria.name,
  icon: categoria.icon,
}));

export const products: Product[] = original.products.map((produto) => ({
  id: produto.id,
  name: produto.name,
  description: produto.description,
  price: produto.price,
  priceFrom: produto.priceFrom,
  image: produto.image,
  category: produto.category,
  featured: produto.featured,
  available: produto.available,
  confirmado: produto.confirmado,
  options: produto.options.map((grupo) => ({
    id: grupo.id,
    name: grupo.name,
    type: grupo.type as ProductOption["type"],
    required: grupo.required,
    max: grupo.max,
    choices: grupo.choices.map((escolha) => ({
      id: escolha.id,
      name: escolha.name,
      priceDelta: escolha.priceDelta,
      available: escolha.available,
    })),
  })),
}));

/** Categorias que realmente têm item disponível. */
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
  const destaques = produtosDisponiveis().filter((produto) => produto.featured);
  return destaques.length > 0 ? destaques : produtosDisponiveis().slice(0, 4);
}

export function buscarProduto(id: string): Product | undefined {
  return products.find((produto) => produto.id === id);
}

/** O catálogo agora foi conferido diretamente contra a fonte oficial. */
export const cardapioEmConferencia = false;
