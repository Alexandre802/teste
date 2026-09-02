import { NextRequest, NextResponse } from "next/server";

const ORIGIN = "https://instadelivery.com.br";
const STORE_PATH = "/comidacaseiradamarciacosta";
const STORE_API = "https://app.instadelivery.com.br/api/stores/by-slug/comidacaseiradamarciacosta";

export const dynamic = "force-dynamic";

const headers = {
  "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
  accept: "application/json,text/html,application/xhtml+xml,application/javascript,*/*;q=0.8",
};

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
      out.push({ term: raw, at, text: body.slice(Math.max(0, at - 350), Math.min(body.length, at + term.length + 650)) });
      from = at + term.length;
      count += 1;
    }
  }
  return out;
}

function apiStrings(body: string) {
  const patterns = [
    /["'`](https?:\\?\/\\?\/[^"'`\\s]{1,400})["'`]/gi,
    /["'`](\/(?:api|v1|v2)\/[A-Za-z0-9_?&=./{}:\\-]{1,300})["'`]/gi,
  ];
  const found = new Set<string>();
  for (const pattern of patterns) {
    for (const match of body.matchAll(pattern)) {
      const value = (match[1] || "").replace(/\\\//g, "/");
      if (/api|store|menu|group|item|catalog|product/i.test(value)) found.add(value);
    }
  }
  return [...found].slice(0, 500);
}

export async function GET(request: NextRequest) {
  const asset = request.nextUrl.searchParams.get("asset");
  const q = request.nextUrl.searchParams.get("q");
  const api = request.nextUrl.searchParams.get("api");

  if (api === "discover") {
    const shellRes = await fetch(ORIGIN + STORE_PATH, { cache: "no-store", headers });
    const html = await shellRes.text();
    const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
    const results: Array<{ src:string; status:number; length:number; apiStrings:string[]; snippets:any[] }> = [];
    for (const src of scriptSrcs.slice(0, 30)) {
      const url = new URL(src, ORIGIN).toString();
      try {
        const r = await fetch(url, { cache:"no-store", headers });
        const text = await r.text();
        results.push({
          src:url,
          status:r.status,
          length:text.length,
          apiStrings:apiStrings(text),
          snippets:snippets(text,["by-slug","menu_group","menu-group","groups","itens","items","store_id","is_invisible","always_display"]).slice(0,80)
        });
      } catch {
        results.push({ src:url, status:0, length:0, apiStrings:[], snippets:[] });
      }
    }
    return NextResponse.json({ shellStatus:shellRes.status, scriptSrcs, results });
  }

  let target = api === "store" || api === "summary" ? STORE_API : ORIGIN + STORE_PATH;

  if (asset) {
    if (!asset.startsWith("/") || asset.includes("..")) return NextResponse.json({ error: "asset invalido" }, { status: 400 });
    target = ORIGIN + asset;
  }

  const response = await fetch(target, { cache: "no-store", headers });
  const body = await response.text();
  if (api === "store" || api === "summary") {
    try {
      const data = JSON.parse(body);
      if (api === "summary") {
        const groups = (data.groups || []).filter((g: any) => !g.deleted_at && !g.is_invisible).map((g: any) => ({
          id: g.id, name: g.name, order: g.order, image: g.image, start_time: g.start_time, end_time: g.end_time,
          items: (g.itens || []).filter((i: any) => !i.deleted_at && !i.is_invisible).map((i: any) => ({
            id: i.id, name: i.name, description: i.description, price1: i.price1, price2: i.price2, from_price: i.from_price,
            strike_price: i.strike_price, image: i.image, order: i.order, start_time: i.start_time, end_time: i.end_time,
            days: { sun:i.sun, mon:i.mon, tue:i.tue, wed:i.wed, thu:i.thu, fri:i.fri, sat:i.sat },
            complementos: (i.complementos || []).filter((c:any)=>!c.deleted_at).map((c:any)=>({
              name:c.name, description:c.description, min:c.min, max:c.max, order:c.order,
              choices:(c.complements||[]).filter((x:any)=>!x.deleted_at && !x.is_invisible).map((x:any)=>({name:x.name, price:x.price, order:x.order, image:x.image}))
            }))
          }))
        }));
        return NextResponse.json({
          fetched_at: new Date().toISOString(),
          store: { id:data.id, name:data.name, phone:data.phone, whatsapp:data.whatsapp, pix:data.pix, pix_type:data.pix_type, pix_infos:data.pix_infos, address:data.address, city:data.city, state:data.state, wait_time:data.wait_time, take_out:data.take_out, minimum_order:data.minimum_order, payment_methods:data.payment_methods, times:data.times, design:data.design },
          fee_count:(data.fees||[]).length, fees:data.fees||[], group_count:groups.length,
          item_count:groups.reduce((n:number,g:any)=>n+g.items.length,0), groups
        });
      }
      return NextResponse.json({ target, status: response.status, data });
    } catch {
      return NextResponse.json({ target, status: response.status, body }, { status: response.ok ? 200 : response.status });
    }
  }

  const scripts = [...body.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  const links = [...body.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map((m) => m[1]);

  if (q) {
    const terms = q.split(",").map((v) => v.trim()).filter(Boolean).slice(0, 20);
    return NextResponse.json({ target, status: response.status, contentType: response.headers.get("content-type"), bodyLength: body.length, urlMatches:apiStrings(body), snippets: snippets(body, terms) });
  }

  return NextResponse.json({ target, status: response.status, contentType: response.headers.get("content-type"), scripts, links, body });
}
