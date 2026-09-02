import { NextRequest, NextResponse } from "next/server";

const STORE = "https://instadelivery.com.br/comidacaseiradamarciacosta";

function scriptsFrom(html: string) {
  return [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => {
    try { return new URL(m[1], STORE).toString(); } catch { return m[1]; }
  });
}

function snippets(text: string, terms: string[]) {
  const out: string[] = [];
  const lower = text.toLowerCase();
  for (const term of terms) {
    let at = 0;
    const needle = term.toLowerCase();
    while ((at = lower.indexOf(needle, at)) >= 0 && out.length < 200) {
      out.push(text.slice(Math.max(0, at - 300), Math.min(text.length, at + needle.length + 500)));
      at += needle.length;
    }
  }
  return out;
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") || "html";
  const headers = { "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1" };

  if (mode === "url") {
    const raw = req.nextUrl.searchParams.get("url") || "";
    if (!raw.startsWith("https://instadelivery.com.br/") && !raw.startsWith("https://www.instadelivery.com.br/")) {
      return NextResponse.json({ error: "host bloqueado" }, { status: 400 });
    }
    const r = await fetch(raw, { headers, cache: "no-store" });
    const text = await r.text();
    return NextResponse.json({ status: r.status, url: r.url, contentType: r.headers.get("content-type"), len: text.length, text: text.slice(0, 200000) });
  }

  const r = await fetch(STORE, { headers, cache: "no-store" });
  const html = await r.text();
  const scripts = scriptsFrom(html);
  if (mode === "scripts") {
    const results = [];
    for (const url of scripts) {
      try {
        const rr = await fetch(url, { headers, cache: "no-store" });
        const text = await rr.text();
        results.push({ url, status: rr.status, len: text.length, snippets: snippets(text, ["api", "cardap", "itens", "item", "empresa", "loja", "slug", "axios", "graphql", "estabelecimento"]).slice(0, 80) });
      } catch (e) {
        results.push({ url, error: String(e) });
      }
    }
    return NextResponse.json({ scripts, results });
  }
  return NextResponse.json({ status: r.status, finalUrl: r.url, len: html.length, scripts, html: html.slice(0, 100000) });
}
