"""Emite APENAS a geometria das regioes (retangulos) que o Remotion usa para
mascarar/realcar. Nao recorta, nao grava e nao altera nenhuma imagem -
a arte usada no video e sempre o arquivo original de public/art/."""
import json
import numpy as np
from PIL import Image
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import specs
from detect import IMG, SRC, W, H, autogrow, auto_words

# janelas de tela e card: cantos MEDIDOS na arte (tools detecta a area clara
# dentro do celular), para a cortina casar com a inclinacao real
QUADS = json.load(open("public/art/quads.json"))

TXT = {"s1": ["h1", "h2"], "s2": ["sub"], "s3": ["h1", "h2", "sub"],
       "s4": ["h1", "h2", "s1", "s2", "s3", "s4"], "s5": ["h1", "h2"]}


def boxes(scene):
    im = Image.open(f"{SRC}/{IMG[scene]}").convert("RGB").resize((W, H), Image.LANCZOS)
    arr = np.array(im)
    out = []
    for L in specs.SPEC[scene]:
        bx = L["box"]
        if L.get("grow_to_ink"):
            bx = autogrow(arr, bx, L.get("maxpad", 26))
            lim = L.get("limit")
            if lim:
                bx = (max(bx[0], lim[0]), max(bx[1], lim[1]),
                      min(bx[2], lim[2]), min(bx[3], lim[3]))
        if L.get("auto") == "words":
            for i, wb in enumerate(auto_words(arr, bx, L.get("gap", 11)), 1):
                out.append((f"{L['name']}w{i}", wb))
        else:
            out.append((L["name"], bx))
    return out


lines = ["// GERADO POR tools/regions.py - somente geometria, nenhuma imagem",
         "export type Rect = { x: number; y: number; w: number; h: number };",
         "export type Surface = { quad: [number, number][]; rgb: string };",
         "export const R: Record<string, Record<string, Rect>> = {"]
surf = ["export const SURF: Record<string, Record<string, Surface>> = {"]

for sc in ["s1", "s2", "s3", "s4", "s5", "s6"]:
    im = Image.open(f"{SRC}/{IMG[sc]}").convert("RGB").resize((W, H), Image.LANCZOS)
    arr = np.array(im)
    items = []
    for name, (x0, y0, x1, y1) in boxes(sc):
        items.append(f'{name}:{{x:{x0},y:{y0},w:{x1-x0},h:{y1-y0}}}')
    lines.append(f"  {sc}: {{{', '.join(items)}}},")

    si = []
    for name, d in QUADS.get(sc, {}).items():
        pts = ", ".join(f"[{round(px,1)},{round(py,1)}]" for px, py in d["quad"])
        r, g, b = d["rgb"]
        si.append(f'{name}:{{quad:[{pts}],rgb:"rgb({r},{g},{b})"}}')
    surf.append(f"  {sc}: {{{', '.join(si)}}},")
    print(sc, len(items), "regioes,", len(si), "superficies")

lines.append("};")
surf.append("};")

bd = json.load(open("public/art/backdrop.json"))
grad = ["export const BACKDROP: Record<string, string> = {"]
for sc, m in bd.items():
    stops = ", ".join(
        f'rgb({s["rgb"][0]},{s["rgb"][1]},{s["rgb"][2]}) {int(s["at"]*100)}%'
        for s in m["stops"])
    grad.append(f'  {sc}: "linear-gradient(180deg, {stops})",')
grad.append("};")

open("src/regions.gen.ts", "w").write(
    "\n".join(lines + [""] + surf + [""] + grad) + "\n")
print("-> src/regions.gen.ts")
