"""Deteccao de regioes na arte: acha os limites reais de cada elemento e
separa as palavras dos titulos. Somente LEITURA - nao grava nem altera
nenhuma imagem."""
import numpy as np
from PIL import Image

SRC = "referencias/imagens"
W, H = 1080, 1920

IMG = {
    "s1": "35D36C5E-96BB-4D7D-B8A8-388B8AD56F9D.png",
    "s2": "EA922747-51B7-400C-9229-492897FEB9B3.png",
    "s3": "F81E8B52-367A-40D7-A96E-B60F2D89EE41.png",
    "s4": "657CF088-90FC-473B-924E-321761F4FEA5.png",
    "s5": "E52415DD-6AAC-4C2C-B986-0B63526F6FF3.png",
    "s6": "4507B56B-C065-44A3-825C-FBE1B4C7EB9D.png",
}


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
