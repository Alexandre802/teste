"""Prepara a arte SEM alterar nada: apenas redimensiona para a resolucao de
saida (1080x1920) e mede as cores de fundo, que servem de cortina nas
revelacoes. Nenhum pixel da arte e recriado, borrado ou apagado."""
import json, os
import numpy as np
from PIL import Image

SRC = "referencias/imagens"
OUT = "public/art"
W, H = 1080, 1920

IMG = {
    "s1": "35D36C5E-96BB-4D7D-B8A8-388B8AD56F9D.png",
    "s2": "EA922747-51B7-400C-9229-492897FEB9B3.png",
    "s3": "F81E8B52-367A-40D7-A96E-B60F2D89EE41.png",
    "s4": "657CF088-90FC-473B-924E-321761F4FEA5.png",
    "s5": "E52415DD-6AAC-4C2C-B986-0B63526F6FF3.png",
    "s6": "4507B56B-C065-44A3-825C-FBE1B4C7EB9D.png",
}

os.makedirs(OUT, exist_ok=True)
meta = {}
for sc, f in IMG.items():
    im = Image.open(f"{SRC}/{f}").convert("RGB").resize((W, H), Image.LANCZOS)
    im.save(f"{OUT}/{sc}.jpg", quality=96, subsampling=0)
    a = np.asarray(im).astype(np.float32)

    # amostra so as bordas laterais do quadro (fundo em todas as artes),
    # senao o conteudo claro do meio contamina a cortina
    edges = np.concatenate([a[:, :26], a[:, -26:]], axis=1)

    def band(y0, y1):
        return [int(v) for v in np.percentile(
            edges[y0:y1].reshape(-1, 3), 35, axis=0)]

    stops = [0, 0.25, 0.5, 0.75, 1.0]
    meta[sc] = {"stops": [
        {"at": t, "rgb": band(int(t * (H - 140)), int(t * (H - 140)) + 140)}
        for t in stops
    ]}
    print(sc, [x['rgb'] for x in meta[sc]['stops']])

json.dump(meta, open(f"{OUT}/backdrop.json", "w"), indent=1)
