"""Cena 4: rastreia a curva Goiania -> Sao Paulo direto dos pixels da arte,
para o brilho que percorre a rota (e a caixa) seguirem o traco original."""
import json
import numpy as np
from PIL import Image

im = Image.open("referencias/imagens/657CF088-90FC-473B-924E-321761F4FEA5.png") \
        .convert("RGB").resize((1080, 1920), Image.LANCZOS)
a = np.asarray(im).astype(np.float32)

# "brancura": claro e pouco saturado -> so a linha, nao o mapa azul
mx, mn = a.max(axis=2), a.min(axis=2)
white = np.clip(mx - (mx - mn) * 2.2, 0, 255) * (mx / 255.0)

A = (578.0, 917.0)     # ponto Goiania
B = (1005.0, 1088.0)   # ponto Sao Paulo

pts, y = [], A[1]
for x in range(int(A[0]), int(B[0]) + 1, 3):
    lo, hi = int(max(0, y - 26)), int(min(1919, y + 26))
    win = white[lo:hi, x]
    # puxa para o alvo quando a caixa cobre o traco
    bias = np.exp(-((np.arange(lo, hi) - y) ** 2) / (2 * 17.0 ** 2))
    score = win * bias
    if score.max() > 26:
        y = 0.62 * y + 0.38 * (lo + float(np.argmax(score)))
    else:
        t = (x - A[0]) / (B[0] - A[0])
        y = 0.80 * y + 0.20 * (A[1] + (B[1] - A[1]) * t)
    pts.append((float(x), float(y)))

pts[-1] = B
# suavizacao (media movel) para tirar o serrilhado do rastreio
xs = np.array([p[0] for p in pts]); ys = np.array([p[1] for p in pts])
k = np.ones(9) / 9
ys = np.convolve(np.pad(ys, 4, mode="edge"), k, "valid")
ys[0], ys[-1] = A[1], B[1]

pts = [[round(float(x), 1), round(float(v), 1)] for x, v in zip(xs, ys)]
json.dump(dict(a=list(A), b=list(B), points=pts),
          open("public/layers/s4/route.json", "w"))
print(f"{len(pts)} pontos  y: {ys.min():.0f}..{ys.max():.0f}")
print("amostra:", pts[::20])

# conferencia visual
from PIL import ImageDraw
chk = im.copy(); d = ImageDraw.Draw(chk)
d.line([tuple(p) for p in pts], fill=(255, 0, 255), width=5)
chk.crop((450, 780, 1080, 1200)).save(
    "/tmp/claude-0/-home-user-teste/f702a868-82c8-5eea-a65e-0ad7013c3ec5/scratchpad/route.png")
