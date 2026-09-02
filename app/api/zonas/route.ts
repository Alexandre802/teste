import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  supabaseConfigurado,
} from "@/lib/supabase/config";

/**
 * Área de entrega e taxa para o site público.
 *
 * A taxa que aparece aqui é a MESMA que o servidor usa ao gravar o pedido:
 * as duas leem comida_caseira_delivery_zones. Sem essa rota o site cairia na
 * lista estática de data/deliveryZones.ts, que existe só como ponto de
 * partida antes do banco entrar no ar.
 */

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  if (!supabaseConfigurado) {
    return NextResponse.json({ zonas: [] }, { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("comida_caseira_zonas_publicas");

  if (error) {
    // Falhar aqui não pode quebrar o cardápio: o site segue com a lista local.
    return NextResponse.json({ zonas: [] }, { status: 200 });
  }

  return NextResponse.json({ zonas: data ?? [] });
}
