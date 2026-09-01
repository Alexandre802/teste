/**
 * Abre o build da demonstração num navegador de verdade e percorre o fluxo
 * principal: registrar uma venda, conferir o painel e recarregar a página para
 * provar que os dados continuam lá.
 *
 *   node demo/construir.mjs && node demo/testar.mjs
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

// A hospedagem de artefato embrulha a página com charset + viewport; o
// servidor de teste faz o mesmo, senão o Chromium usa layout de 980px.
const bruto = await readFile(new URL("saida/index.html", import.meta.url), "utf8");
const html = Buffer.from(
  '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<style>body{margin:0}img{max-width:100%}</style>' + bruto,
);
const servidor = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}).listen(3399);

const destino = "/tmp/claude-0/-home-user-teste/848b90aa-6f58-5f2c-a173-e794e4b642ac/scratchpad/shots";
const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  proxy: { server: process.env.HTTPS_PROXY ?? "", bypass: "localhost,127.0.0.1" },
});
const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const erros = [];
p.on("pageerror", (e) => erros.push("PAGEERROR: " + e.message));
p.on("console", (m) => { if (m.type() === "error") erros.push("CONSOLE: " + m.text().slice(0, 300)); });

await p.goto("http://localhost:3399/", { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
await p.screenshot({ path: `${destino}/demo-1-inicio.png`, fullPage: true });
console.log("título visível:", await p.locator("h1").first().textContent().catch(() => "—"));

// fluxo: registrar venda
await p.locator('a[href="#/venda"]').first().click();
await p.waitForTimeout(1200);
await p.screenshot({ path: `${destino}/demo-2-venda.png` });
await p.getByRole("button", { name: /Camiseta Oversized MD/ }).first().click();
await p.waitForTimeout(800);
await p.getByRole("button", { name: /^M/ }).first().click().catch(() => {});
await p.waitForTimeout(400);
await p.screenshot({ path: `${destino}/demo-3-form.png` });
await p.getByRole("button", { name: /Confirmar venda/i }).click();
await p.waitForTimeout(1500);
await p.screenshot({ path: `${destino}/demo-4-ok.png` });

// volta ao início e confere se o faturamento subiu
await p.getByRole("button", { name: /Voltar ao início/i }).click();
await p.waitForTimeout(1500);
await p.screenshot({ path: `${destino}/demo-5-painel.png`, fullPage: true });

// recarrega para provar a persistência
await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(3000);
const textoPainel = await p.locator("body").innerText();
const faturamento = /Faturamento hoje\s*\n?\s*(R\$[^\n]*)/.exec(textoPainel);
console.log("painel após recarregar →", faturamento ? faturamento[1] : "não encontrado");
console.log("pendências:", /(\d+) aguardando/.exec(textoPainel)?.[1] ?? "0");
await p.screenshot({ path: `${destino}/demo-6-recarregado.png`, fullPage: true });

console.log(erros.length ? "ERROS:\n" + erros.slice(0, 8).join("\n") : "sem erros de console");
await b.close();
servidor.close();
