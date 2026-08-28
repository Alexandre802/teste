/**
 * Gera os PNGs do app (tela inicial, splash, aba) a partir do SVG da marca.
 *
 * Rode `npm run icons` depois de trocar a logo provisória pela oficial.
 * Basta substituir os arquivos em public/marca/ e rodar de novo.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const raiz = path.resolve(import.meta.dirname, "..");
const destino = path.join(raiz, "public", "marca");

const ouro = `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#E8B84B"/>
    <stop offset="55%" stop-color="#C98A13"/>
    <stop offset="100%" stop-color="#A96F0B"/>
  </linearGradient>`;

/** Monograma em SVG. `sobre` decide a cor do fundo e do desenho. */
function monograma({ fundo, traco, escala = 1, raio = 0 }) {
  const preenche = traco === "ouro" ? "url(#g)" : traco;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>${ouro}</defs>
  <rect width="512" height="512" rx="${raio}" fill="${fundo}"/>
  <g transform="translate(256 256) scale(${escala}) translate(-256 -256)">
    <text x="256" y="256" text-anchor="middle" fill="${preenche}"
          font-family="Liberation Serif, DejaVu Serif, Georgia, serif"
          font-size="236" font-weight="700" letter-spacing="-6">MD</text>
    <g fill="none" stroke="${preenche}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M256 292c0-20 16-25 16-38a16 16 0 1 0-32 0" stroke-width="16"/>
      <path d="M256 316 128 392c-9 6-6 18 5 18h246c11 0 14-12 5-18L256 316Z" stroke-width="18"/>
    </g>
  </g>
</svg>`;
}

const claro = monograma({ fundo: "#FFFFFF", traco: "ouro", escala: 0.86 });
const maskable = monograma({ fundo: "#C98A13", traco: "#FFFFFF", escala: 0.72 });

async function png(svg, arquivo, tamanho) {
  const buffer = await sharp(Buffer.from(svg)).resize(tamanho, tamanho).png().toBuffer();
  await writeFile(path.join(destino, arquivo), buffer);
  console.log(`  ${arquivo} (${tamanho}px)`);
}

await mkdir(destino, { recursive: true });
console.log("Gerando ícones em public/marca:");
await png(claro, "icone-192.png", 192);
await png(claro, "icone-512.png", 512);
await png(claro, "apple-touch-icon.png", 180);
await png(maskable, "icone-maskable-512.png", 512);
await writeFile(path.join(destino, "icone.svg"), claro);
console.log("Pronto.");
