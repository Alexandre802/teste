/** Conversão entre as linhas do Postgres (snake_case) e o domínio (camelCase). */

import type {
  CategoryId,
  DailyClosing,
  Expense,
  ExpenseCategory,
  InventoryRow,
  Movement,
  MovementKind,
  PaymentMethod,
  Product,
  Sale,
  SaleItem,
  SaleStatus,
  Settings,
  Supplier,
  Variant,
} from "@/types";

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  supplier_id: string | null;
  sku: string | null;
  cost_cents: number;
  price_cents: number;
  min_stock: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface VariantRow {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  sku: string | null;
  image_url: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryRowRaw {
  id: string;
  variant_id: string;
  size: string;
  quantity: number;
  position: number;
  updated_at: string;
}

export interface SaleRow {
  id: string;
  total_cents: number;
  cost_cents: number;
  payment_method: string;
  status: string;
  note: string | null;
  sold_at: string;
  cancelled_at: string | null;
  created_at: string;
}

export interface SaleItemRow {
  id: string;
  sale_id: string;
  variant_id: string | null;
  product_id: string | null;
  product_name: string;
  color_name: string;
  size: string;
  quantity: number;
  unit_price_cents: number;
  unit_cost_cents: number;
}

export interface MovementRow {
  id: string;
  variant_id: string;
  size: string;
  delta: number;
  kind: string;
  unit_cost_cents: number | null;
  supplier_id: string | null;
  sale_id: string | null;
  note: string | null;
  created_at: string;
}

export interface ExpenseRow {
  id: string;
  description: string;
  amount_cents: number;
  category: string;
  spent_on: string;
  created_at: string;
}

export interface SupplierRow {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
}

export interface SettingsRow {
  reminders_enabled: boolean;
  reminder_interval_minutes: number;
  quiet_start: string;
  quiet_end: string;
  reminder_message: string;
  default_payment: string;
  low_stock_alert: boolean;
  onboarded: boolean;
  last_sale_at: string | null;
  last_stock_update_at: string | null;
  last_reminder_at: string | null;
}

export interface ClosingRow {
  id: string;
  closing_date: string;
  revenue_cents: number;
  cost_cents: number;
  expenses_cents: number;
  profit_cents: number;
  items_sold: number;
  sales_count: number;
  by_payment: Record<string, number> | null;
  top_products: { name: string; quantity: number }[] | null;
  closed_at: string;
}

const CATEGORY_IDS: CategoryId[] = [
  "camiseta", "bermuda", "calca", "bone", "tenis", "acessorio", "outros",
];
const PAYMENTS: PaymentMethod[] = ["pix", "dinheiro", "debito", "credito"];
const MOVEMENT_KINDS: MovementKind[] = ["entrada", "venda", "cancelamento", "ajuste", "cadastro"];
const EXPENSE_IDS: ExpenseCategory[] = [
  "mercadoria", "embalagem", "frete", "marketing", "aluguel", "transporte", "outros",
];

function asCategory(value: string): CategoryId {
  return CATEGORY_IDS.includes(value as CategoryId) ? (value as CategoryId) : "outros";
}
function asPayment(value: string): PaymentMethod {
  return PAYMENTS.includes(value as PaymentMethod) ? (value as PaymentMethod) : "pix";
}
function asMovementKind(value: string): MovementKind {
  return MOVEMENT_KINDS.includes(value as MovementKind) ? (value as MovementKind) : "ajuste";
}
function asExpenseCategory(value: string): ExpenseCategory {
  return EXPENSE_IDS.includes(value as ExpenseCategory) ? (value as ExpenseCategory) : "outros";
}
function asInterval(value: number): Settings["reminderIntervalMinutes"] {
  return value === 60 || value === 180 || value === 240 ? value : 120;
}

export const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  category: asCategory(r.category),
  supplierId: r.supplier_id,
  sku: r.sku,
  costCents: r.cost_cents,
  priceCents: r.price_cents,
  minStock: r.min_stock,
  archived: r.archived,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const toVariant = (r: VariantRow): Variant => ({
  id: r.id,
  productId: r.product_id,
  colorName: r.color_name,
  colorHex: r.color_hex,
  sku: r.sku,
  imageUrl: r.image_url,
  archived: r.archived,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const toInventory = (r: InventoryRowRaw): InventoryRow => ({
  id: r.id,
  variantId: r.variant_id,
  size: r.size,
  quantity: r.quantity,
  position: r.position,
  updatedAt: r.updated_at,
});

export const toSale = (r: SaleRow): Sale => ({
  id: r.id,
  totalCents: r.total_cents,
  costCents: r.cost_cents,
  paymentMethod: asPayment(r.payment_method),
  status: (r.status === "cancelada" ? "cancelada" : "concluida") as SaleStatus,
  note: r.note,
  soldAt: r.sold_at,
  cancelledAt: r.cancelled_at,
  createdAt: r.created_at,
});

export const toSaleItem = (r: SaleItemRow): SaleItem => ({
  id: r.id,
  saleId: r.sale_id,
  variantId: r.variant_id,
  productId: r.product_id,
  productName: r.product_name,
  colorName: r.color_name,
  size: r.size,
  quantity: r.quantity,
  unitPriceCents: r.unit_price_cents,
  unitCostCents: r.unit_cost_cents,
});

export const toMovement = (r: MovementRow): Movement => ({
  id: r.id,
  variantId: r.variant_id,
  size: r.size,
  delta: r.delta,
  kind: asMovementKind(r.kind),
  unitCostCents: r.unit_cost_cents,
  supplierId: r.supplier_id,
  saleId: r.sale_id,
  note: r.note,
  createdAt: r.created_at,
});

export const toExpense = (r: ExpenseRow): Expense => ({
  id: r.id,
  description: r.description,
  amountCents: r.amount_cents,
  category: asExpenseCategory(r.category),
  spentOn: r.spent_on,
  createdAt: r.created_at,
});

export const toSupplier = (r: SupplierRow): Supplier => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  notes: r.notes,
  archived: r.archived,
  createdAt: r.created_at,
});

export const toSettings = (r: SettingsRow): Settings => ({
  remindersEnabled: r.reminders_enabled,
  reminderIntervalMinutes: asInterval(r.reminder_interval_minutes),
  quietStart: (r.quiet_start ?? "08:00").slice(0, 5),
  quietEnd: (r.quiet_end ?? "22:00").slice(0, 5),
  reminderMessage: r.reminder_message,
  defaultPayment: asPayment(r.default_payment),
  lowStockAlert: r.low_stock_alert,
  onboarded: r.onboarded,
  lastSaleAt: r.last_sale_at,
  lastStockUpdateAt: r.last_stock_update_at,
  lastReminderAt: r.last_reminder_at,
});

export const toClosing = (r: ClosingRow): DailyClosing => ({
  id: r.id,
  closingDate: r.closing_date,
  revenueCents: r.revenue_cents,
  costCents: r.cost_cents,
  expensesCents: r.expenses_cents,
  profitCents: r.profit_cents,
  itemsSold: r.items_sold,
  salesCount: r.sales_count,
  byPayment: (r.by_payment ?? {}) as DailyClosing["byPayment"],
  topProducts: r.top_products ?? [],
  closedAt: r.closed_at,
});

export const settingsToRow = (s: Settings, userId: string) => ({
  user_id: userId,
  reminders_enabled: s.remindersEnabled,
  reminder_interval_minutes: s.reminderIntervalMinutes,
  quiet_start: s.quietStart,
  quiet_end: s.quietEnd,
  reminder_message: s.reminderMessage,
  default_payment: s.defaultPayment,
  low_stock_alert: s.lowStockAlert,
  onboarded: s.onboarded,
  // last_sale_at e last_stock_update_at são do servidor (as funções do banco
  // escrevem lá); só o horário do último lembrete nasce no cliente.
  last_reminder_at: s.lastReminderAt,
  updated_at: new Date().toISOString(),
});

export const DEFAULT_SETTINGS: Settings = {
  remindersEnabled: true,
  reminderIntervalMinutes: 120,
  quietStart: "08:00",
  quietEnd: "22:00",
  reminderMessage: "Maicon, você vendeu? Como está o estoque?",
  defaultPayment: "pix",
  lowStockAlert: true,
  onboarded: false,
  lastSaleAt: null,
  lastStockUpdateAt: null,
  lastReminderAt: null,
};

export const EMPTY_SNAPSHOT = {
  products: [],
  variants: [],
  inventory: [],
  sales: [],
  saleItems: [],
  movements: [],
  expenses: [],
  suppliers: [],
  closings: [],
  settings: DEFAULT_SETTINGS,
  ownerName: "Maicon",
};
