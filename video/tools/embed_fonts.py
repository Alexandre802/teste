"""Regera src/lib/interFonts.ts a partir dos woff2 em public/fonts.

Uso: python3 tools/embed_fonts.py
"""
import base64
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")
WEIGHTS = [400, 500, 600, 700, 800, 900]

HEADER = """/**
 * Inter (subset latin) embutida em base64.
 *
 * Gerada por `tools/embed_fonts.py`. Ficam inline porque, durante o render,
 * requisições de rede paralelas às fontes podem emperrar e estourar o
 * delayRender — data URI elimina essa classe de falha.
 */
export const INTER_WOFF2: Record<number, string> = {
"""

if __name__ == "__main__":
    rows = []
    for w in WEIGHTS:
        path = os.path.join(ROOT, "public", "fonts", f"inter-latin-{w}-normal.woff2")
        with open(path, "rb") as fh:
            rows.append(f"  {w}: '{base64.b64encode(fh.read()).decode()}',")
    out = os.path.join(ROOT, "src", "lib", "interFonts.ts")
    with open(out, "w") as fh:
        fh.write(HEADER + "\n".join(rows) + "\n};\n")
    print(f"escrito {out} ({os.path.getsize(out) // 1024} KB)")
