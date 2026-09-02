/**
 * Sincroniza o cardápio oficial (data/menu-original.json) com o Supabase.
 * Preço e opções ficam espelhados para comida_caseira_create_order recalcular
 * o pedido sem confiar no navegador. O custo cadastrado pela dona é preservado.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const chave = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

if (!url || !chave) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.");
  process.exit(1);
}

const cardapio = JSON.parse(
  readFileSync(join(raiz, "data", "menu-original.json"), "utf8"),
);
const produtos = cardapio.products ?? [];
if (produtos.length === 0) {
  console.error("Nenhum produto encontrado em data/menu-original.json.");
  process.exit(1);
}

const supabase = createClient(url, chave, { auth: { persistSession: false } });

const linhasProdutos = produtos.map((produto) => ({
  id: String(produto.id),
  nome: produto.name,
  categoria: produto.category,
  price_cents: Math.round(Number(produto.price) * 100),
  ativo: produto.available !== false,
  updated_at: new Date().toISOString(),
}));

const { error: erroProdutos } = await supabase
  .from("comida_caseira_products")
  .upsert(linhasProdutos, { onConflict: "id" });
if (erroProdutos) {
  console.error("Falhou ao sincronizar produtos:", erroProdutos.message);
  process.exit(1);
}

let totalOpcoes = 0;
for (const produto of produtos) {
  const productId = String(produto.id);
  const { error: erroLimpeza } = await supabase
    .from("comida_caseira_product_options")
    .delete()
    .eq("product_id", productId);
  if (erroLimpeza) {
    console.error(`Falhou ao limpar opções de ${productId}:`, erroLimpeza.message);
    process.exit(1);
  }

  const opcoes = (produto.options ?? []).flatMap((grupo) =>
    (grupo.choices ?? []).map((escolha) => ({
      id: String(escolha.id),
      product_id: productId,
      grupo_id: String(grupo.id),
      grupo_nome: grupo.name,
      nome: escolha.name,
      price_delta_cents: Math.round(Number(escolha.priceDelta ?? 0) * 100),
      ativo: escolha.available !== false,
    })),
  );

  if (opcoes.length > 0) {
    const { error: erroOpcoes } = await supabase
      .from("comida_caseira_product_options")
      .insert(opcoes);
    if (erroOpcoes) {
      console.error(`Falhou ao sincronizar opções de ${productId}:`, erroOpcoes.message);
      process.exit(1);
    }
  }
  totalOpcoes += opcoes.length;
}

console.log(`${produtos.length} produtos e ${totalOpcoes} opções sincronizados.`);
for (const produto of linhasProdutos) {
  console.log(`  ${produto.id} — ${produto.nome} — R$ ${(produto.price_cents / 100).toFixed(2)}`);
}
