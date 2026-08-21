"""
Fatiador de referencias -> camadas independentes para o Remotion.

Pipeline por cena (ordem importa: filhos primeiro, pais depois):
  1. recorta o sprite (com margem + alpha feathered nas bordas)
  2. tapa o buraco na tela de trabalho (Laplace fill / repeticao de linha)
  3. o que sobra vira a placa de fundo (bg.jpg)

Assim cada elemento pode ser animado sozinho sem deixar rastro do original.
"""
import json, os
import numpy as np
from PIL import Image, ImageFilter

SRC = "referencias/imagens"
OUT = "public/layers"
W, H = 1080, 1920

IMG = {
    "s1": "35D36C5E-96BB-4D7D-B8A8-388B8AD56F9D.png",
    "s2": "EA922747-51B7-400C-9229-492897FEB9B3.png",
    "s3": "F81E8B52-367A-40D7-A96E-B60F2D89EE41.png",
    "s4": "657CF088-90FC-473B-924E-321761F4FEA5.png",
    "s5": "E52415DD-6AAC-4C2C-B986-0B63526F6FF3.png",
    "s6": "4507B56B-C065-44A3-825C-FBE1B4C7EB9D.png",
}


def laplace_fill(arr, box, ring=14, iters=900, dark=0):
    """Preenche o retangulo interpolando a partir da moldura ao redor.
    Suave o bastante para gradientes (o fundo azul) ficarem sem emenda."""
    x0, y0, x1, y1 = box
    ex0, ey0 = max(0, x0 - ring), max(0, y0 - ring)
    ex1, ey1 = min(arr.shape[1], x1 + ring), min(arr.shape[0], y1 + ring)
    region = arr[ey0:ey1, ex0:ex1].astype(np.float32)
    h, w = region.shape[:2]

    mask = np.zeros((h, w), bool)
    mask[y0 - ey0:y1 - ey0, x0 - ex0:x1 - ex0] = True

    # trabalha em baixa resolucao: converge rapido e gera gradiente macio
    sf = max(1, int(max(h, w) / 120))
    if sf > 1:
        small = np.array(Image.fromarray(region.astype(np.uint8)).resize(
            (max(2, w // sf), max(2, h // sf)), Image.BILINEAR), np.float32)
        smask = np.array(Image.fromarray((mask * 255).astype(np.uint8)).resize(
            (small.shape[1], small.shape[0]), Image.BILINEAR)) > 100
    else:
        small, smask = region.copy(), mask.copy()

    if smask.all():
        smask[0, :] = smask[-1, :] = smask[:, 0] = smask[:, -1] = False

    known = ~smask
    if known.sum() == 0:
        return
    if dark:
        # o halo do elemento deixava a moldura clara e o buraco virava um
        # borrao esbranquicado; limitar ao percentil baixo devolve o azul.
        cap = np.percentile(small[known], dark, axis=0)
        small = np.minimum(small, cap)
    seed = small[known].mean(axis=0)
    work = small.copy()
    work[smask] = seed

    for _ in range(iters):
        nb = np.zeros_like(work)
        nb[1:-1, 1:-1] = (work[:-2, 1:-1] + work[2:, 1:-1] +
                          work[1:-1, :-2] + work[1:-1, 2:]) * 0.25
        nb[0], nb[-1], nb[:, 0], nb[:, -1] = work[0], work[-1], work[:, 0], work[:, -1]
        work[smask] = nb[smask]

    filled = work if sf == 1 else np.array(
        Image.fromarray(np.clip(work, 0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC),
        np.float32)
    out = region.copy()
    out[mask] = filled[mask]
    arr[ey0:ey1, ex0:ex1] = np.clip(out, 0, 255).astype(np.uint8)


def autogrow(arr, box, maxpad=26, thr=70, quiet=2):
    """Cresce a caixa ate a tinta acabar dos quatro lados.
    Evita o erro de estimar a olho e deixar rabo de texto para tras -
    uma linha do fundo da tela e quase uniforme; uma com texto nao e."""
    x0, y0, x1, y1 = box
    H_, W_ = arr.shape[:2]

    def inked(line):
        f = line.astype(np.float32)
        return float(np.abs(f - np.median(f, axis=0)).max()) > thr

    for _ in range(maxpad):
        if y0 > 0 and any(inked(arr[y0 - 1 - k, x0:x1])
                          for k in range(min(quiet, y0))):
            y0 -= 1
        else:
            break
    for _ in range(maxpad):
        if y1 < H_ and any(inked(arr[min(H_ - 1, y1 + k), x0:x1])
                           for k in range(quiet)):
            y1 += 1
        else:
            break
    for _ in range(maxpad):
        if x0 > 0 and any(inked(arr[y0:y1, x0 - 1 - k])
                          for k in range(min(quiet, x0))):
            x0 -= 1
        else:
            break
    for _ in range(maxpad):
        if x1 < W_ and any(inked(arr[y0:y1, min(W_ - 1, x1 + k)])
                           for k in range(quiet)):
            x1 += 1
        else:
            break
    return (x0, y0, x1, y1)


def paper_fill(arr, box, limit, pct=85):
    """Preenche com a "cor do papel" da tela: percentil alto ao longo de toda
    a largura util da tela, linha a linha. Pega o branco (que domina) e
    acompanha o degrade da inclinacao do celular, sem depender de sobrar
    espaco limpo ao lado da caixa."""
    x0, y0, x1, y1 = box
    lx0, _, lx1, _ = limit
    band = arr[y0:y1, lx0:lx1].astype(np.float32)
    col = np.percentile(band, pct, axis=1)              # (h, 3)
    k = 15
    pad = np.pad(col, ((k // 2, k // 2), (0, 0)), mode="edge")
    sm = np.stack([np.convolve(pad[:, c], np.ones(k) / k, "valid") for c in range(3)], 1)
    arr[y0:y1, x0:x1] = np.clip(sm, 0, 255).astype(np.uint8)[:, None, :]


def flat_fill(arr, box, strip=16, pct=82):
    """Preenche linha a linha a partir dos vizinhos da ESQUERDA e da DIREITA,
    usando percentil alto em vez de mediana: assim pega o branco da tela e
    ignora a moldura escura do celular quando a caixa encosta na borda."""
    x0, y0, x1, y1 = box
    lx0 = max(0, x0 - strip)
    rx1 = min(arr.shape[1], x1 + strip)
    left = arr[y0:y1, lx0:x0]
    right = arr[y0:y1, x1:rx1]
    sides = np.concatenate([left, right], axis=1).astype(np.float32)
    if sides.shape[1] == 0:
        return
    med = np.percentile(sides, pct, axis=1)             # (h, 3)
    # suaviza no eixo vertical para nao herdar ruido linha a linha
    k = 9
    pad = np.pad(med, ((k // 2, k // 2), (0, 0)), mode="edge")
    sm = np.stack([np.convolve(pad[:, c], np.ones(k) / k, "valid") for c in range(3)], 1)
    arr[y0:y1, x0:x1] = np.clip(sm, 0, 255).astype(np.uint8)[:, None, :]


def row_fill(arr, box, src="up", pad=6):
    """Repete a linha logo acima/abaixo do buraco. Ideal para listas de app
    (fundo branco liso da tela do celular)."""
    x0, y0, x1, y1 = box
    if src == "up":
        line = arr[max(0, y0 - pad):max(1, y0 - pad + 1), x0:x1]
    else:
        line = arr[min(arr.shape[0] - 1, y1 + pad):min(arr.shape[0], y1 + pad + 1), x0:x1]
    arr[y0:y1, x0:x1] = np.repeat(line, y1 - y0, axis=0)


def feather_alpha(w, h, f):
    """Alpha 255 no miolo caindo para 0 nas bordas -> sprite sem costura."""
    if f <= 0:
        return np.full((h, w), 255, np.uint8)
    ax = np.ones(w, np.float32)
    ay = np.ones(h, np.float32)
    ramp = np.linspace(0, 1, f + 2)[1:-1]
    n = min(f, w // 2)
    ax[:n], ax[-n:] = ramp[:n], ramp[:n][::-1]
    n = min(f, h // 2)
    ay[:n], ay[-n:] = ramp[:n], ramp[:n][::-1]
    return (np.outer(ay, ax) * 255).astype(np.uint8)


def auto_words(arr, box, min_gap=11, pad=7):
    """Acha as palavras dentro de uma faixa de texto olhando o contraste
    por coluna. Evita chutar coordenadas de cada palavra na mao."""
    x0, y0, x1, y1 = box
    band = arr[y0:y1, x0:x1].astype(np.float32)
    lum = band.mean(axis=2)
    bg = np.median(lum)
    diff = np.abs(lum - bg)
    thr = max(28.0, diff.max() * 0.30)
    col = (diff > thr).sum(axis=0)
    on = col > max(2, (y1 - y0) * 0.02)

    runs, start = [], None
    for i, v in enumerate(on):
        if v and start is None:
            start = i
        elif not v and start is not None:
            runs.append((start, i)); start = None
    if start is not None:
        runs.append((start, len(on)))
    if not runs:
        return [box]

    # junta pedacos separados por vao pequeno (letras da mesma palavra)
    merged = [list(runs[0])]
    for a, b in runs[1:]:
        if a - merged[-1][1] < min_gap:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    merged = [m for m in merged if m[1] - m[0] > 8]
    if not merged:
        return [box]

    out = []
    for i, (a, b) in enumerate(merged):
        la = x0 + a - pad if i == 0 else x0 + (merged[i - 1][1] + a) // 2
        rb = x0 + b + pad if i == len(merged) - 1 else x0 + (b + merged[i + 1][0]) // 2
        out.append((max(x0 - pad, la), y0, min(x1 + pad, rb), y1))
    return out


def build(scene, spec):
    d = f"{OUT}/{scene}"
    os.makedirs(d, exist_ok=True)
    base = Image.open(f"{SRC}/{IMG[scene]}").convert("RGB").resize((W, H), Image.LANCZOS)
    work = np.array(base)
    # pixels ja pertencentes a um sprite anterior: um recorte posterior nao
    # pode leva-los junto (senao carrega o remendo do vizinho quando se move)
    claimed = np.zeros((H, W), bool)
    manifest = []

    expanded = []
    for L in spec:
        if L.get("auto") == "words":
            for i, wb in enumerate(auto_words(work, L["box"], L.get("gap", 11)), 1):
                w = dict(L); w.pop("auto"); w.pop("gap", None)
                w["name"], w["box"] = f"{L['name']}w{i}", wb
                expanded.append(w)
        else:
            expanded.append(L)
    spec = expanded

    for L in spec:
        if L.get("grow_to_ink"):
            L = dict(L)
            g = autogrow(work, L["box"], L.get("maxpad", 26))
            lim = L.get("limit")
            if lim:   # nao deixa vazar para fora da tela do celular
                g = (max(g[0], lim[0]), max(g[1], lim[1]),
                     min(g[2], lim[2]), min(g[3], lim[3]))
            L["box"] = g
        x0, y0, x1, y1 = L["box"]
        pad = L.get("pad", 0)
        x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
        x1, y1 = min(W, x1 + pad), min(H, y1 + pad)
        f = L.get("feather", 10)

        sprite = work[y0:y1, x0:x1].copy()
        a = feather_alpha(x1 - x0, y1 - y0, f)
        for side, on in (("l", 0), ("t", 1), ("r", 2), ("b", 3)):
            pass
        # bordas coladas na moldura do quadro nao precisam de fade
        hard = L.get("hard", "")
        if "l" in hard: a[:, :f] = np.maximum(a[:, :f], a[:, f:f+1])
        if "r" in hard: a[:, -f:] = np.maximum(a[:, -f:], a[:, -f-1:-f])
        if "t" in hard: a[:f, :] = np.maximum(a[:f, :], a[f:f+1, :])
        if "b" in hard: a[-f:, :] = np.maximum(a[-f:, :], a[-f-1:-f, :])

        # apaga do alpha o que ja e de outro sprite, com uma borda macia
        cut = claimed[y0:y1, x0:x1]
        if cut.any():
            soft = np.array(Image.fromarray(((~cut) * 255).astype(np.uint8))
                            .filter(ImageFilter.GaussianBlur(3)))
            a = (a.astype(np.float32) * (soft / 255.0)).astype(np.uint8)

        rgba = np.dstack([sprite, a])
        Image.fromarray(rgba, "RGBA").save(f"{d}/{L['name']}.png")
        manifest.append({"name": L["name"], "x": x0, "y": y0,
                         "w": x1 - x0, "h": y1 - y0})

        mode = L.get("fill", "laplace")
        hard = L.get("hard", "")
        fb = (x0 if "l" in hard else x0 + f, y0 if "t" in hard else y0 + f,
              x1 if "r" in hard else x1 - f, y1 if "b" in hard else y1 - f)
        if mode == "laplace":
            laplace_fill(work, fb, ring=L.get("ring", 14), dark=L.get("dark", 0))
        elif mode == "flat":
            lim = L.get("limit")
            if lim:
                paper_fill(work, fb, lim)
            else:
                flat_fill(work, fb)
        elif mode in ("up", "down"):
            row_fill(work, fb, mode)
        elif mode == "none":
            pass
        # so quem e marcado "exclusive" corta os sprites seguintes. As telas
        # de app precisam manter o preenchimento branco ate o item chegar.
        if L.get("exclusive"):
            claimed[fb[1]:fb[3], fb[0]:fb[2]] = True

    bg = Image.fromarray(work)
    if any(l.get("smooth_bg") for l in spec):
        bg = bg.filter(ImageFilter.GaussianBlur(0.4))
    bg.save(f"{d}/bg.jpg", quality=94, subsampling=0)

    with open(f"{d}/layers.json", "w") as fp:
        json.dump(manifest, fp, indent=1)
    print(f"{scene}: {len(manifest)} camadas -> {d}")
    return manifest


if __name__ == "__main__":
    import specs
    os.makedirs(OUT, exist_ok=True)
    for s in ["s1", "s2", "s3", "s4", "s5", "s6"]:
        build(s, specs.SPEC[s])

    # manifesto tipado para o Remotion importar sem fetch
    import textwrap
    lines = ["// GERADO POR tools/slice.py - nao editar a mao",
             "export type LayerBox = { name: string; x: number; y: number; w: number; h: number };",
             "export const LAYERS: Record<string, LayerBox[]> = {"]
    for sc in ["s1", "s2", "s3", "s4", "s5", "s6"]:
        m = json.load(open(f"{OUT}/{sc}/layers.json"))
        items = ", ".join(
            f'{{name:"{l["name"]}",x:{l["x"]},y:{l["y"]},w:{l["w"]},h:{l["h"]}}}' for l in m)
        lines.append(f"  {sc}: [{items}],")
    lines.append("};")
    os.makedirs("src", exist_ok=True)
    open("src/layers.gen.ts", "w").write("\n".join(lines) + "\n")
    print("src/layers.gen.ts")
