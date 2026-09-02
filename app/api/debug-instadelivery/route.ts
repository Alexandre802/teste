import { NextRequest, NextResponse } from "next/server";

const ORIGIN = "https://instadelivery.com.br";
const STORE_PATH = "/comidacaseiradamarciacosta";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const asset = request.nextUrl.searchParams.get("asset");
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
      accept: "text/html,application/xhtml+xml,application/javascript,*/*;q=0.8",
    },
  });

  const body = await response.text();
  const scripts = [...body.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  const links = [...body.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map((m) => m[1]);

  return NextResponse.json({
    target,
    status: response.status,
    contentType: response.headers.get("content-type"),
    scripts,
    links,
    body,
  });
}
