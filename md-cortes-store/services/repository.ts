"use client";

/**
 * Única camada que fala com o Supabase.
 *
 * Leitura: `pullAll` traz o retrato inteiro da loja — cabe numa tacada porque
 * é uma loja só. Escrita: `pushOp` executa uma operação da fila; as três que
 * mexem em estoque passam por funções do banco, que são atômicas e podem ser
 * reenviadas sem duplicar (ver supabase/migrations/0003_functions.sql).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DataSnapshot, OutboxOp } from "@/types/sync";
import {
  DEFAULT_SETTINGS,
  toClosing,
  toExpense,
  toInventory,
  toMovement,
  toProduct,
  toSale,
  toSaleItem,
  toSettings,
  toSupplier,
  toVariant,
  type ClosingRow,
  type ExpenseRow,
  type InventoryRowRaw,
  type MovementRow,
  type ProductRow,
  type SaleItemRow,
  type SaleRow,
  type SettingsRow,
  type SupplierRow,
  type VariantRow,
} from "./mappers";

/** Histórico recente basta para as telas; o banco guarda tudo. */
const HISTORY_LIMIT = 2000;

export async function pullAll(supabase: SupabaseClient, userId: string): Promise<DataSnapshot> {
  const [
    products, variants, inventory, sales, saleItems, movements, expenses, suppliers, closings,
    settings, profile,
  ] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("product_variants").select("*").order("created_at", { ascending: false }),
    supabase.from("inventory").select("*"),
    supabase.from("sales").select("*").order("sold_at", { ascending: false }).limit(HISTORY_LIMIT),
    supabase.from("sale_items").select("*").limit(HISTORY_LIMIT * 3),
    supabase.from("inventory_movements").select("*").order("created_at", { ascending: false }).limit(HISTORY_LIMIT),
    supabase.from("expenses").select("*").order("spent_on", { ascending: false }),
    supabase.from("suppliers").select("*").order("name"),
    supabase.from("daily_closings").select("*").order("closing_date", { ascending: false }).limit(180),
    supabase.from("settings").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
  ]);

  const first = [products, variants, inventory, sales, saleItems, movements, expenses, suppliers, closings]
    .find((r) => r.error);
  if (first?.error) throw new Error(first.error.message);

  return {
    products: ((products.data ?? []) as ProductRow[]).map(toProduct),
    variants: ((variants.data ?? []) as VariantRow[]).map(toVariant),
    inventory: ((inventory.data ?? []) as InventoryRowRaw[]).map(toInventory),
    sales: ((sales.data ?? []) as SaleRow[]).map(toSale),
    saleItems: ((saleItems.data ?? []) as SaleItemRow[]).map(toSaleItem),
    movements: ((movements.data ?? []) as MovementRow[]).map(toMovement),
    expenses: ((expenses.data ?? []) as ExpenseRow[]).map(toExpense),
    suppliers: ((suppliers.data ?? []) as SupplierRow[]).map(toSupplier),
    closings: ((closings.data ?? []) as ClosingRow[]).map(toClosing),
    settings: settings.data ? toSettings(settings.data as SettingsRow) : DEFAULT_SETTINGS,
    ownerName: (profile.data as { full_name?: string } | null)?.full_name ?? "Maicon",
  };
}

export async function pushOp(supabase: SupabaseClient, op: OutboxOp, userId: string): Promise<void> {
  switch (op.kind) {
    case "sale": {
      const { error } = await supabase.rpc("register_sale", { p_sale: op.payload });
      if (error) throw new Error(error.message);
      return;
    }
    case "cancel_sale": {
      const { error } = await supabase.rpc("cancel_sale", { p_sale_id: op.saleId });
      if (error) throw new Error(error.message);
      return;
    }
    case "movements": {
      const { error } = await supabase.rpc("apply_movements", { p_movements: op.movements });
      if (error) throw new Error(error.message);
      return;
    }
    case "upsert": {
      const conflict = op.table === "settings" ? "user_id" : "id";
      const { error } = await supabase
        .from(op.table)
        .upsert({ ...op.row, user_id: userId }, { onConflict: conflict });
      if (error) throw new Error(error.message);
      return;
    }
    case "delete": {
      const { error } = await supabase.from(op.table).delete().eq("id", op.rowId);
      if (error) throw new Error(error.message);
      return;
    }
  }
}

/** Foto do produto: `produtos/<uid>/<arquivo>`, que é o que a policy exige. */
export async function uploadPhoto(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("produtos")
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("produtos").getPublicUrl(path);
  return data.publicUrl;
}
