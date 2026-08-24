/**
 * Catálogo. Fonte única de produtos e categorias — nenhum produto deve ser
 * escrito direto no JSX.
 *
 * Regras de conteúdo:
 *  - `price` vem do cardápio oficial (referencias/cardapio.json).
 *  - `description` só contém texto confirmado. Onde o cardápio de origem
 *    truncava, o texto termina em "…" — não completar inventando ingrediente.
 *  - `image` só é preenchido quando existe foto real DAQUELE produto.
 *    Produto sem foto confirmada renderiza o placeholder da marca.
 */

export type CategoryId =
  | 'tradicionais'
  | 'beirutes'
  | 'master'
  | 'combos'
  | 'porcoes'
  | 'bebidas'
  | 'acai'
  | 'gourmet';

export interface Category {
  id: CategoryId;
  label: string;
  /** Frase curta usada como subtítulo ao filtrar a categoria. */
  blurb: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  description: string;
  /** Caminho em /public/produtos, ou null quando não há foto real do item. */
  image: string | null;
  available: boolean;
  /** Destaque na seção "Os favoritos da casa". */
  featured?: boolean;
}

export const categories: Category[] = [
  { id: 'tradicionais', label: 'Tradicionais', blurb: 'O clássico da casa, do hot dog ao X Tudo.' },
  { id: 'beirutes', label: 'Beirutes', blurb: 'Pão sírio, recheio generoso e batata frita para acompanhar.' },
  { id: 'master', label: 'Master', blurb: 'Pão master, para dividir ou encarar sozinho.' },
  { id: 'combos', label: 'Combos', blurb: 'Lanche, porção e bebida num preço só.' },
  { id: 'porcoes', label: 'Porções', blurb: 'Batata fritinha na hora.' },
  { id: 'bebidas', label: 'Bebidas', blurb: 'Geladas para acompanhar.' },
  { id: 'acai', label: 'Açaí', blurb: 'Puro, do jeito que tem que ser.' },
  { id: 'gourmet', label: 'Gourmet', blurb: 'Pão de brioche e hambúrguer caseiro de 180 g.' },
];

const img = (slug: string) => `/produtos/${slug}.webp`;

export const products: Product[] = [
  // ─────────────────────────── TRADICIONAIS ───────────────────────────
  { id: 'americano', name: 'Americano', category: 'tradicionais', price: 23.5, available: true, image: null,
    description: 'Pão de hambúrguer, presunto, queijo, ovo, batata palha, vinagrete ou tomate, alface…' },
  { id: 'hot-dog', name: 'Hot Dog', category: 'tradicionais', price: 17.5, available: true, image: img('hot-dog'),
    description: 'Pão de hambúrguer, 2 salsichas, queijo, batata palha, purê, vinagrete ou tomate…' },
  { id: 'hot-bacon', name: 'Hot Bacon', category: 'tradicionais', price: 22.9, available: true, image: img('hot-bacon'),
    description: 'Pão de hambúrguer, 2 salsichas, bacon, queijo, batata palha, purê, vinagrete ou tomate…' },
  { id: 'hot-frango', name: 'Hot Frango', category: 'tradicionais', price: 22.8, available: true, image: null,
    description: 'Pão de hambúrguer, 2 salsichas, frango (filé cortado), queijo, batata palha, purê…' },
  { id: 'hot-burguer', name: 'Hot Burguer', category: 'tradicionais', price: 22.9, available: true, image: null,
    description: 'Pão de hambúrguer, 2 salsichas, hambúrguer, queijo, batata palha, purê, vinagrete ou tomate…' },
  { id: 'hot-egg', name: 'Hot Egg', category: 'tradicionais', price: 21.9, available: true, image: null,
    description: 'Pão de hambúrguer, 2 salsichas, ovo, queijo, batata palha, vinagrete ou tomate…' },
  { id: 'hot-calabresa', name: 'Hot Calabresa', category: 'tradicionais', price: 23.2, available: true, image: null,
    description: 'Pão de hambúrguer, 2 salsichas, calabresa, queijo, batata palha, purê, vinagrete ou tomate…' },
  { id: 'hot-catupiry', name: 'Hot Catupiry', category: 'tradicionais', price: 23.8, available: true, image: null,
    description: 'Pão de hambúrguer, 2 salsichas, catupiry, queijo, batata palha, purê, vinagrete ou tomate…' },
  { id: 'hot-cheddar', name: 'Hot Cheddar', category: 'tradicionais', price: 23.8, available: true, image: null,
    description: 'Pão de hambúrguer, 2 salsichas, cheddar, queijo, batata palha, purê, vinagrete ou tomate…' },
  { id: 'hot-misto', name: 'Hot Misto', category: 'tradicionais', price: 23.2, available: true, image: null,
    description: 'Pão de hambúrguer, 2 salsichas, presunto, queijo, batata palha, purê, vinagrete ou tomate…' },
  { id: 'hot-egg-bacon', name: 'Hot Egg Bacon', category: 'tradicionais', price: 25.5, available: true, image: null,
    description: 'Pão de hambúrguer, 2 salsichas, ovo, bacon, queijo, batata palha, purê, vinagrete ou tomate…' },
  { id: 'salsichao', name: 'Salsichão', category: 'tradicionais', price: 24.3, available: true, image: null,
    description: 'Pão quadrado, 2 salsichas, queijo, batata palha, purê, vinagrete ou tomate, alface…' },
  { id: 'misto-quente', name: 'Misto Quente', category: 'tradicionais', price: 22.8, available: true, image: null,
    description: 'Pão de hambúrguer, presunto, queijo, batata palha, maionese e ketchup.' },
  { id: 'queijo-quente', name: 'Queijo Quente', category: 'tradicionais', price: 20.5, available: true, image: null,
    description: 'Pão de hambúrguer, queijo, batata palha, vinagrete ou tomate, alface, maionese…' },
  { id: 'bauru', name: 'Bauru', category: 'tradicionais', price: 22.9, available: true, image: null,
    description: 'Pão de hambúrguer, presunto, queijo, orégano, batata palha, vinagrete ou tomate…' },
  { id: 'hamburguer', name: 'Hambúrguer', category: 'tradicionais', price: 14.5, available: true, image: null,
    description: 'Pão de hambúrguer, hambúrguer, batata palha, maionese e ketchup.' },
  { id: 'x-burguer', name: 'X Burguer', category: 'tradicionais', price: 17.5, available: true, image: null,
    description: 'Pão de hambúrguer, hambúrguer, queijo, batata palha, maionese e ketchup.' },
  { id: 'x-salada', name: 'X Salada', category: 'tradicionais', price: 21.5, available: true, image: null, featured: true,
    description: 'Pão de hambúrguer, hambúrguer, queijo, batata palha, vinagrete ou tomate, alface.' },
  { id: 'x-bacon', name: 'X Bacon', category: 'tradicionais', price: 28.5, available: true, image: null,
    description: 'Pão de hambúrguer, hambúrguer, bacon, queijo, batata palha, vinagrete ou tomate.' },
  { id: 'x-egg', name: 'X Egg', category: 'tradicionais', price: 26.0, available: true, image: img('x-egg'),
    description: 'Pão de hambúrguer, hambúrguer, ovo, queijo, batata palha, vinagrete ou tomate, alface.' },
  { id: 'x-egg-bacon', name: 'X Egg Bacon', category: 'tradicionais', price: 29.9, available: true, image: img('x-egg-bacon'), featured: true,
    description: 'Pão de hambúrguer, hambúrguer, ovo, bacon, queijo, batata palha, vinagrete ou tomate.' },
  { id: 'x-frango', name: 'X Frango', category: 'tradicionais', price: 26.9, available: true, image: null,
    description: 'Pão de hambúrguer, frango (filé cortado), queijo, orégano, batata palha, vinagrete ou tomate…' },
  { id: 'x-frango-bacon', name: 'X Frango Bacon', category: 'tradicionais', price: 29.9, available: true, image: null,
    description: 'Pão de hambúrguer, frango (filé cortado), bacon, queijo, orégano, batata palha…' },
  { id: 'x-frango-egg', name: 'X Frango Egg', category: 'tradicionais', price: 27.3, available: true, image: null,
    description: 'Pão de hambúrguer, frango (filé cortado), ovo, queijo, orégano, batata palha, vinagrete ou tomate…' },
  { id: 'x-frango-egg-bacon', name: 'X Frango Egg Bacon', category: 'tradicionais', price: 31.5, available: true, image: null,
    description: 'Pão de hambúrguer, frango (filé cortado), ovo, bacon, queijo, orégano, batata palha…' },
  { id: 'x-frango-calabresa', name: 'X Frango Calabresa', category: 'tradicionais', price: 29.7, available: true, image: null,
    description: 'Pão de hambúrguer, frango (filé cortado), calabresa, queijo, orégano, batata palha…' },
  { id: 'x-frangao', name: 'X Frangão', category: 'tradicionais', price: 31.5, available: true, image: null,
    description: 'Pão quadrado, frango (filé cortado), queijo, orégano, batata palha, vinagrete ou tomate…' },
  { id: 'x-frangao-bacon', name: 'X Frangão Bacon', category: 'tradicionais', price: 33.8, available: true, image: null,
    description: 'Pão quadrado, frango (filé cortado), bacon, queijo, orégano, batata palha, vinagrete ou tomate…' },
  { id: 'x-frangao-egg', name: 'X Frangão Egg', category: 'tradicionais', price: 31.7, available: true, image: null,
    description: 'Pão quadrado, frango (filé cortado), ovo, queijo, orégano, batata palha, vinagrete ou tomate…' },
  { id: 'x-frangao-egg-bacon', name: 'X Frangão Egg Bacon', category: 'tradicionais', price: 34.2, available: true, image: null,
    description: 'Pão quadrado, frango (filé cortado), ovo, bacon, queijo, orégano, batata palha…' },
  { id: 'x-frangao-calabresa', name: 'X Frangão Calabresa', category: 'tradicionais', price: 33.7, available: true, image: null,
    description: 'Pão quadrado, frango (filé cortado), calabresa, queijo, orégano, batata palha…' },
  { id: 'x-calabresa', name: 'X Calabresa', category: 'tradicionais', price: 28.9, available: true, image: img('x-calabresa'),
    description: 'Pão quadrado, calabresa, queijo, orégano, batata palha, vinagrete ou tomate, alface…' },
  { id: 'x-churrasco', name: 'X Churrasco', category: 'tradicionais', price: 29.9, available: true, image: img('x-churrasco'), featured: true,
    description: 'Pão de hambúrguer, bife de contra-filé, queijo, batata palha, vinagrete ou tomate, alface.' },
  { id: 'x-tudo', name: 'X Tudo', category: 'tradicionais', price: 41.5, available: true, image: img('x-tudo'), featured: true,
    description: 'Pão quadrado, hambúrguer, frango em filé cortado, bacon, ovo, calabresa e salsicha.' },

  // ───────────────────────────── BEIRUTES ─────────────────────────────
  { id: 'beirute-frango', name: 'Beirute de Frango', category: 'beirutes', price: 49.9, available: true, image: img('beirute-frango'),
    description: 'Pão sírio, frango (filé cortado), queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },
  { id: 'beirute-frango-calabresa', name: 'Beirute Frango Calabresa', category: 'beirutes', price: 53.2, available: true, image: img('beirute-frango-calabresa'),
    description: 'Pão sírio, frango (filé cortado), calabresa, queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },
  { id: 'beirute-vegetariano', name: 'Beirute Vegetariano', category: 'beirutes', price: 49.5, available: true, image: img('beirute-vegetariano'),
    description: 'Pão sírio, ovo, queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },
  { id: 'beirute-calabresa', name: 'Beirute de Calabresa', category: 'beirutes', price: 48.9, available: true, image: img('beirute-calabresa'),
    description: 'Pão sírio, calabresa, queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },
  { id: 'beirute-carne', name: 'Beirute de Carne', category: 'beirutes', price: 56.9, available: true, image: img('beirute-carne'),
    description: 'Pão sírio, bife de contra-filé, queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },
  { id: 'beirute-frango-egg', name: 'Beirute Frango Egg', category: 'beirutes', price: 52.7, available: true, image: img('beirute-frango-egg'),
    description: 'Pão sírio, frango (filé cortado), ovo, queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },
  { id: 'beirute-frango-bacon', name: 'Beirute Frango Bacon', category: 'beirutes', price: 54.5, available: true, image: img('beirute-frango-bacon'),
    description: 'Pão sírio, frango (filé cortado), bacon, queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },
  { id: 'beirute-americano', name: 'Beirute Americano', category: 'beirutes', price: 49.9, available: true, image: img('beirute-americano'),
    description: 'Pão sírio, ovo, presunto, queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },
  { id: 'beirute-hamburguer', name: 'Beirute de Hambúrguer', category: 'beirutes', price: 48.9, available: true, image: img('beirute-hamburguer'),
    description: 'Pão sírio, 4 hambúrgueres, queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },
  { id: 'beirute-especial-frango', name: 'Beirute Especial de Frango', category: 'beirutes', price: 63.8, available: true, image: img('beirute-especial-frango'),
    description: 'Pão sírio, frango (filé cortado), 2 ovos, bacon, queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },
  { id: 'beirute-especial-carne', name: 'Beirute Especial de Carne', category: 'beirutes', price: 69.8, available: true, image: img('beirute-especial-carne'),
    description: 'Pão sírio, bife de contra-filé, 2 ovos, bacon, queijo, orégano, maionese, alface e tomate. Acompanha batata frita.' },

  // ────────────────────────────── MASTER ──────────────────────────────
  { id: 'master-frango', name: 'Máster de Frango', category: 'master', price: 69.9, available: true, image: img('master-frango'),
    description: 'Pão master, frango (filé cortado), ovo, queijo, orégano, batata palha, vinagrete ou tomate…' },
  { id: 'master-tudo', name: 'Máster Tudo', category: 'master', price: 79.9, available: true, image: null,
    description: 'Pão master, hambúrguer, bacon, salsicha, calabresa, frango, ovo, presunto, queijo…' },

  // ────────────────────────────── COMBOS ──────────────────────────────
  { id: 'combo-1', name: 'Combo 1', category: 'combos', price: 54.9, available: true, image: img('combo-1'),
    description: '2 Hot Dogs + 1 porção de batata pequena + Guaranita 600 ml.' },
  { id: 'combo-2', name: 'Combo 2', category: 'combos', price: 65.3, available: true, image: null,
    description: '2 X Salada + 1 porção de batata pequena + Guaranita 600 ml.' },
  { id: 'combo-3', name: 'Combo 3', category: 'combos', price: 69.8, available: true, image: null,
    description: '2 X Egg + 1 porção de batata pequena + Guaranita 600 ml.' },
  { id: 'combo-4', name: 'Combo 4', category: 'combos', price: 75.5, available: true, image: null,
    description: '2 X Egg Bacon + 1 porção de batata pequena + Guaranita 600 ml.' },
  { id: 'kids', name: 'Kids', category: 'combos', price: 29.8, available: true, image: img('kids'),
    description: '1 X Burguer com pão, hambúrguer, queijo, batata palha e ketchup.' },

  // ────────────────────────────── PORÇÕES ─────────────────────────────
  { id: 'batata-simples', name: 'Batata simples pequena', category: 'porcoes', price: 23.8, available: true, image: img('batata-simples'),
    description: 'Porção pequena de batata frita.' },
  { id: 'batata-especial', name: 'Batata especial pequena', category: 'porcoes', price: 29.9, available: true, image: img('batata-especial'),
    description: 'Batata com bacon e cheddar.' },

  // ────────────────────────────── BEBIDAS ─────────────────────────────
  { id: 'coca-lata', name: 'Coca-Cola lata 350 ml', category: 'bebidas', price: 7.5, available: true, image: img('coca-lata'), description: '' },
  { id: 'coca-zero-lata', name: 'Coca-Cola Zero lata 350 ml', category: 'bebidas', price: 7.5, available: true, image: img('coca-zero-lata'), description: '' },
  { id: 'fanta-laranja-lata', name: 'Fanta Laranja lata 350 ml', category: 'bebidas', price: 7.5, available: true, image: img('fanta-laranja-lata'), description: '' },
  { id: 'fanta-uva-lata', name: 'Fanta Uva lata 350 ml', category: 'bebidas', price: 7.5, available: true, image: img('fanta-uva-lata'), description: '' },
  { id: 'guaranita-600', name: 'Guaranita 600 ml', category: 'bebidas', price: 8.0, available: true, image: null, description: '' },
  { id: 'coca-600', name: 'Coca-Cola 600 ml', category: 'bebidas', price: 10.0, available: true, image: null, description: '' },
  { id: 'coca-1l', name: 'Coca-Cola 1 L', category: 'bebidas', price: 12.0, available: true, image: null, description: '' },
  { id: 'guaranita-2l', name: 'Guaranita 2 L', category: 'bebidas', price: 12.5, available: true, image: null, description: '' },
  { id: 'fanta-laranja-2l', name: 'Fanta Laranja 2 L', category: 'bebidas', price: 16.0, available: true, image: img('fanta-laranja-2l'), description: '' },
  { id: 'fanta-uva-2l', name: 'Fanta Uva 2 L', category: 'bebidas', price: 16.0, available: true, image: null, description: '' },
  { id: 'coca-2l', name: 'Coca-Cola 2 L', category: 'bebidas', price: 17.5, available: true, image: null, description: '' },
  { id: 'coca-zero-2l', name: 'Coca-Cola Zero 2 L', category: 'bebidas', price: 17.5, available: true, image: null, description: '' },
  { id: 'suco-abacaxi-hortela', name: 'Suco Naturalle Abacaxi com Hortelã 450 ml', category: 'bebidas', price: 8.0, available: false, image: null, description: '' },
  { id: 'suco-laranja', name: 'Suco Naturalle Laranja 450 ml', category: 'bebidas', price: 8.0, available: false, image: null, description: '' },
  { id: 'suco-goiaba', name: 'Suco Naturalle Goiaba 450 ml', category: 'bebidas', price: 8.0, available: false, image: null, description: '' },
  { id: 'suco-maracuja', name: 'Suco Naturalle Maracujá 450 ml', category: 'bebidas', price: 8.0, available: false, image: null, description: '' },
  { id: 'suco-manga', name: 'Suco Naturalle Manga 450 ml', category: 'bebidas', price: 8.0, available: false, image: null, description: '' },

  // ─────────────────────────────── AÇAÍ ───────────────────────────────
  { id: 'acai-500', name: 'Açaí 500 ml', category: 'acai', price: 16.0, available: true, image: img('acai-500'), description: 'Puro.' },
  { id: 'acai-300', name: 'Açaí 300 ml', category: 'acai', price: 14.0, available: true, image: img('acai-300'), description: 'Puro.' },

  // ────────────────────────────── GOURMET ─────────────────────────────
  { id: 'x-burguer-gourmet', name: 'X Burguer Gourmet', category: 'gourmet', price: 22.0, available: true, image: img('x-burguer-gourmet'),
    description: 'Pão de brioche, hambúrguer caseiro 100% bovino de 180 g ao ponto da casa, queijo cheddar…' },
  { id: 'x-salada-gourmet', name: 'X Salada Gourmet', category: 'gourmet', price: 29.0, available: true, image: img('x-salada-gourmet'),
    description: 'Pão de brioche, hambúrguer caseiro 100% bovino de 180 g ao ponto da casa, queijo cheddar…' },
  { id: 'x-bacon-gourmet', name: 'X Bacon Gourmet', category: 'gourmet', price: 35.0, available: true, image: img('x-bacon-gourmet'), featured: true,
    description: 'Pão de brioche, hambúrguer caseiro 100% bovino de 180 g ao ponto da casa, queijo cheddar…' },
  { id: 'especial-da-casa', name: 'Especial da Casa', category: 'gourmet', price: 42.0, available: true, image: img('especial-da-casa'), featured: true,
    description: 'Pão de brioche, hambúrguer caseiro 100% bovino de 180 g ao ponto da casa, queijo cheddar…' },
];

export const productsById = new Map(products.map((p) => [p.id, p]));

export const featuredProducts = products.filter((p) => p.featured);

export function productsByCategory(id: CategoryId): Product[] {
  return products.filter((p) => p.category === id);
}

export function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
