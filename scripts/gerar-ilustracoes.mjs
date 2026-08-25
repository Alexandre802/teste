/**
 * Gera uma ilustração por produto em /public/ilustracoes.
 *
 * São desenhos da própria casa, em SVG, na paleta do site. **Nenhum reproduz
 * embalagem, logotipo ou identidade visual de fabricante** — o objetivo é o
 * card não ficar vazio até a foto oficial chegar, e ficar evidente que é
 * ilustração e não a foto do produto.
 *
 * A foto real tem precedência: assim que existir /public/produtos/<id>.webp,
 * o card usa ela e ignora a ilustração. Não é preciso apagar nada.
 *
 *   npm run ilustracoes
 */
import { mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { produtos } from '../data/products.ts';
import { CORES, formas } from './arte/formas.mjs';

const SAIDA = path.join(process.cwd(), 'public', 'ilustracoes');
const LADO = 640;

/* A forma sai do que o produto é, não da categoria: "Comedouro Duplo" e
   "Cama Almofadada" estão na mesma categoria e não podem virar o mesmo
   desenho. A primeira regra que casar com o nome vence. */
const REGRAS = [
  [/arranhador/, 'arranhador'],
  [/catnip|erva|grama para|bloco mineral|cascalho/, 'pote'],
  [/tapete|lenç|lenco/, 'tapete'],
  [/peitoral|guia|lançador|lancador/, 'guia'],
  [/coleira|plaquinha|placa de identifica/, 'coleira'],
  [/cama|colchonete|iglu|toca|casinha|nicho|ninho|poleiro|escada/, 'cama'],
  [/gaiola/, 'gaiola'],
  [/comedouro|bebedouro|fonte|tigela|banheira|caixa de areia|pá |pa higi/, 'tigela'],
  [/aquário|aquario|terrário|terrario|filtro|ilha flutuante|planta artificial|cascalho|substrato para terr/, 'aquario'],
  [/lâmpada|lampada|termostato|termômetro|termometro/, 'lampada'],
  [/vermífugo|vermifugo|comprimido|antipulgas em comprimido|suplemento articular/, 'cartela'],
  [/pipeta|tópico|topico/, 'pipeta'],
  [/escova|cortador|roda de exerc/, 'escova'],
  [/bola|bolinha|frisbee|disco|circuito|molinha|guizo/, 'bola'],
  [/corda|puxador/, 'corda'],
  [/pelúcia|pelucia|ratinho|varinha|pena|peixe elétrico|peixe eletrico|túnel|tunel/, 'pelucia'],
  [/osso|orelha|mordedor|chifre/, 'osso'],
  [/bifinho|tiras|petisco|dentastix|temptations|dreamies|snack/, 'bifinho'],
  [/biscoito/, 'biscoito'],
  [/sachê|sache/, 'sache'],
  [/shampoo|condicionador|colônia|colonia|eliminador|educador|solução|solucao|pasta|malte|probiótico|probiotico|suplemento vitam|condicionador de água|condicionador de agua/, 'frasco'],
  [/bloco mineral|saquinho|colar elizabetano|kit brinquedos|bolsa|caixa de transporte|porta-ração|porta-racao|roupa|moletom/, 'caixa'],
  [/ração|racao|areia|feno|alpiste|semente|farinhada|mistura|serragem/, 'saco'],
];

const PADRAO_POR_CATEGORIA = {
  'racao-cachorro': 'saco', 'racao-gato': 'saco',
  'petisco-cachorro': 'bifinho', 'petisco-gato': 'bifinho',
  'brinquedo-cachorro': 'bola', 'brinquedo-gato': 'pelucia',
  'higiene-cachorro': 'frasco', 'higiene-gato': 'saco',
  coleiras: 'coleira', camas: 'cama', peixes: 'aquario', aves: 'gaiola',
  coelhos: 'saco', repteis: 'aquario', saude: 'frasco',
};

function formaDe(produto) {
  const nome = produto.nome.toLowerCase();
  for (const [padrao, forma] of REGRAS) if (padrao.test(nome)) return forma;
  return PADRAO_POR_CATEGORIA[produto.categoria] ?? 'pote';
}

/* Uma variação pequena e estável por produto: mesmo desenho repetido 16 vezes
   numa seção denunciaria o placeholder. O deslocamento vem do id, então a
   mesma ilustração sai igual a cada geração. */
function semente(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function svg(produto) {
  const forma = formas[formaDe(produto)];
  const s = semente(produto.id);
  const giro = ((s % 7) - 3) * 0.9;          // −2,7° a +2,7°
  const escala = 0.94 + ((s >> 3) % 9) * 0.014; // 0,94 a 1,05

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${LADO}" height="${LADO}">
  <defs>
    <radialGradient id="sombra" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${CORES.escuro}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${CORES.escuro}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- branco puro, como as fotos de produto da referência: qualquer tom aqui
       vira um quadrado visível dentro do card, que também é branco -->
  <rect width="400" height="400" fill="${CORES.branco}"/>
  <ellipse cx="200" cy="342" rx="112" ry="26" fill="url(#sombra)"/>
  <g transform="translate(200 200) rotate(${giro.toFixed(2)}) scale(${escala.toFixed(3)}) translate(-200 -200)">
    ${forma()}
  </g>
</svg>`;
}

/* ── render ── */
const candidatos = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
].filter(Boolean);
const executablePath = candidatos.find((c) => existsSync(c));
if (!executablePath) {
  console.error('Não achei um Chrome. Aponte com CHROME_PATH=/caminho/do/chrome.');
  process.exit(1);
}

await mkdir(SAIDA, { recursive: true });
for (const antigo of existsSync(SAIDA) ? await readdir(SAIDA) : []) {
  if (antigo.endsWith('.webp')) await rm(path.join(SAIDA, antigo));
}

const nav = await chromium.launch({ executablePath });
const pagina = await nav.newPage({ viewport: { width: LADO, height: LADO }, deviceScaleFactor: 1 });

const usadas = new Map();
let feitas = 0;
for (const produto of produtos) {
  const forma = formaDe(produto);
  usadas.set(forma, (usadas.get(forma) ?? 0) + 1);
  await pagina.setContent(
    `<style>html,body{margin:0;padding:0}</style>${svg(produto)}`,
    { waitUntil: 'load' },
  );
  await pagina.screenshot({
    path: path.join(SAIDA, `${produto.id}.webp`),
    type: 'webp',
    quality: 88,
  });
  feitas++;
}
await nav.close();

console.log(`ilustrações: ${feitas} arquivos em /public/ilustracoes`);
console.log('formas usadas:');
for (const [f, n] of [...usadas].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${f}`);
const semUso = Object.keys(formas).filter((f) => !usadas.has(f));
if (semUso.length) console.log('formas sem uso:', semUso.join(', '));
