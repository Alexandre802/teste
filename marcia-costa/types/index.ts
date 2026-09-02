/** Tipos do dominio do site da Comida Caseira da Marcia Costa. */

/** Uma escolha dentro de um grupo de opcoes (tamanho, carne, adicional...). */
export type ProductOptionChoice = {
  id: string;
  name: string;
  /** Quanto essa escolha soma ao preco do item, em reais. Zero quando nao muda. */
  priceDelta: number;
  available?: boolean;
};

/** Um grupo de opcoes de um produto. So aparece na tela se existir nos dados. */
export type ProductOption = {
  id: string;
  /** Rotulo exibido, por exemplo "Escolha sua carne". */
  name: string;
  /** "single" mostra radio, "multiple" mostra checkbox. */
  type: "single" | "multiple";
  required?: boolean;
  /** Limite de escolhas quando type e "multiple". */
  max?: number;
  choices: ProductOptionChoice[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  /** Preco em reais. */
  price: number;
  /** Caminho da foto do proprio produto, ou null quando ainda nao ha foto. */
  image: string | null;
  category: string;
  featured?: boolean;
  available?: boolean;
  /** Selo curto, por exemplo "Mais pedido". */
  badge?: string;
  options?: ProductOption[];
  /**
   * false enquanto nome, descricao e preco nao forem confirmados pela casa.
   * O site avisa na tela que o cardapio esta em conferencia enquanto houver
   * item nao confirmado -- nunca finge que o dado esta fechado.
   */
  confirmado?: boolean;
};

export type Category = {
  id: string;
  name: string;
  /** Nome do icone lucide-react usado na barra de categorias. */
  icon?: string;
};

/** Escolhas feitas pelo cliente em um grupo de opcoes. */
export type SelectedOption = {
  optionId: string;
  optionName: string;
  choiceIds: string[];
  choiceNames: string[];
  priceDelta: number;
};

export type CartItem = {
  /** Identifica a linha do carrinho: produto + combinacao de opcoes. */
  lineId: string;
  productId: string;
  name: string;
  image: string | null;
  description: string;
  unitPrice: number;
  quantity: number;
  selectedOptions: SelectedOption[];
  observation?: string;
};

export type OrderType = "entrega" | "retirada";

export type PaymentMethod = "pix" | "dinheiro" | "debito" | "credito";

export type Address = {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  referencia: string;
};

export type Customer = {
  nome: string;
  telefone: string;
};

/** Tudo que o pedido precisa carregar ate virar mensagem de WhatsApp. */
export type Order = {
  items: CartItem[];
  orderType: OrderType | null;
  address: Address;
  customer: Customer;
  payment: PaymentMethod | null;
  precisaTroco: boolean;
  trocoPara: string;
  observation: string;
  subtotal: number;
  /** null quando a casa ainda nao confirmou a taxa da regiao. */
  deliveryFee: number | null;
  total: number;
};

/** Regiao atendida e o que ja foi confirmado sobre ela. */
export type DeliveryZone = {
  id: string;
  cidade: string;
  bairros: string[];
  /** null enquanto a taxa nao for confirmada pela casa. */
  fee: number | null;
  /** null enquanto o pedido minimo nao for confirmado. */
  pedidoMinimo: number | null;
  /** null enquanto o prazo nao for confirmado. */
  prazoMinutos: number | null;
};
