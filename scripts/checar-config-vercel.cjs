#!/usr/bin/env node
/*
 * Roda o MESMO leitor que a Vercel usa para ler `export const config`.
 *
 * Por que existe: a Vercel lê esse objeto com @vercel/static-config, que
 * percorre o AST do TypeScript e faz
 *
 *     const [nome, doisPontos, valor] = prop.getChildren();
 *
 * assumindo três filhos por propriedade. Um comentário JSDoc
 * (barra-asterisco-asterisco) escrito DENTRO do objeto vira um nó do AST,
 * entra como primeiro filho e desloca tudo — o leitor pede o valor do próprio
 * token de dois pontos e a publicação morre com `Unhandled type: "ColonToken"`.
 *
 * O `next build` passa mesmo assim: o tsc trata JSDoc como trivia. O erro só
 * aparece na Vercel, DEPOIS do build, o que o torna difícil de rastrear. Este
 * script antecipa isso aqui.
 *
 *   node scripts/checar-config-vercel.cjs           varre o projeto
 *   node scripts/checar-config-vercel.cjs proxy.ts  um arquivo só
 *   node scripts/checar-config-vercel.cjs --exigir  falha se faltar a CLI
 *
 * Sai com código 1 se algum arquivo quebrar. Sem a CLI da Vercel instalada não
 * há o que rodar: avisa e sai com 0, para não derrubar build de quem não a tem
 * (é `prebuild`). Com `--exigir` esse caso vira erro — use assim na CI.
 */
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const RAIZ = path.resolve(__dirname, '..');
const EXTENSOES = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const IGNORAR = new Set(['node_modules', '.next', '.vercel', '.git', 'out', 'dist', 'referencias']);

// O leitor não é dependência do projeto: ele vem junto da CLI da Vercel, que é
// global. Achar a instalação global é o único jeito de rodar exatamente a
// versão que vai publicar o site.
function carregarLeitor() {
  const candidatos = [];
  try {
    const raizGlobal = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
    candidatos.push(path.join(raizGlobal, 'vercel', 'node_modules', '@vercel', 'static-config'));
  } catch {
    // npm indisponível: sobra o resolve normal abaixo
  }
  candidatos.push('@vercel/static-config');

  for (const candidato of candidatos) {
    try {
      const leitor = require(candidato);
      const tsMorph = require(require.resolve('ts-morph', { paths: [path.dirname(require.resolve(candidato + '/package.json'))] }));
      return { leitor, tsMorph };
    } catch {
      // tenta o próximo
    }
  }
  return null;
}

function listarArquivos(dir) {
  const achados = [];
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entrada.name.startsWith('.') && entrada.name !== '.') continue;
    if (IGNORAR.has(entrada.name)) continue;
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) achados.push(...listarArquivos(completo));
    else if (EXTENSOES.has(path.extname(entrada.name))) achados.push(completo);
  }
  return achados;
}

const argumentos = process.argv.slice(2);
const exigir = argumentos.includes('--exigir');
const alvos = argumentos.filter((a) => a !== '--exigir');

const ambiente = carregarLeitor();
if (!ambiente) {
  const recado =
    'Não encontrei @vercel/static-config; a checagem foi pulada. Instale a CLI com `npm i -g vercel`.';
  if (exigir) {
    console.error(recado);
    process.exit(2);
  }
  console.warn(recado);
  process.exit(0);
}
const { leitor, tsMorph } = ambiente;

// Esquema permissivo de propósito: aqui só interessa se o objeto pode ser LIDO.
// A conferência do formato de cada campo é assunto da Vercel.
const ESQUEMA = { type: 'object' };

const arquivos = (alvos.length ? alvos.map((a) => path.resolve(RAIZ, a)) : listarArquivos(RAIZ))
  // este arquivo cita o padrão no comentário; não é um `config` de verdade
  .filter((arquivo) => arquivo !== __filename)
  .filter((arquivo) => /export\s+const\s+config\b/.test(fs.readFileSync(arquivo, 'utf8')));

let quebrados = 0;
for (const arquivo of arquivos) {
  const relativo = path.relative(RAIZ, arquivo);
  // projeto novo por arquivo: o cache do ts-morph guarda o source file
  const projeto = new tsMorph.Project({ compilerOptions: { allowJs: true } });
  try {
    const config = leitor.getConfig(projeto, arquivo, ESQUEMA);
    console.log(`  ok      ${relativo}  ${JSON.stringify(config)}`);
  } catch (erro) {
    quebrados += 1;
    console.error(`  QUEBRA  ${relativo}`);
    console.error(`          ${erro.message}`);
    if (/ColonToken/.test(erro.message)) {
      console.error('          Causa provável: comentário JSDoc dentro do objeto `config`.');
      console.error('          Mova a explicação para fora do objeto, ou use comentário de linha.');
    }
  }
}

if (!arquivos.length) {
  console.log('Nenhum arquivo com `export const config`.');
} else {
  console.log(`\n${arquivos.length} arquivo(s) com \`export const config\`, ${quebrados} quebrando.`);
}
process.exit(quebrados ? 1 : 0);
