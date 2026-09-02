import { NextRequest, NextResponse } from "next/server";

const ORIGIN = "https://instadelivery.com.br";
const STORE_PATH = "/comidacaseiradamarciacosta";

export const dynamic = "force-dynamic";

function snippets(body: string, terms: string[]) {
  const lower = body.toLowerCase();
  const out: Array<{ term: string; at: number; text: string }> = [];
  for (const raw of terms) {
    const term = raw.toLowerCase();
    let from = 0;
    let count = 0;
    while (count < 30) {
      const at = lower.indexOf(term, from);
      if (at < 0) break;
      out.push({
        term: raw,
        at,
        text: body.slice(Math.max(0, at - 350), Math.min(body.length, at + term.length + 650)),
      });
      from = at + term.length;
      count += 1;
    }
  }
  return out;
}

export async function GET(request: NextRequest) {
  const asset = request.nextUrl.searchParams.get("asset");
  const q = request.nextUrl.searchParams.get("q");
  let target = ORIGIN + STORE_PATH;

  if (asset) {
    if (!asset.startsWith("/") || asset.includes("..")) {
      return NextResponse.json({ error: "asset invalido" }, { status: 400 });
    }
    target = ORIGIN + asset;
  }

  const response = await fetch(target, {
    cache: "no-store",
    headers: {
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
      accept: "text/html,application/xhtml+xml,application/javascript,application/json,*/*;q=0.8",
    },
  });

  const body = await response.text();
  const scripts = [...body.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  const links = [...body.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map((m) => m[1]);

  if (q) {
    const terms = q.split(",").map((v) => v.trim()).filter(Boolean).slice(0, 20);
    const urlMatches = [...new Set([
      ...body.matchAll(/https?:\\?\/\\?\/[^"'`\\s)]+/gi),
      ...body.matchAll(/\/(?:api|v1|v2|store|stores|menu|cardapio|catalog|products|categories)[A-Za-z0-9_?&=./{}:\\-]*/gi),
    ].map((m) => m[0]).filter((v) => v.length < 500))].slice(0, 300);

    return NextResponse.json({
      target,
      status: response.status,
      contentType: response.headers.get("content-type"),
      bodyLength: body.length,
      urlMatches,
      snippets: snippets(body, terms),
    });
  }

  return NextResponse.json({
    target,
    status: response.status,
    contentType: response.headers.get("content-type"),
    scripts,
    links,
    body,
  });
}
