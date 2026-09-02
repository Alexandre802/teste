/**
 * Leva o cardápio de data/menu.ts para o banco.
 *
 * Por que existe: o servidor recalcula o pedido a partir dos preços do banco,
 * nunca do que o navegador manda. Então o banco precisa conhecer os produtos.
 * O custo (cost_cents) NÃO é tocado aqui — quem define é a dona, no painel, e
 * uma sincronização de cardápio não pode apagar isso.
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/sincronizar-produtos.mjs
 *
 * A chave de serviço é usada porque escrever em comida_caseira_products exige
 * um usuário do painel, e um script não tem sessão. Ela ignora a RLS: nunca a
 * coloque em variável NEXT_PUBLIC_ nem em arquivo versionado.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { createClient } from "@supabase/supabase-js";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const chave = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

if (!url || !chave) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.",
  );
  process.exit(1);
}

/**
 * Lê os produtos do cardápio sem compilar TypeScript: o arquivo é uma lista
 * declarativa, e um parser pequeno evita arrastar toolchain para um script.
 */
function lerCardapio() {
  const fonte = readFileSync(join(raiz, "data", "menu.ts"), "utf8");
  const blocos = fonte
    .slice(fonte.indexOf("export const products"))
    .split(/\n  \{\n/)
    .slice(1);

  return blocos
    .map((bloco) => {
      const campo = (nome) =>
        bloco.match(new RegExp(`${nome}:\\s*"([^"]*)"`))?.[1];
      const numero = (nome) =>
        bloco.match(new RegExp(`${nome}:\\s*([\\d.]+)`))?.[1];

      const id = campo("id");
      const preco = numero("price");
      if (!id || preco === undefined) return null;

      return {
        id,
        nome: campo("name") ?? id,
        categoria: campo("category") ?? "",
        price_cents: Math.round(Number(preco) * 100),
        ativo: !/available:\s*false/.test(bloco),
      };
    })
    .filter(Boolean);
}

const produtos = lerCardapio();
if (produtos.length === 0) {
  console.error("Nenhum produto encontrado em data/menu.ts.");
  process.exit(1);
}

const supabase = createClient(url, chave, { auth: { persistSession: false } });

// upsert sem cost_cents: o custo cadastrado no painel fica intacto.
const { error } = await supabase
  .from("comida_caseira_products")
  .upsert(
    produtos.map((produto) => ({ ...produto, updated_at: new Date().toISOString() })),
    { onConflict: "id" },
  );

if (error) {
  console.error("Falhou:", error.message);
  process.exit(1);
}

console.log(`${produtos.length} produto(s) sincronizado(s):`);
for (const produto of produtos) {
  console.log(
    `  ${produto.id} — ${produto.nome} — R$ ${(produto.price_cents / 100).toFixed(2)}`,
  );
}
