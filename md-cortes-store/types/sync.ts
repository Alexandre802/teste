import type {
  DailyClosing,
  Expense,
  InventoryRow,
  Json,
  Movement,
  Product,
  Sale,
  SaleItem,
  Settings,
  Supplier,
  Uuid,
} from "@/types";

/** Retrato completo dos dados da loja. */
export interface DataSnapshot {
  products: Product[];
  variants: import("@/types").Variant[];
  inventory: InventoryRow[];
  sales: Sale[];
  saleItems: SaleItem[];
  movements: Movement[];
  expenses: Expense[];
  suppliers: Supplier[];
  closings: DailyClosing[];
  settings: Settings;
  ownerName: string;
}

export interface SalePayloadItem {
  id: Uuid;
  variant_id: Uuid;
  product_id: Uuid;
  product_name: string;
  color_name: string;
  size: string;
  quantity: number;
  unit_price_cents: number;
  unit_cost_cents: number;
}

export interface SalePayload {
  id: Uuid;
  payment_method: string;
  note: string | null;
  sold_at: string;
  items: SalePayloadItem[];
}

export interface MovementPayload {
  id: Uuid;
  variant_id: Uuid;
  size: string;
  delta: number;
  kind: string;
  unit_cost_cents: number | null;
  supplier_id: Uuid | null;
  note: string | null;
  position: number;
  created_at: string;
}

export type UpsertTable =
  | "products"
  | "product_variants"
  | "expenses"
  | "suppliers"
  | "settings"
  | "daily_closings";

/** Uma operação esperando o Supabase. Sobrevive a fechar o app. */
export type OutboxOp = { id: Uuid; createdAt: string; attempts: number } & (
  | { kind: "sale"; payload: SalePayload }
  | { kind: "cancel_sale"; saleId: Uuid }
  | { kind: "movements"; movements: MovementPayload[] }
  | { kind: "upsert"; table: UpsertTable; row: Record<string, Json> }
  | { kind: "delete"; table: UpsertTable; rowId: Uuid }
);

export type SyncState = "ocioso" | "sincronizando" | "pendente" | "offline" | "erro";
