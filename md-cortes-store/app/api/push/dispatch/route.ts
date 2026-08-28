import { NextResponse } from "next/server";
import webpush from "web-push";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { isReminderDue } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Envia o lembrete quando o app está fechado.
 *
 * Chamada por agendador (Vercel Cron a cada 30 min — ver vercel.json). A
 * decisão de avisar ou não é a mesma do app: lib/reminders.ts. Quem vendeu há
 * pouco não recebe nada.
 */
export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  const autorizado =
    !segredo ||
    request.headers.get("authorization") === `Bearer ${segredo}` ||
    request.headers.get("x-vercel-cron") !== null;
  if (!autorizado) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });

  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  const contato = process.env.VAPID_SUBJECT ?? "mailto:contato@mdcortesstore.com.br";
  if (!publica || !privada) {
    return NextResponse.json({ ok: true, enviados: 0, motivo: "sem chaves VAPID" });
  }

  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ erro: "supabase não configurado" }, { status: 503 });

  webpush.setVapidDetails(contato, publica, privada);

  const { data: preferencias, error } = await supabase
    .from("settings")
    .select(
      "user_id, reminders_enabled, reminder_interval_minutes, quiet_start, quiet_end, reminder_message, last_sale_at, last_stock_update_at, last_reminder_at",
    )
    .eq("reminders_enabled", true);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  const agora = new Date();
  let enviados = 0;

  for (const pref of preferencias ?? []) {
    const devido = isReminderDue(
      {
        enabled: true,
        intervalMinutes: pref.reminder_interval_minutes,
        quietStart: String(pref.quiet_start).slice(0, 5),
        quietEnd: String(pref.quiet_end).slice(0, 5),
      },
      {
        lastSaleAt: pref.last_sale_at,
        lastStockUpdateAt: pref.last_stock_update_at,
        lastReminderAt: pref.last_reminder_at,
      },
      agora,
    );
    if (!devido) continue;

    const { data: inscricoes } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", pref.user_id);
    if (!inscricoes?.length) continue;

    const carga = JSON.stringify({
      title: "MD Cortes Store",
      body: pref.reminder_message,
      url: "/venda",
      tag: "lembrete-md",
    });

    for (const inscricao of inscricoes) {
      try {
        await webpush.sendNotification(
          {
            endpoint: inscricao.endpoint,
            keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
          },
          carga,
        );
        enviados += 1;
        await supabase
          .from("push_subscriptions")
          .update({ last_sent_at: agora.toISOString() })
          .eq("id", inscricao.id);
      } catch (falha) {
        // 404/410: o aparelho desinstalou o app ou revogou a permissão.
        const status = (falha as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", inscricao.id);
        }
      }
    }

    await supabase
      .from("settings")
      .update({ last_reminder_at: agora.toISOString() })
      .eq("user_id", pref.user_id);
  }

  return NextResponse.json({ ok: true, enviados });
}
