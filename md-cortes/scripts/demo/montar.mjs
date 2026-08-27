#!/usr/bin/env node
/**
 * Monta a prévia de página única do MD_cortes.
 *
 * Junta o aplicativo inteiro — mesmos componentes, mesma folha de estilo — num
 * arquivo HTML só, que abre em qualquer lugar sem servidor. Serve para mostrar
 * o sistema funcionando por um link, enquanto a publicação de verdade não está
 * no ar.
 *
 * O que ele NÃO é: o aplicativo publicado. Aqui não há service worker, não há
 * instalação na tela de início e não há saída para a internet, então o modo
 * nuvem fica de fora. O que roda é o modo local, que é o aplicativo de verdade
 * guardando os dados no próprio navegador.
 *
 *   node scripts/demo/montar.mjs [saida.html]
 */

import { build } from 'esbuild';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SAIDA = process.argv[2] ?? join(RAIZ, 'out-previa', 'md-cortes-previa-viva.html');

/* ── 1. o JavaScript ────────────────────────────────────────────────────── */

const resultado = await build({
  entryPoints: [join(RAIZ, 'scripts/demo/entrada.tsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2022'],
  jsx: 'automatic',
  tsconfig: join(RAIZ, 'tsconfig.json'),
  // O roteador do Next não existe fora do Next; estes dois arquivos ocupam o
  // lugar dele sem que nenhum componente precise mudar.
  alias: {
    'next/link': join(RAIZ, 'scripts/demo/shims/next-link.tsx'),
    'next/navigation': join(RAIZ, 'scripts/demo/shims/next-navigation.ts'),
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.NEXT_PUBLIC_BASE_PATH': '""',
    'process.env.NEXT_PUBLIC_SUPABASE_URL': '""',
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': '""',
    'process.env.NEXT_PUBLIC_LOGIN_DOMAIN': '"mdcortes.app"',
    'process.env.NEXT_PUBLIC_PREVIA': '"1"',
    // A prévia roda sem servidor: sem isto ela cairia na tela "Sistema não
    // configurado", que é o comportamento certo em produção e inútil aqui.
    'process.env.NEXT_PUBLIC_PERMITIR_MODO_LOCAL': '"1"',
  },
  write: false,
  logLevel: 'warning',
});

const js = resultado.outputFiles[0].text;

/* ── 2. a folha de estilo, tirada da build de verdade ───────────────────── */

const pastaCss = join(RAIZ, 'out/_next/static/chunks');
const nomes = (await readdir(pastaCss)).filter((n) => n.endsWith('.css'));
if (nomes.length === 0) {
  throw new Error('Nenhum CSS em out/. Rode `npm run build` antes.');
}
const cssBruto = (await Promise.all(nomes.map((n) => readFile(join(pastaCss, n), 'utf8')))).join('\n');

// Fora os @font-face: eles apontam para ../media/*.woff2, que só existe no site
// publicado. Aqui a fonte vem do Google Fonts, declarado no topo da página.
const css = cssBruto.replace(/@font-face\s*\{[^}]*\}/g, '');

/* ── 3. a página ────────────────────────────────────────────────────────── */

const html = `<title>MD_cortes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">

<style>
/* A folha do próprio aplicativo, saída da build de produção. */
${css}

/* No site publicado a fonte vem do next/font, que define esta variável. */
:root { --fonte-app: 'Plus Jakarta Sans'; }

/* A página vive dentro de um quadro de altura fixa, então a rolagem é do app. */
html, body { height: 100%; margin: 0; }
#md-cortes { min-height: 100dvh; }
</style>

<div id="md-cortes"></div>

<script>
${js}
</script>
`;

await writeFile(SAIDA, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`${SAIDA} — ${kb} KB`);
