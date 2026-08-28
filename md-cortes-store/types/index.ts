/** Tipos do domínio. Dinheiro é sempre inteiro em centavos. */

export type Uuid = string;

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type PaymentMethod = "pix" | "dinheiro" | "debito" | "credito";
export type SaleStatus = "concluida" | "cancelada";
export type MovementKind = "entrada" | "venda" | "cancelamento" | "ajuste" | "cadastro";
export type CategoryId =
  | "camiseta"
  | "bermuda"
  | "calca"
  | "bone"
  | "tenis"
  | "acessorio"
  | "outros";
export type CategoryGroup = "roupas" | "acessorios" | "calcados";
export type ExpenseCategory =
  | "mercadoria"
  | "embalagem"
  | "frete"
  | "marketing"
  | "aluguel"
  | "transporte"
  | "outros";

export interface Product {
  id: Uuid;
  name: string;
  category: CategoryId;
  supplierId: Uuid | null;
  sku: string | null;
  costCents: number;
  priceCents: number;
  minStock: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Uma cor do produto. O estoque pendura aqui, não no produto. */
export interface Variant {
  id: Uuid;
  productId: Uuid;
  colorName: string;
  colorHex: string;
  sku: string | null;
  imageUrl: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryRow {
  id: Uuid;
  variantId: Uuid;
  size: string;
  quantity: number;
  position: number;
  updatedAt: string;
}

export interface Sale {
  id: Uuid;
  totalCents: number;
  costCents: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  note: string | null;
  soldAt: string;
  cancelledAt: string | null;
  createdAt: string;
}

export interface SaleItem {
  id: Uuid;
  saleId: Uuid;
  variantId: Uuid | null;
  productId: Uuid | null;
  /** Nome e cor gravados no momento da venda, para o histórico não mudar depois. */
  productName: string;
  colorName: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  unitCostCents: number;
}

export interface Movement {
  id: Uuid;
  variantId: Uuid;
  size: string;
  delta: number;
  kind: MovementKind;
  unitCostCents: number | null;
  supplierId: Uuid | null;
  saleId: Uuid | null;
  note: string | null;
  createdAt: string;
}

export interface Expense {
  id: Uuid;
  description: string;
  amountCents: number;
  category: ExpenseCategory;
  spentOn: string;
  createdAt: string;
}

export interface Supplier {
  id: Uuid;
  name: string;
  phone: string | null;
  notes: string | null;
  archived: boolean;
  createdAt: string;
}

export interface Settings {
  remindersEnabled: boolean;
  reminderIntervalMinutes: 60 | 120 | 180 | 240;
  quietStart: string;
  quietEnd: string;
  reminderMessage: string;
  defaultPayment: PaymentMethod;
  lowStockAlert: boolean;
  onboarded: boolean;
  lastSaleAt: string | null;
  lastStockUpdateAt: string | null;
  lastReminderAt: string | null;
}

export interface DailyClosing {
  id: Uuid;
  closingDate: string;
  revenueCents: number;
  costCents: number;
  expensesCents: number;
  profitCents: number;
  itemsSold: number;
  salesCount: number;
  byPayment: Partial<Record<PaymentMethod, number>>;
  topProducts: { name: string; quantity: number }[];
  closedAt: string;
}

/** Produto + cor + estoque, já montado do jeito que a interface consome. */
export interface VariantView {
  variant: Variant;
  product: Product;
  sizes: { size: string; quantity: number; position: number }[];
  total: number;
  lowStock: boolean;
  outOfStock: boolean;
  profitCents: number;
  lastEntryAt: string | null;
  lastSaleAt: string | null;
}

export interface CartLine {
  variantId: Uuid;
  size: string;
  quantity: number;
}
