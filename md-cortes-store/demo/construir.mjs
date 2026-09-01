/**
 * Empacota o app num arquivo HTML único, para poder ser aberto sem servidor.
 *
 * É o mesmo código-fonte do app: o que muda são os atalhos de `next/link`,
 * `next/navigation`, `next/image` e do cliente do Supabase, trocados por
 * equivalentes locais em demo/atalhos. Nenhuma tela é reescrita.
 *
 * React entra dentro do pacote em vez de vir por CDN: a página fica inteira
 * num arquivo, abre sem rede e não depende de um domínio de terceiro
 * continuar no ar.
 */
import { build } from "esbuild";
import { execFile } from "node:child_process";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const executar = promisify(execFile);
const raiz = path.resolve(import.meta.dirname, "..");
const saida = path.join(raiz, "demo", "saida");

/** Redireciona os módulos do Next e do Supabase para os atalhos locais. */
const atalhos = {
  name: "atalhos",
  setup(construtor) {
    const mapa = {
      "next/link": "demo/atalhos/link.tsx",
      "next/image": "demo/atalhos/image.tsx",
      "next/navigation": "demo/atalhos/navigation.ts",
      "@/lib/supabase/client": "demo/atalhos/supabase.ts",
      "@/lib/brand": "demo/atalhos/brand.ts",
      "@/utils/csv": "demo/atalhos/csv.ts",
    };
    for (const [de, para] of Object.entries(mapa)) {
      const filtro = new RegExp(`^${de.replace(/[/@]/g, "\\$&")}$`);
      construtor.onResolve({ filter: filtro }, () => ({ path: path.join(raiz, para) }));
    }
  },
};

await rm(saida, { recursive: true, force: true });
await mkdir(saida, { recursive: true });

console.log("1/3  empacotando o JavaScript…");
await build({
  entryPoints: [path.join(raiz, "demo", "entrada.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  platform: "browser",
  outfile: path.join(saida, "app.js"),
  plugins: [atalhos],
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_SUPABASE_URL": '""',
    "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": '""',
    "process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY": '""',
  },
  loader: { ".svg": "dataurl", ".png": "dataurl" },
  tsconfig: path.join(raiz, "tsconfig.json"),
  logLevel: "warning",
});

console.log("2/3  gerando o CSS…");
await executar("npx", [
  "@tailwindcss/cli",
  "-i", path.join(raiz, "demo", "estilo.css"),
  "-o", path.join(saida, "app.css"),
  "--minify",
], { cwd: raiz });

console.log("3/3  montando o HTML…");
const js = await readFile(path.join(saida, "app.js"), "utf8");
const css = await readFile(path.join(saida, "app.css"), "utf8");

const html = `<title>MD Cortes Store</title>
<meta name="description" content="Controle de vendas e estoque da MD Cortes Store.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap">
<style>${css}</style>
<div id="app"></div>
<script>${js}</script>
`;

await writeFile(path.join(saida, "index.html"), html);
console.log(`pronto: demo/saida/index.html — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
