import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const arquivo = join(raiz, "data", "menu-original.json");
const fonte = "https://instadelivery.com.br/comidacaseiradamarciacosta";
const api = "https://app.instadelivery.com.br/api/stores/by-slug/comidacaseiradamarciacosta?filterAll=true";

const slug = (texto) => String(texto ?? "categoria").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const numero = (valor) => { const n = Number(valor); return Number.isFinite(n) ? n : 0; };
const cache = JSON.parse(readFileSync(arquivo, "utf8"));

let loja;
try {
  const resposta = await fetch(api, { headers: { accept: "application/json", "user-agent": "Mozilla/5.0 (compatible; ComidaCaseiraMenuSync/1.0)" } });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  loja = await resposta.json();
} catch (erro) {
  console.warn(`[cardapio] Falha ao consultar InstaDelivery (${String(erro)}). Mantendo o último cardápio confirmado.`);
  process.exit(0);
}

const existentes = new Map((cache.products ?? []).map((p) => [String(p.id), p]));
const categoriasExistentes = new Map((cache.categories ?? []).map((c) => [c.id, c]));
const atuais = [];
const idsAtuais = new Set();
const categoriasAtuais = [];

for (const grupo of loja.groups ?? []) {
  if (grupo?.deleted_at || Number(grupo?.is_invisible) === 1) continue;
  const categoriaId = slug(grupo.name);
  categoriasAtuais.push({ id: categoriaId, name: String(grupo.name ?? "Categoria"), icon: categoriasExistentes.get(categoriaId)?.icon ?? (/bebida/i.test(String(grupo.name)) ? "CupSoda" : "Utensils") });

  for (const item of grupo.itens ?? []) {
    if (item?.deleted_at || Number(item?.is_invisible) === 1) continue;
    const id = String(item.id);
    idsAtuais.add(id);
    const anterior = existentes.get(id);
    const gruposOpcao = (item.complementos ?? []).filter((g) => !g?.deleted_at).sort((a,b) => numero(a.order)-numero(b.order));
    const grupoPreco = gruposOpcao.find((g) => numero(g.min) > 0 && (g.complements ?? []).some((c) => !c?.deleted_at && c?.active !== false && numero(c.price) > 0));
    const precosObrigatorios = (grupoPreco?.complements ?? []).filter((c) => !c?.deleted_at && c?.active !== false).map((c) => numero(c.price)).filter((p) => p >= 0);
    let precoBase = numero(item.price1);
    if (precoBase <= 0 && precosObrigatorios.length > 0) precoBase = Math.min(...precosObrigatorios);
    else if (precoBase <= 0) precoBase = numero(item.from_price);

    const options = gruposOpcao.map((g) => {
      const ehGrupoPreco = grupoPreco && String(grupoPreco.id) === String(g.id);
      return {
        id: `${id}:${g.id}`,
        name: String(g.name ?? "Opções"),
        type: numero(g.max) === 1 ? "single" : "multiple",
        required: numero(g.min) > 0,
        max: Math.max(1, numero(g.max) || 1),
        choices: (g.complements ?? []).filter((c) => !c?.deleted_at).sort((a,b) => numero(a.order)-numero(b.order)).map((c) => ({ id: `${id}:${c.id}`, name: String(c.name ?? "Opção").trim(), priceDelta: Math.max(0, ehGrupoPreco ? numero(c.price)-precoBase : numero(c.price)), available: c.active !== false })),
      };
    });

    atuais.push({ id, name: String(item.name ?? anterior?.name ?? "Produto").trim(), description: String(item.description ?? anterior?.description ?? "").trim(), price: precoBase, priceFrom: numero(item.from_price) > 0 || (precosObrigatorios.length > 1 && new Set(precosObrigatorios).size > 1), image: item.image || anterior?.image || null, category: categoriaId, featured: Boolean(anterior?.featured), available: true, confirmado: true, options });
  }
}

const historicos = [...existentes.values()].filter((p) => !idsAtuais.has(String(p.id)) && p.confirmado !== false).map((p) => ({ ...p, available: false, featured: false }));
const categorias = [...categoriasAtuais];
for (const c of cache.categories ?? []) if (!categorias.some((x) => x.id === c.id)) categorias.push(c);
const novo = { source: fonte, syncedAt: new Date().toISOString(), storeId: String(loja.id ?? "170308"), categories: categorias, products: [...atuais, ...historicos] };
writeFileSync(arquivo, `${JSON.stringify(novo, null, 2)}\n`, "utf8");
console.log(`[cardapio-json] ${JSON.stringify(novo)}`);
console.log(`[cardapio] Sincronizado: ${atuais.length} disponíveis agora; ${historicos.length} oficiais rotativos preservados; ${categoriasAtuais.length} categorias ativas.`);
console.log(`[cardapio] Itens atuais: ${atuais.map((p) => p.name).join(" | ")}`);
