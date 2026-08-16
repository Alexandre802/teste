#!/usr/bin/env python3
"""
Gera src/lib/fontData.ts com as fontes embutidas em base64.

Embutir evita a requisição de rede no meio do render — servindo por
staticFile(), uma das abas do Chromium pode ficar pendurada esperando o
arquivo e derrubar o render inteiro por timeout do delayRender().

Rodar após trocar de fonte ou incluir um novo peso:
    python3 tools/embed_fonts.py
"""
import base64
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# apenas os pesos realmente usados nos componentes
WANTED = [
    ("Archivo", "700", "archivo-latin-700-normal.woff2"),
    ("Archivo", "900", "archivo-latin-900-normal.woff2"),
    ("Inter", "400", "inter-latin-400-normal.woff2"),
    ("Inter", "500", "inter-latin-500-normal.woff2"),
    ("Inter", "600", "inter-latin-600-normal.woff2"),
    ("Inter", "700", "inter-latin-700-normal.woff2"),
]

HEADER = """/**
 * Fontes embutidas como data URI.
 *
 * Gerado por tools/embed_fonts.py — não editar à mão.
 * Embutir em vez de servir por staticFile() elimina a requisição de rede
 * durante o render: sem fetch, nenhuma aba pode ficar pendurada esperando
 * a fonte (era a causa do render falhar no meio).
 */

export type EmbeddedFace = { family: string; weight: string; src: string };

export const EMBEDDED_FACES: EmbeddedFace[] = [
"""


def main():
    lines = [HEADER]
    total = 0
    for family, weight, fname in WANTED:
        raw = (ROOT / "public" / "fonts" / fname).read_bytes()
        b64 = base64.b64encode(raw).decode()
        total += len(b64)
        lines.append(
            f'  {{ family: "{family}", weight: "{weight}", '
            f'src: "data:font/woff2;base64,{b64}" }},'
        )
    lines.append("];")
    lines.append("")

    out = ROOT / "src" / "lib" / "fontData.ts"
    out.write_text("\n".join(lines))
    print(f"{os.path.relpath(out, ROOT)}  {total / 1024:.0f} KB, {len(WANTED)} fontes")


if __name__ == "__main__":
    main()
