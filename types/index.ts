/** Tipos do dominio do site da Comida Caseira da Marcia Costa. */

export type ProductOptionChoice = {
  id: string;
  name: string;
  /** Quanto essa escolha soma ao preco base do item, em reais. */
  priceDelta: number;
  available?: boolean;
};

export type ProductOption = {
  id: string;
  name: string;
  type: "single" | "multiple";
  required?: boolean;
  max?: number;
  choices: ProductOptionChoice[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  /** Preco base/em reais. */
  price: number;
  /** true quando o cardapio original apresenta o item como "a partir de". */
  priceFrom?: boolean;
  image: string | null;
  category: string;
  featured?: boolean;
  available?: boolean;
  badge?: string;
  options?: ProductOption[];
  confirmado?: boolean;
};

export type Category = {
  id: string;
  name: string;
  icon?: string;
};

export type SelectedOption = {
  optionId: string;
  optionName: string;
  choiceIds: string[];
  choiceNames: string[];
  priceDelta: number;
};

export type CartItem = {
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
  deliveryFee: number | null;
  total: number;
};

export type DeliveryZone = {
  id: string;
  cidade: string;
  bairros: string[];
  fee: number | null;
  pedidoMinimo: number | null;
  prazoMinutos: number | null;
};
