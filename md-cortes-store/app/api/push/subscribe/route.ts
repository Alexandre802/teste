import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface Inscricao {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

/** Guarda a inscrição de Web Push do aparelho. */
export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ erro: "supabase não configurado" }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "sem sessão" }, { status: 401 });

  const corpo = (await request.json().catch(() => null)) as Inscricao | null;
  if (!corpo?.endpoint || !corpo.keys?.p256dh || !corpo.keys.auth) {
    return NextResponse.json({ erro: "inscrição inválida" }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: corpo.endpoint,
      p256dh: corpo.keys.p256dh,
      auth: corpo.keys.auth,
      user_agent: request.headers.get("user-agent"),
    },
    { onConflict: "endpoint" },
  );
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ erro: "supabase não configurado" }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "sem sessão" }, { status: 401 });

  const corpo = (await request.json().catch(() => null)) as { endpoint?: string } | null;
  if (!corpo?.endpoint) return NextResponse.json({ erro: "endpoint ausente" }, { status: 400 });

  await supabase.from("push_subscriptions").delete().eq("endpoint", corpo.endpoint);
  return NextResponse.json({ ok: true });
}
