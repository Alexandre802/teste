import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/** Troca o código do e-mail de recuperação por uma sessão. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destinoBruto = url.searchParams.get("destino") ?? "/";
  // Só caminho interno: um `destino` absoluto viraria redirecionamento aberto.
  const destino = destinoBruto.startsWith("/") && !destinoBruto.startsWith("//") ? destinoBruto : "/";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(destino, url.origin));
}
