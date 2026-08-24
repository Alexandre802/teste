#!/usr/bin/env python3
"""
Gera `preview.html`: uma versão estática, de arquivo único, do site — para
enviar como link de demonstração sem precisar hospedar nada.

    python3 scripts/build-preview.py

O que ele faz:
  1. exporta produtos, categorias e dados da casa de lib/ (via npx tsx);
  2. embute as fotos de public/produtos como data URI, porque a página
     precisa se sustentar sozinha;
  3. escreve preview.html reaproveitando os mesmos tokens de app/globals.css.

O preview NÃO tem servidor: pagamento, webhooks do WhatsApp e o mapa embutido
só funcionam no site publicado. O pedido pelo WhatsApp e a sacola funcionam.
"""
import base64, json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

def carregar_dados() -> dict:
    """Lê o catálogo direto de lib/, para o preview nunca divergir do site."""
    script = (
        "import { products, categories } from './lib/catalog';"
        "import { business, reviews, differentials, aboutText } from './lib/business';"
        "import { searchSections } from './lib/seo';"
        "console.log(JSON.stringify({ products, categories, business, reviews,"
        " differentials, aboutText, searchSections }));"
    )
    out = subprocess.run(
        ["npx", "--yes", "tsx@latest", "-e", script],
        cwd=ROOT, capture_output=True, text=True,
    )
    if out.returncode != 0:
        sys.exit(f"falha ao exportar os dados de lib/:\n{out.stderr}")
    return json.loads(out.stdout)


def camadas_lanche() -> list[dict]:
    """As 8 fatias da foto de referência, já como data URI."""
    META = [
        ("1-pao-superior", "Pão superior", 0, 186, 0),
        ("2-tomate", "Tomate", 186, 156, -36),
        ("3-alface", "Alface", 342, 134, -130),
        ("4-queijo-cima", "Queijo", 476, 144, -194),
        ("5-carne-cima", "Carne", 620, 150, -260),
        ("6-queijo-baixo", "Queijo", 770, 114, -305),
        ("7-carne-baixo", "Carne", 884, 164, -359),
        ("8-pao-inferior", "Pão inferior", 1048, 136, -418),
    ]
    out = []
    for slug, alt, top, h, shift in META:
        b = (ROOT / "public" / "lanche" / f"{slug}.webp").read_bytes()
        out.append({
            "src": "data:image/webp;base64," + base64.b64encode(b).decode(),
            "alt": alt, "top": top, "h": h, "shift": shift,
        })
    return out


def embutir_fotos(dados: dict) -> None:
    """Converte /produtos/x.webp em data URI — a página tem de ser autônoma."""
    fotos = {
        f"/produtos/{f.name}": "data:image/webp;base64," + base64.b64encode(f.read_bytes()).decode()
        for f in sorted((ROOT / "public" / "produtos").glob("*.webp"))
    }
    for p in dados["products"]:
        if p["image"]:
            p["image"] = fotos.get(p["image"])
    print(f"fotos embutidas: {len(fotos)}")


d = carregar_dados()
embutir_fotos(d)
LANCHE = camadas_lanche()
B = d["business"]
SRC_W, SRC_H = 941, 1204

DATA = json.dumps({
    "products": d["products"],
    "categories": d["categories"],
    "whatsapp": B["whatsapp"],
    "name": B["name"],
}, ensure_ascii=False)

BURGER = "".join(
    f'<img class="layer" src="{c["src"]}" alt="" data-shift="{c["shift"]}" '
    f'style="top:{c["top"]/SRC_H*100:.4f}%;height:{c["h"]/SRC_H*100:.4f}%">'
    for c in LANCHE
)

labels_html = "".join(
    f'<span class="ing" data-shift="{c["shift"]}" '
    f'style="top:{(c["top"]+c["h"]/2)/SRC_H*100:.4f}%">{c["alt"]}</span>'
    for c in LANCHE
)

MARK = '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M8 20c0-7.7 7.2-13 16-13s16 5.3 16 13" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="15" r="1.8" fill="currentColor"/><circle cx="27" cy="13" r="1.8" fill="currentColor"/><circle cx="33" cy="17" r="1.8" fill="currentColor"/><path d="M7 24h34M9 30h30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 35h32c0 3.9-3.1 6-7 6H15c-3.9 0-7-2.1-7-6z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>'
WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.24 8.24 0 0 1 8.24 8.24c0 4.54-3.7 8.23-8.24 8.23z"/></svg>'

reviews_html = "".join(
    f'<li class="card rev"><span class="stars">★★★★★</span><blockquote>“{r["text"]}”</blockquote><p class="src">Avaliação no Google</p></li>'
    for r in d["reviews"])

diffs_html = "".join(
    f'<li class="card diff"><span class="ico">{MARK}</span><div><h3>{x["title"]}</h3><p>{x["text"]}</p></div></li>'
    for x in d["differentials"])

serv_html = "".join(f'<li>{s}</li>' for s in B["services"])

busca_html = "".join(
    '<div class="bcol"><h3>' + s["title"] + '</h3><ul>' +
    "".join(f'<li><a href="#cardapio">{t}</a></li>' for t in s["terms"]) + '</ul></div>'
    for s in d["searchSections"])

maps = "https://www.google.com/maps/dir/?api=1&destination=" + B["mapsQuery"].replace(" ", "%20").replace(",", "%2C")

HTML = f'''<title>Michel Food House</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap">

<style>
/* Tokens iguais aos de app/globals.css — este preview reproduz o sistema
   visual do site, não inventa outro. Compromisso deliberado com um único
   tema (laranja sobre marrom quase preto), então tudo é pintado explicitamente. */
:root{{
  --flare:#ff8a2b; --flame:#f2620c; --ember:#d8490a; --ember-deep:#a8380a;
  --gold:#ffd28a; --cream:#fff; --muted:#ffe4cf; --cocoa:#5a2005;
  --radius:1.25rem;
  --sans:'Plus Jakarta Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{
  color:var(--cream); font-family:var(--sans); -webkit-font-smoothing:antialiased;
  overflow-x:hidden; background-color:var(--flame); background-attachment:fixed;
  background-image:
    radial-gradient(120% 70% at 78% 0%,#ff9a3f 0%,transparent 55%),
    radial-gradient(90% 60% at 5% 40%,#ff7a18 0%,transparent 60%),
    linear-gradient(180deg,#ff7a18 0%,#f2620c 38%,#e2530b 70%,#d0450a 100%);
}}
img,svg{{display:block;max-width:100%}}
a{{color:inherit;text-decoration:none}}
button{{font:inherit;color:inherit;background:none;border:0;cursor:pointer}}
:where(a,button,input,textarea):focus-visible{{outline:2px solid var(--gold);outline-offset:3px;border-radius:.5rem}}
.wrap{{max-width:86rem;margin-inline:auto;padding-inline:1.25rem}}
@media(min-width:640px){{.wrap{{padding-inline:2rem}}}}
.card{{
  background:linear-gradient(165deg,rgb(255 255 255/.24) 0%,rgb(150 48 8/.46) 100%);
  backdrop-filter:blur(16px) saturate(1.15); -webkit-backdrop-filter:blur(16px) saturate(1.15);
  border:1px solid rgb(255 255 255/.28); border-radius:var(--radius);
  box-shadow:0 14px 34px -16px rgb(120 45 5/.55), inset 0 1px 0 0 rgb(255 255 255/.3);
}}
.eyebrow{{font-size:.72rem;font-weight:800;letter-spacing:.35em;text-transform:uppercase;color:rgb(255 255 255/.75)}}
h2.big{{font-size:clamp(2rem,5.5vw,3.5rem);font-weight:800;line-height:1;letter-spacing:-.02em;text-wrap:balance;margin-top:.75rem}}
section{{padding-block:clamp(3.5rem,8vw,7rem)}}

/* ── header ── */
header{{position:fixed;inset:0 0 auto;z-index:50;transition:padding .3s,background .3s,border-color .3s;padding-block:1.25rem;border-bottom:1px solid transparent}}
header.on{{padding-block:.6rem;background:rgb(216 73 10/.78);backdrop-filter:blur(18px);border-bottom-color:rgb(255 255 255/.25)}}
header .bar{{display:flex;align-items:center;justify-content:space-between;gap:1.5rem}}
.brand{{display:flex;align-items:center;gap:.75rem;font-weight:800;font-size:1.05rem}}
.brand svg{{width:2rem;height:2rem;color:#fff}}
nav.main{{display:none;gap:2rem}}
@media(min-width:1024px){{nav.main{{display:flex}}}}
nav.main a{{font-size:.875rem;font-weight:700;color:rgb(255 255 255/.85);padding-block:.25rem;border-bottom:2px solid transparent}}
nav.main a:hover{{color:#fff}}
.peca{{border:1px solid rgb(255 247 240/.4);border-radius:999px;padding:.6rem 1.25rem;font-size:.875rem;font-weight:700;transition:transform .2s,border-color .2s,color .2s}}
.peca:hover{{transform:translateY(-2px);background:#fff;color:var(--ember)}}

/* ── hero ── */
#inicio{{height:178svh;padding:0;position:relative}}
@media(min-width:1024px){{#inicio{{height:205svh}}}}
.sticky{{position:sticky;top:0;height:100svh;overflow:hidden}}
.heroBg{{position:absolute;inset:0;background:radial-gradient(120% 100% at 72% 18%,#FF8A2B 0%,#F2620C 42%,#E2530B 100%)}}
.heroFade{{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 70%,rgb(208 69 10/.35) 100%)}}
.heroGrid{{position:relative;height:100%;display:grid;align-items:center;gap:1rem;padding-top:6rem;padding-bottom:2rem}}
.heroTxt{{order:2}} .heroImg{{order:1;display:flex;align-items:center;justify-content:center;min-height:0}}
@media(min-width:1024px){{.heroTxt{{order:1}} .heroImg{{order:2}}}}
@media(min-width:1024px){{.heroGrid{{grid-template-columns:1.05fr 1fr;padding-top:5rem;padding-bottom:0}}}}
h1{{font-size:clamp(2.6rem,9vw,6.5rem);font-weight:800;line-height:.9;letter-spacing:-.035em;color:#fff;text-shadow:0 4px 24px rgb(120 40 0/.45)}}
.rule{{display:flex;align-items:center;gap:1rem;max-width:36rem;margin-block:1.25rem}}
.rule span{{flex:1;height:1px;background:rgb(255 255 255/.45)}}
.rule svg{{width:1.75rem;height:1.75rem;color:#fff;flex:none}}
.slogan{{max-width:36rem;font-size:clamp(1rem,2.3vw,1.4rem);line-height:1.3;color:rgb(255 255 255/.95)}}
.ctas{{display:flex;flex-direction:column;gap:.75rem;margin-top:1.75rem}}
@media(min-width:640px){{.ctas{{flex-direction:row;flex-wrap:wrap}}}}
.cta{{display:inline-flex;align-items:center;justify-content:center;gap:.75rem;border-radius:999px;padding:1rem 1.75rem;font-weight:800;font-size:1rem;transition:transform .2s}}
.cta:hover{{transform:translateY(-2px)}}
.cta.solid{{background:#fff;color:var(--cocoa);box-shadow:0 16px 44px -14px rgb(60 20 0/.85)}}
.cta.solid .dot{{display:grid;place-items:center;width:2.25rem;height:2.25rem;border-radius:999px;background:var(--flame);color:#fff}}
.cta.solid .dot svg{{width:1.1rem;height:1.1rem}}
.cta.outline{{border:2px solid rgb(255 255 255/.7);color:#fff}}
.cta.outline:hover{{background:#fff;color:var(--cocoa)}}
.cta svg{{width:1.5rem;height:1.5rem}}
.meta{{display:flex;flex-wrap:wrap;gap:.4rem .75rem;margin-top:1.5rem;font-size:.875rem;color:rgb(255 255 255/.85)}}
.meta b{{color:#fff;font-weight:800}}
.burgerBox{{position:relative;width:100%;max-width:13.5rem;margin-inline:auto;aspect-ratio:941/1204}}
@media(min-width:640px){{.burgerBox{{max-width:20rem}}}}
@media(min-width:1024px){{.burgerBox{{max-width:32rem}}}}

.layer{{position:absolute;left:0;width:100%;object-fit:contain;will-change:transform}}
.ing{{position:absolute;right:0;transform:translateY(-50%);background:rgb(255 255 255/.92);border-radius:999px;padding:.2rem .6rem;font-size:.68rem;font-weight:800;color:var(--ember);opacity:0;pointer-events:none;white-space:nowrap;box-shadow:0 6px 16px -6px rgb(110 40 5/.6)}}
@media(max-width:767px){{.ing{{display:none}}}}
.scrollCue{{position:absolute;inset:auto 0 1.25rem;margin-inline:auto;width:fit-content;display:none;flex-direction:column;align-items:center;gap:.4rem;color:rgb(255 255 255/.7)}}
@media(min-width:1024px){{.scrollCue{{display:flex}}}}
.mouse{{width:1.5rem;height:2.5rem;border:1px solid currentColor;border-radius:999px;display:grid;justify-items:center;padding-top:.5rem}}
.mouse i{{width:.25rem;height:.5rem;border-radius:999px;background:currentColor;animation:bob 2.2s ease-in-out infinite}}
@keyframes bob{{0%,100%{{transform:translateY(0)}}50%{{transform:translateY(6px)}}}}
.scrollCue small{{font-size:.65rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase}}

/* ── cardápio ── */
.tabs{{display:flex;gap:.5rem;overflow-x:auto;scrollbar-width:none;margin-inline:-1.25rem;padding-inline:1.25rem;scroll-snap-type:x mandatory}}
.tabs::-webkit-scrollbar{{display:none}}
@media(min-width:640px){{.tabs{{flex-wrap:wrap;justify-content:center;margin-inline:0;padding-inline:0}}}}
.tab{{flex:none;scroll-snap-align:start;border-radius:999px;padding:.6rem 1.25rem;font-size:.875rem;font-weight:700;color:rgb(255 255 255/.85);transition:color .2s}}
.tab:hover{{color:#fff}}
.tab[aria-selected=true]{{color:var(--ember);background:#fff;box-shadow:0 8px 22px -8px rgb(110 40 5/.7)}}
.grupos{{display:flex;flex-direction:column;gap:2.5rem;margin-top:2.25rem}}
.grupoTit{{display:flex;align-items:center;gap:.75rem;margin-bottom:1rem}}
.grupoTit h3{{font-size:1.15rem;font-weight:800}}
.grupoTit .hr{{flex:1;height:1px;background:rgb(255 255 255/.3)}}
.grupoTit small{{font-size:.72rem;font-weight:700;color:rgb(255 255 255/.75)}}
.grid{{display:grid;gap:.75rem;grid-template-columns:repeat(2,1fr)}}
@media(min-width:640px){{.grid{{grid-template-columns:repeat(3,1fr)}}}}
@media(min-width:1024px){{.grid{{grid-template-columns:repeat(4,1fr)}}}}
@media(min-width:1280px){{.grid{{grid-template-columns:repeat(5,1fr)}}}}
.prod{{display:flex;flex-direction:column;overflow:hidden;transition:transform .3s,box-shadow .3s,border-color .3s}}
.prod:hover{{transform:translateY(-6px);border-color:rgb(255 106 0/.45);box-shadow:0 28px 60px -24px rgb(0 0 0/.95),0 0 44px -14px rgb(255 106 0/.6)}}
.shot{{position:relative;aspect-ratio:5/3;overflow:hidden;width:100%}}
.shot img{{width:100%;height:100%;object-fit:cover;transition:transform .5s}}
.prod:hover .shot img{{transform:scale(1.05)}}
.ph{{width:100%;height:100%;display:grid;place-items:center;gap:.35rem;background:rgb(255 255 255/.12);color:#fff;opacity:.75}}
.ph svg{{width:2rem;height:2rem}}
.ph span{{font-size:.6rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase}}
.eso{{position:absolute;inset:0;display:grid;place-items:center;background:rgb(168 56 10/.7);color:#fff;font-weight:800;font-size:.8rem;letter-spacing:.18em;text-transform:uppercase}}
.body{{display:flex;flex-direction:column;gap:.25rem;padding:.75rem;flex:1}}
.body h3{{font-size:.9rem;font-weight:800;line-height:1.2}}
.price{{font-size:1.05rem;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}}
.price sup{{font-size:.68rem;vertical-align:baseline;margin-right:.12rem;opacity:.85}}
.desc{{font-size:.72rem;line-height:1.4;color:rgb(255 255 255/.8);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}}
.add{{margin-top:auto;width:100%;border-radius:999px;padding:.5rem .75rem;font-size:.72rem;font-weight:800;color:var(--ember);background:#fff;transition:background .2s}}
.add:hover:not(:disabled){{background:rgb(255 255 255/.9)}}
.add:disabled{{cursor:not-allowed;background:rgb(255 255 255/.2);color:rgb(255 255 255/.55);box-shadow:none}}

/* ── seções ── */
.two{{display:grid;gap:3rem;align-items:start}}
@media(min-width:1024px){{.two{{grid-template-columns:1fr 1.1fr}}}}
.lead{{font-size:1.1rem;line-height:1.7;color:rgb(255 247 240/.85)}}
.diffs{{display:flex;flex-direction:column;gap:1rem;margin-top:2.25rem;list-style:none}}
.diff{{display:flex;gap:1rem;padding:1.25rem}}
.diff .ico{{display:grid;place-items:center;width:2.75rem;height:2.75rem;flex:none;border-radius:1rem;background:rgb(255 255 255/.2);color:#fff}}
.diff .ico svg{{width:1.5rem;height:1.5rem}}
.diff h3{{font-weight:800}}
.diff p{{margin-top:.25rem;font-size:.875rem;line-height:1.6;color:var(--muted)}}
.ratingBox{{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.5rem 1rem;padding:1rem 1.75rem;border-radius:999px;margin-top:1.75rem}}
.ratingBox b{{font-size:2.25rem;font-weight:800;color:#fff;line-height:1}}
.revs{{display:grid;gap:1.25rem;margin-top:2.75rem;list-style:none}}
@media(min-width:640px){{.revs{{grid-template-columns:repeat(2,1fr)}}}}
@media(min-width:1024px){{.revs{{grid-template-columns:repeat(3,1fr)}}}}
.rev{{display:flex;flex-direction:column;gap:1rem;padding:1.5rem}}
.stars{{color:#fff;letter-spacing:.1em}}
.rev blockquote{{font-size:.95rem;line-height:1.65;color:rgb(255 247 240/.9)}}
.src{{margin-top:auto;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}}
.contato{{display:grid;gap:1.5rem;margin-top:2.5rem}}
@media(min-width:1024px){{.contato{{grid-template-columns:1fr 1fr}}}}
.contato .card{{padding:1.75rem;display:flex;flex-direction:column;gap:1.5rem}}
.contato h3{{font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#fff}}
.contato address{{font-style:normal;line-height:1.7;color:rgb(255 247 240/.9);margin-top:.4rem}}
.contato .tel{{display:block;margin-top:.4rem;font-size:1.15rem;font-weight:700}}
.servs{{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.75rem;list-style:none}}
.servs li{{border-radius:999px;padding:.5rem 1rem;font-size:.85rem;font-weight:600;background:rgb(255 255 255/.18);color:#fff;box-shadow:inset 0 0 0 1px rgb(255 255 255/.3)}}
.gal{{display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem;margin-top:2.25rem}}
@media(min-width:640px){{.gal{{grid-template-columns:repeat(4,1fr)}}}}
.gal img{{width:100%;aspect-ratio:1;object-fit:cover;border-radius:1.25rem;box-shadow:0 0 0 1px rgb(255 255 255/.3);transition:transform .5s}}
.gal img:hover{{transform:scale(1.04)}}
.busca{{display:grid;gap:2rem;margin-top:2.5rem}}
@media(min-width:640px){{.busca{{grid-template-columns:repeat(2,1fr)}}}}
@media(min-width:1024px){{.busca{{grid-template-columns:repeat(3,1fr)}}}}
.bcol h3{{font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#fff}}
.bcol ul{{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.75rem;list-style:none}}
.bcol a{{display:inline-block;border-radius:999px;padding:.35rem .7rem;font-size:.72rem;color:rgb(255 255 255/.9);background:rgb(255 255 255/.14);box-shadow:inset 0 0 0 1px rgb(255 255 255/.25)}}
.bcol a:hover{{background:#fff;color:var(--ember)}}
footer{{border-top:1px solid rgb(255 255 255/.25);background:rgb(168 56 10/.4);padding-block:4rem 2rem}}
.fgrid{{display:grid;gap:2.5rem}}
@media(min-width:640px){{.fgrid{{grid-template-columns:repeat(2,1fr)}}}}
@media(min-width:1024px){{.fgrid{{grid-template-columns:2fr 1fr 1fr}}}}
footer h3{{font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#fff;margin-bottom:.75rem}}
footer p,footer address,footer li{{color:var(--muted);line-height:1.7;font-style:normal}}
footer ul{{list-style:none;display:flex;flex-direction:column;gap:.5rem}}
footer a:hover{{color:#fff}}
.fbot{{margin-top:3rem;padding-top:1.5rem;border-top:1px solid rgb(255 106 0/.15);font-size:.75rem;color:var(--muted);display:flex;flex-direction:column;gap:.5rem}}
@media(min-width:640px){{.fbot{{flex-direction:row;justify-content:space-between}}}}

/* ── sacola ── */
.fab{{position:fixed;inset:auto 0 0;z-index:40;padding:1rem;padding-bottom:max(1rem,env(safe-area-inset-bottom));transform:translateY(120%);transition:transform .35s cubic-bezier(.22,1,.36,1)}}
.fab.on{{transform:none}}
@media(min-width:640px){{.fab{{inset:auto 1.5rem 1.5rem auto;padding:0}}}}
.fabBtn{{display:flex;width:100%;align-items:center;justify-content:center;gap:.75rem;border-radius:999px;padding:1rem 1.75rem;font-weight:800;
  background:#fff;color:var(--cocoa);box-shadow:0 18px 46px -12px rgb(110 40 5/.75)}}
@media(min-width:640px){{.fabBtn{{width:auto}}}}
.fabBtn svg{{width:1.25rem;height:1.25rem;color:var(--flame)}}
dialog{{border:0;padding:0;background:transparent;max-width:100%;max-height:100%;color:var(--cream)}}
dialog::backdrop{{background:rgb(168 56 10/.72);backdrop-filter:blur(4px)}}
.panel{{width:100vw;max-height:92dvh;display:flex;flex-direction:column;border-radius:2rem 2rem 0 0;
  background:linear-gradient(170deg,#ff8a2b 0%,#ef5c0a 55%,#d8490a 100%);
  border:1px solid rgb(255 255 255/.32);position:fixed;inset:auto 0 0}}
@media(min-width:640px){{.panel{{position:static;width:min(38rem,92vw);border-radius:2rem;margin:auto}}}}
.panel header{{position:static;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.25rem 1.5rem;border-bottom:1px solid rgb(255 255 255/.25)}}
.panel header h2{{font-size:1.1rem;font-weight:800}}
.panel .content{{flex:1;min-height:0;overflow-y:auto;padding:1.25rem 1.5rem}}
.panel footer{{padding:1.25rem 1.5rem;border-top:1px solid rgb(255 255 255/.25);background:none;border-left:0;border-right:0;border-bottom:0}}
.x{{border-radius:999px;padding:.5rem;color:rgb(255 255 255/.85)}}
.x:hover{{background:rgb(255 255 255/.2);color:#fff}}
.x svg{{width:1.25rem;height:1.25rem}}
.line{{display:flex;gap:1rem;padding-bottom:1rem;border-bottom:1px solid rgb(255 255 255/.22)}}
.line:last-child{{border:0}}
.line .thumb{{width:5rem;height:5rem;flex:none;border-radius:1rem;overflow:hidden}}
.line .thumb img{{width:100%;height:100%;object-fit:cover}}
.qty{{display:inline-flex;align-items:center;gap:.25rem;border-radius:999px;padding:.25rem;background:rgb(255 255 255/.16);box-shadow:inset 0 0 0 1px rgb(255 106 0/.25);margin-top:.5rem}}
.qty button{{width:2rem;height:2rem;border-radius:999px;font-weight:700;color:#fff}}
.qty button:hover{{background:rgb(255 106 0/.2)}}
.qty span{{width:1.75rem;text-align:center;font-weight:800;font-variant-numeric:tabular-nums;color:#fff}}
.rm{{font-size:.75rem;font-weight:700;color:rgb(255 255 255/.85);text-decoration:underline;text-underline-offset:2px}}
.rm:hover{{color:#fff}}
.tot{{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:.75rem}}
.tot span{{font-size:.85rem;font-weight:700;color:rgb(255 255 255/.85)}}
.tot b{{font-size:1.5rem;font-weight:800;color:#fff}}
.go{{display:flex;width:100%;align-items:center;justify-content:center;gap:.6rem;border-radius:999px;background:#fff;color:var(--ember);padding:1rem;font-weight:800;transition:transform .2s}}
.go:hover{{transform:translateY(-2px)}}
.go svg{{width:1.25rem;height:1.25rem}}
.empty{{text-align:center;padding-block:4rem;color:rgb(255 255 255/.85)}}
.note{{width:100%;margin-top:.5rem;border-radius:.75rem;padding:.5rem .75rem;font-size:.75rem;color:#fff;background:rgb(255 255 255/.16);border:1px solid rgb(255 255 255/.3)}}
.note::placeholder{{color:rgb(255 255 255/.6)}}
.aviso{{margin-top:1rem;border-radius:1rem;border:1px solid rgb(255 255 255/.45);background:rgb(255 255 255/.16);padding:1rem;font-size:.8rem;line-height:1.6;color:rgb(255 247 240/.9)}}

/* faixa de preview */
.pv{{position:fixed;inset:auto 0 0;z-index:60;background:var(--gold);color:var(--cocoa);font-size:.75rem;font-weight:700;text-align:center;padding:.5rem 1rem;display:none}}
@media(prefers-reduced-motion:reduce){{*,*::before,*::after{{animation-duration:.001ms!important;transition-duration:.001ms!important}}}}
</style>

<header id="hdr">
  <div class="wrap bar">
    <a href="#inicio" class="brand">{MARK}<span>{B["name"]}</span></a>
    <nav class="main">
      <a href="#inicio">Início</a><a href="#cardapio">Cardápio</a><a href="#sobre">Sobre nós</a><a href="#promocoes">Promoções</a><a href="#contato">Contato</a>
    </nav>
    <a class="peca" href="#cardapio">Peça agora</a>
  </div>
</header>

<main>
  <section id="inicio">
    <div class="sticky">
      <div class="heroBg"></div><div class="heroFade"></div>
      <div class="wrap heroGrid">
        <div class="heroTxt">
          <h1>Michel<br>Food House</h1>
          <div class="rule"><span></span>{MARK}<span></span></div>
          <p class="slogan">O sabor que impressiona na <strong>primeira mordida</strong>.</p>
          <div class="ctas">
            <a class="cta solid" href="#cardapio"><span class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 3v7a3 3 0 0 0 3 3v8M7 3v6M10 3v6M17 3c-1.7 1.5-2.5 3.6-2.5 6 0 1.7.8 2.8 2.5 3v9"/></svg></span>Coma aqui</a>
            <a class="cta outline" href="https://wa.me/{B["whatsapp"]}?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Michel%20Food%20House%20e%20gostaria%20de%20fazer%20um%20pedido." target="_blank" rel="noopener">{WA}WhatsApp</a>
          </div>
          <p class="meta"><b>★ 4,8</b><span>46 avaliações no Google</span><span aria-hidden="true">·</span><span>Abre às 19:00</span></p>
        </div>
        <div class="heroImg">
          <div class="burgerBox" id="burger" role="img" aria-label="Ilustração de um lanche da Michel Food House que se separa em pão, tomate, alface, queijo e carne conforme a página rola">
            {BURGER}{labels_html}
          </div>
        </div>
      </div>
      <a class="scrollCue" href="#cardapio" aria-label="Rolar para o cardápio"><span class="mouse"><i></i></span><small>role</small></a>
    </div>
  </section>

  <section id="cardapio">
    <div class="wrap">
      <div style="text-align:center">
        <p class="eyebrow">Produtos</p>
        <h2 class="big">Nossos Lanches</h2>
        <p style="margin:1rem auto 0;max-width:32rem;color:var(--muted)">Escolha seu favorito e peça do seu jeito.</p>
      </div>
      <div class="tabs" role="tablist" aria-label="Categorias do cardápio" id="tabs" style="margin-top:2.5rem"></div>
      <p id="blurb" style="text-align:center;margin-top:1.25rem;font-size:.875rem;color:var(--muted)" aria-live="polite"></p>
      <div id="grid" class="grupos"></div>
    </div>
  </section>

  <section id="sobre">
    <div class="wrap two">
      <div>
        <p class="eyebrow">Sobre nós</p>
        <h2 class="big">Uma lanchonete<br>de bairro, feita<br><span style="background:linear-gradient(100deg,var(--gold),var(--flame) 45%,var(--ember));-webkit-background-clip:text;background-clip:text;color:transparent">para voltar.</span></h2>
      </div>
      <div>
        <p class="lead">{d["aboutText"]}</p>
        <ul class="diffs">{diffs_html}</ul>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap" style="text-align:center">
      <p class="eyebrow">Avaliações</p>
      <h2 class="big">Quem prova, recomenda</h2>
      <div class="card ratingBox"><b>4,8</b><span style="color:var(--muted);font-size:.875rem">/ 5</span><span class="stars">★★★★★</span><span style="color:var(--muted);font-size:.875rem">46 avaliações no Google</span></div>
      <ul class="revs" style="text-align:left">{reviews_html}</ul>
    </div>
  </section>

  <section>
    <div class="wrap">
      <p class="eyebrow">Galeria</p>
      <h2 class="big">Direto da chapa</h2>
      <div class="gal" id="gal"></div>
    </div>
  </section>

  <section id="promocoes">
    <div class="wrap">
      <p class="eyebrow">Promoções</p>
      <h2 class="big">O que está rolando</h2>
      <div class="card" style="margin-top:2rem;padding:2rem;display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:space-between">
        <p class="lead" style="max-width:36rem">Fique de olho nas novidades da {B["name"]}. Quando tiver promoção, ela aparece aqui primeiro.</p>
        <a class="cta outline" style="border-color:rgb(255 247 240/.4);color:var(--cream)" href="https://wa.me/{B["whatsapp"]}?text=Ol%C3%A1!%20Quero%20ficar%20sabendo%20das%20promo%C3%A7%C3%B5es." target="_blank" rel="noopener">{WA}Me avisa no WhatsApp</a>
      </div>
    </div>
  </section>

  <section id="contato">
    <div class="wrap">
      <p class="eyebrow">Contato</p>
      <h2 class="big">Vem pra Michel</h2>
      <div class="contato">
        <div class="card">
          <div><h3>Endereço</h3><address>{B["address"]["street"]}<br>{B["address"]["district"]}<br>{B["address"]["city"]} - {B["address"]["state"]}, {B["address"]["postalCode"]}</address></div>
          <div><h3>Telefone</h3><a class="tel" href="tel:{B["phoneE164"]}">{B["phoneDisplay"]}</a><p style="margin-top:.25rem;font-size:.875rem;color:var(--muted)">Abre às 19:00</p></div>
          <div><h3>Serviços</h3><ul class="servs">{serv_html}</ul></div>
          <div style="display:flex;flex-wrap:wrap;gap:.75rem;margin-top:auto">
            <a class="cta solid" style="flex:1;padding:.9rem 1.5rem" href="{maps}" target="_blank" rel="noopener">Como chegar</a>
            <a class="cta outline" style="flex:1;padding:.9rem 1.5rem;border-color:rgb(255 247 240/.4);color:var(--cream)" href="https://wa.me/{B["whatsapp"]}" target="_blank" rel="noopener">{WA}WhatsApp</a>
          </div>
        </div>
        <div class="card" style="padding:1.75rem;display:flex;flex-direction:column;justify-content:center;gap:1rem">
          <h3>Mapa</h3>
          <p style="color:var(--muted);line-height:1.7">O mapa interativo do Google não carrega dentro deste preview — no site publicado ele aparece aqui, embutido. Use o botão <strong style="color:var(--cream)">Como chegar</strong> para abrir a rota agora.</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <h2 style="font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:800;line-height:1.2">O que servimos em Jacareí</h2>
      <p style="margin-top:.75rem;max-width:48rem;line-height:1.7;color:var(--muted)">A {B["name"]} fica no {B["address"]["district"]}, em {B["address"]["city"]}-{B["address"]["state"]}, e atende no salão, para retirada e para entrega. Abaixo, o que as pessoas costumam procurar por aqui — tudo leva direto ao cardápio.</p>
      <div class="busca">{busca_html}</div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div class="fgrid">
      <div>
        <div class="brand">{MARK}<span>{B["name"]}</span></div>
        <p style="margin-top:.75rem;max-width:24rem">{B["slogan"]}</p>
        <p style="margin-top:1.25rem;font-size:.875rem">★ 4,8 · 46 avaliações no Google · {B["priceRange"]}</p>
      </div>
      <div><h3>Endereço</h3><address>{B["address"]["street"]}<br>{B["address"]["district"]}<br>{B["address"]["city"]} - {B["address"]["state"]}</address><a href="tel:{B["phoneE164"]}" style="display:inline-block;margin-top:.75rem;font-weight:700;color:var(--cream)">{B["phoneDisplay"]}</a></div>
      <div><h3>Navegar</h3><ul><li><a href="#inicio">Início</a></li><li><a href="#cardapio">Cardápio</a></li><li><a href="#sobre">Sobre</a></li><li><a href="#contato">Contato</a></li><li><a href="https://wa.me/{B["whatsapp"]}" target="_blank" rel="noopener">WhatsApp</a></li></ul></div>
    </div>
    <div class="fbot"><p>© <span id="ano"></span> {B["name"]}. Todos os direitos reservados.</p><p>Abre às 19:00</p></div>
  </div>
</footer>

<div class="fab" id="fab"><button class="fabBtn" id="fabBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg><span id="fabTxt"></span></button></div>

<dialog id="dlgProd"><div class="panel"><header><h2 id="pTitle"></h2><button class="x" data-close aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></header><div class="content" id="pBody"></div></div></dialog>
<dialog id="dlgCart"><div class="panel"><header><h2>Sua sacola</h2><button class="x" data-close aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></header><div class="content" id="cBody"></div><footer id="cFoot"></footer></div></dialog>

<script>
const D = {DATA};
const BRL = n => n.toLocaleString('pt-BR',{{style:'currency',currency:'BRL'}});
const byId = Object.fromEntries(D.products.map(p=>[p.id,p]));
document.getElementById('ano').textContent = new Date().getFullYear();

/* ── lanche que se abre com o scroll ──────────────────────────────────
   Em progresso 0 as camadas estão encaixadas; em 1 cada uma voltou à posição
   exata da fotografia de referência. `shift` está em pixels da foto original,
   convertido para a altura atual da caixa. Só transform, num rAF por frame. */
(function(){{
  const hero = document.getElementById('inicio');
  const box  = document.getElementById('burger');
  const parts = [...box.querySelectorAll('.layer,.ing')];
  const SRC_H = {SRC_H};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let start=0, span=1, h=1, ticking=false;
  const measure = () => {{
    const r = hero.getBoundingClientRect();
    start = r.top + scrollY;
    span  = Math.max(1, hero.offsetHeight - innerHeight);
    h     = box.offsetHeight;
  }};
  const paint = () => {{
    const t = Math.min(1, Math.max(0, (scrollY - start) / span));
    const k = (h / SRC_H) * (1 - t);
    for (const el of parts) {{
      const d = parseFloat(el.dataset.shift) * k;
      if (el.classList.contains('ing')) {{
        el.style.transform = `translateY(calc(-50% + ${{d}}px))`;
        el.style.opacity = Math.min(1, Math.max(0, (t - 0.35) / 0.3));
      }} else {{
        el.style.transform = `translateY(${{d}}px)`;
      }}
    }}
    ticking = false;
  }};
  const onScroll = () => {{ if(!ticking){{ ticking=true; requestAnimationFrame(paint); }} }};
  measure(); paint();
  addEventListener('scroll', onScroll, {{passive:true}});
  addEventListener('resize', () => {{ measure(); paint(); }}, {{passive:true}});
}})();

/* header compacto ao rolar */
addEventListener('scroll', () => document.getElementById('hdr').classList.toggle('on', scrollY>24), {{passive:true}});

/* ── cardápio ── */
const PH = `<div class="ph"><svg viewBox="0 0 48 48" fill="none"><path d="M8 20c0-7.7 7.2-13 16-13s16 5.3 16 13" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M7 24h34M9 30h30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 35h32c0 3.9-3.1 6-7 6H15c-3.9 0-7-2.1-7-6z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg><span>Michel Food House</span></div>`;
const shot = p => p.image ? `<img src="${{p.image}}" alt="${{p.name}} — Michel Food House, lanches em Jacareí" loading="lazy">` : PH;

let active = 'tradicionais';
const tabsEl = document.getElementById('tabs'), gridEl = document.getElementById('grid'), blurbEl = document.getElementById('blurb');

function renderTabs(){{
  tabsEl.innerHTML = D.categories.map(c =>
    `<button class="tab" role="tab" aria-selected="${{c.id===active}}" data-cat="${{c.id}}">${{c.label}}</button>`).join('');
}}
function cardHtml(p){{
  return `
    <article class="card prod">
      <button class="shot" data-open="${{p.id}}" aria-label="Ver detalhes de ${{p.name}}">
        ${{shot(p)}}${{p.available?'':'<span class="eso">Esgotado</span>'}}
      </button>
      <div class="body">
        <h3>${{p.name}}</h3>
        <p class="price"><sup>R$</sup>${{BRL(p.price).replace('R$','').trim()}}</p>
        ${{p.description?`<p class="desc">${{p.description}}</p>`:''}}
        <button class="add" data-add="${{p.id}}" ${{p.available?'':'disabled'}}>${{p.available?'Adicionar':'Indisponível'}}</button>
      </div>
    </article>`;
}}

/* A categoria vem quebrada em subgrupos nomeados ("X Frango", "Hot Dog"):
   lista longa em blocos curtos é o que torna 34 lanches navegáveis. */
function renderGrid(){{
  const cat = D.categories.find(c=>c.id===active);
  blurbEl.textContent = cat ? cat.blurb : '';
  const grupos = new Map();
  for (const p of D.products) {{
    if (p.category !== active) continue;
    (grupos.get(p.group) ?? grupos.set(p.group, []).get(p.group)).push(p);
  }}
  gridEl.innerHTML = [...grupos].map(([nome, itens]) => `
    <section class="grupo">
      <div class="grupoTit">
        <h3>${{nome}}</h3><span class="hr"></span>
        <small>${{itens.length}} ${{itens.length===1?'opção':'opções'}}</small>
      </div>
      <div class="grid">${{itens.map(cardHtml).join('')}}</div>
    </section>`).join('');
}}
tabsEl.addEventListener('click', e => {{
  const b = e.target.closest('[data-cat]'); if(!b) return;
  active = b.dataset.cat; renderTabs(); renderGrid();
}});
renderTabs(); renderGrid();

/* galeria: fotos reais da casa, sem atribuir produto */
document.getElementById('gal').innerHTML = ['x-tudo','beirute-especial-carne','especial-da-casa','batata-especial','x-churrasco','beirute-frango-bacon','acai-500','x-bacon-gourmet']
  .map(id => byId[id]).filter(p=>p&&p.image)
  .map(p => `<img src="${{p.image}}" alt="Lanche da Michel Food House, lanches em Jacareí" loading="lazy">`).join('');

/* ── sacola (localStorage) ── */
const KEY='mfh-preview-v1';
let cart = [];
try {{ cart = JSON.parse(localStorage.getItem(KEY)) || []; }} catch {{ cart = []; }}
const save = () => {{ try {{ localStorage.setItem(KEY, JSON.stringify(cart)); }} catch {{}} }};
const total = () => cart.reduce((s,l)=>s+(byId[l.id]?.price||0)*l.qty,0);
const count = () => cart.reduce((n,l)=>n+l.qty,0);

function syncFab(){{
  const n = count();
  document.getElementById('fab').classList.toggle('on', n>0);
  document.getElementById('fabTxt').textContent = `Sua sacola · ${{n}} ${{n===1?'item':'itens'}} · ${{BRL(total())}}`;
}}
function add(id, qty=1, note=''){{
  const l = cart.find(x=>x.id===id);
  if (l) {{ l.qty += qty; if(note) l.note = note; }} else cart.push({{id,qty,note}});
  save(); syncFab(); renderCart();
}}
function setQty(id,q){{
  if (q<=0) cart = cart.filter(x=>x.id!==id);
  else cart.find(x=>x.id===id).qty = q;
  save(); syncFab(); renderCart();
}}

document.addEventListener('click', e => {{
  const a = e.target.closest('[data-add]'); if (a) {{ add(a.dataset.add); return; }}
  const o = e.target.closest('[data-open]'); if (o) {{ openProd(o.dataset.open); return; }}
  if (e.target.closest('[data-close]')) e.target.closest('dialog').close();
}});

/* modal do produto */
const dlgProd = document.getElementById('dlgProd');
function openProd(id){{
  const p = byId[id]; if(!p) return;
  document.getElementById('pTitle').textContent = p.name;
  document.getElementById('pBody').innerHTML = `
    <div style="margin:-1.25rem -1.5rem 1.25rem;aspect-ratio:16/10;overflow:hidden">${{shot(p)}}</div>
    <p class="price" style="font-size:1.9rem">${{BRL(p.price)}}</p>
    ${{p.description?`<p style="margin-top:.75rem;line-height:1.7;color:var(--muted)">${{p.description}}</p>`:''}}
    ${{p.available?'':'<p class="aviso">Este item está esgotado no momento.</p>'}}
    <p style="margin-top:1.5rem;font-weight:700;font-size:.875rem">Quantidade</p>
    <div class="qty" id="mq"><button data-q="-1" aria-label="Diminuir">−</button><span id="mqv">1</span><button data-q="1" aria-label="Aumentar">+</button></div>
    <p style="margin-top:1.25rem;font-weight:700;font-size:.875rem"><label for="mn">Observações (opcional)</label></p>
    <textarea id="mn" class="note" rows="3" maxlength="280" placeholder="Ex.: sem cebola, capricha no bacon…"></textarea>
    <button class="go" id="mAdd" style="margin-top:1.5rem" ${{p.available?'':'disabled'}}>Adicionar ${{BRL(p.price)}}</button>`;
  let q = 1;
  const val = document.getElementById('mqv'), btn = document.getElementById('mAdd');
  document.getElementById('mq').addEventListener('click', ev => {{
    const b = ev.target.closest('[data-q]'); if(!b) return;
    q = Math.min(30, Math.max(1, q + (+b.dataset.q)));
    val.textContent = q; btn.textContent = `Adicionar ${{q>1?q+' · ':''}}${{BRL(p.price*q)}}`;
  }});
  btn.addEventListener('click', () => {{ add(p.id, q, document.getElementById('mn').value); dlgProd.close(); }});
  dlgProd.showModal();
}}

/* sacola */
const dlgCart = document.getElementById('dlgCart');
document.getElementById('fabBtn').addEventListener('click', () => {{ renderCart(); dlgCart.showModal(); }});

function renderCart(){{
  const body = document.getElementById('cBody'), foot = document.getElementById('cFoot');
  if (!cart.length) {{
    body.innerHTML = '<div class="empty"><p style="font-weight:700;color:var(--cream)">Sua sacola está vazia</p><p style="margin-top:.5rem;font-size:.875rem">Escolha um lanche no cardápio.</p></div>';
    foot.innerHTML = ''; return;
  }}
  body.innerHTML = cart.map(l => {{
    const p = byId[l.id]; if(!p) return '';
    return `<div class="line">
      <div class="thumb">${{shot(p)}}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;gap:.75rem"><h3 style="font-weight:700">${{p.name}}</h3><button class="rm" data-rm="${{p.id}}">remover</button></div>
        <p style="font-weight:800;color:var(--gold);margin-top:.15rem">${{BRL(p.price*l.qty)}}</p>
        <div class="qty"><button data-dec="${{p.id}}" aria-label="Diminuir ${{p.name}}">−</button><span>${{l.qty}}</span><button data-inc="${{p.id}}" aria-label="Aumentar ${{p.name}}">+</button></div>
      </div></div>`;
  }}).join('') + `<button class="rm" id="clear" style="margin-top:1rem">Esvaziar sacola</button>`;

  const msg = ['Olá! Gostaria de fazer um pedido na Michel Food House.','','Pedido:']
    .concat(cart.map(l => {{ const p=byId[l.id]; return `${{l.qty}}x ${{p.name}} — ${{BRL(p.price*l.qty)}}` + (l.note?`\\n   obs: ${{l.note}}`:''); }}))
    .concat(['', `Total: ${{BRL(total())}}`]).join('\\n');

  foot.innerHTML = `<div class="tot"><span>Subtotal</span><b>${{BRL(total())}}</b></div>
    <a class="go" target="_blank" rel="noopener" href="https://wa.me/${{D.whatsapp}}?text=${{encodeURIComponent(msg)}}">{WA}Finalizar pelo WhatsApp</a>
    <p class="aviso">Preview: o pagamento por Pix e cartão fica no site publicado. Aqui o pedido segue direto para o WhatsApp da casa.</p>`;
}}
document.getElementById('cBody').addEventListener('click', e => {{
  const r=e.target.closest('[data-rm]'), i=e.target.closest('[data-inc]'), dd=e.target.closest('[data-dec]');
  if (r) setQty(r.dataset.rm, 0);
  else if (i) setQty(i.dataset.inc, cart.find(x=>x.id===i.dataset.inc).qty+1);
  else if (dd) setQty(dd.dataset.dec, cart.find(x=>x.id===dd.dataset.dec).qty-1);
  else if (e.target.id==='clear') {{ cart=[]; save(); syncFab(); renderCart(); }}
}});
syncFab();
</script>
'''

(ROOT / "preview.html").write_text(HTML, encoding="utf-8")
print("preview.html:", round(len(HTML.encode()) / 1024), "KB")
