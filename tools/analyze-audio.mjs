#!/usr/bin/env node
/**
 * Analisa a narração e imprime o mapa de fala (frases + pausas), no formato
 * pronto para colar em src/config/speechMap.ts.
 *
 * Uso:  node tools/analyze-audio.mjs public/audio/narration.mp3
 *
 * Precisa de um ffmpeg para decodificar o mp3. Procura, nesta ordem:
 *   1. $FFMPEG_PATH
 *   2. o binário do pacote npm `ffmpeg-static`, se instalado
 *   3. `ffmpeg` no PATH
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);

const input = process.argv[2] ?? "public/audio/narration.mp3";
if (!existsSync(input)) {
  console.error(`arquivo não encontrado: ${input}`);
  process.exit(1);
}

const resolveFfmpeg = () => {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    return require("ffmpeg-static");
  } catch {
    /* ignore */
  }
  return "ffmpeg";
};

const wav = join(tmpdir(), `narr-${Date.now()}.wav`);
execFileSync(resolveFfmpeg(), [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-i",
  input,
  "-ar",
  "16000",
  "-ac",
  "1",
  "-c:a",
  "pcm_s16le",
  wav,
]);

// ---- leitura do WAV -------------------------------------------------------
const buf = readFileSync(wav);
unlinkSync(wav);

let pos = 12;
let dataOffset = -1;
let dataLength = 0;
let sampleRate = 16000;
while (pos + 8 <= buf.length) {
  const id = buf.toString("ascii", pos, pos + 4);
  const size = buf.readUInt32LE(pos + 4);
  if (id === "fmt ") sampleRate = buf.readUInt32LE(pos + 12);
  if (id === "data") {
    dataOffset = pos + 8;
    dataLength = size;
    break;
  }
  pos += 8 + size + (size % 2);
}
if (dataOffset < 0) throw new Error("chunk data não encontrado no WAV");

const n = Math.floor(dataLength / 2);
const samples = new Int16Array(n);
for (let i = 0; i < n; i++) samples[i] = buf.readInt16LE(dataOffset + i * 2);

const duration = n / sampleRate;

// ---- envelope RMS (janelas de 10 ms) --------------------------------------
const hop = Math.round(sampleRate * 0.01);
const env = [];
for (let i = 0; i + hop <= n; i += hop) {
  let acc = 0;
  for (let j = i; j < i + hop; j++) acc += samples[j] * samples[j];
  env.push(Math.sqrt(acc / hop));
}

const sorted = [...env].sort((a, b) => a - b);
const floor = sorted[Math.floor(sorted.length * 0.12)];
const peak = sorted[Math.floor(sorted.length * 0.97)];
const threshold = floor + 0.1 * (peak - floor);

const voiced = env.map((e) => e > threshold);

// fecha silêncios curtos (< 140 ms) para não picar palavras
for (let i = 0; i < voiced.length; ) {
  if (!voiced[i]) {
    let j = i;
    while (j < voiced.length && !voiced[j]) j++;
    if (i > 0 && j < voiced.length && j - i < 14) {
      for (let k = i; k < j; k++) voiced[k] = true;
    }
    i = j;
  } else i++;
}

// segmentos com no mínimo 80 ms
const phrases = [];
for (let i = 0; i < voiced.length; ) {
  if (voiced[i]) {
    let j = i;
    while (j < voiced.length && voiced[j]) j++;
    if (j - i >= 8) phrases.push({ start: i / 100, end: j / 100 });
    i = j;
  } else i++;
}

const pauses = [];
for (let k = 1; k < phrases.length; k++) {
  const len = +(phrases[k].start - phrases[k - 1].end).toFixed(2);
  pauses.push({
    at: +((phrases[k - 1].end + phrases[k].start) / 2).toFixed(2),
    len,
  });
}

const r = (v) => +v.toFixed(2);

console.log(`# ${input}`);
console.log(`# duração: ${duration.toFixed(4)}s · ${phrases.length} grupos de fala`);
console.log(`# fala de ${r(phrases[0].start)}s a ${r(phrases[phrases.length - 1].end)}s\n`);

console.log("export const PHRASES: Phrase[] = [");
for (const p of phrases) console.log(`  { start: ${r(p.start)}, end: ${r(p.end)} },`);
console.log("];\n");

console.log("// maiores pausas — bons pontos de corte entre cenas");
console.log("export const MAJOR_PAUSES = [");
for (const p of [...pauses].sort((a, b) => b.len - a.len).slice(0, 10).sort((a, b) => a.at - b.at)) {
  console.log(`  { at: ${p.at}, len: ${p.len} },`);
}
console.log("];");
