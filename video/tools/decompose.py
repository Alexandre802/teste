#!/usr/bin/env python3
"""
Decompoe as artes de referencia em camadas.

Para cada cena de interface geramos:
  - <cena>-plate.png : a arte original com os elementos removidos
                       (o buraco e preenchido por extensao das bordas + blur,
                       o que funciona bem porque os fundos sao gradientes lisos)
  - <cena>-<id>.png  : cada elemento recortado com mascara de canto arredondado

Assim o layout e a textura sao exatamente os da arte, mas cada elemento
continua sendo uma camada independente para animar no Remotion.

Tudo sai em 2x (LANCZOS) para o render em 1080x1920 reamostrar limpo.
"""
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "..", "..", "referencias", "imagens")
OUT = os.path.join(HERE, "..", "public", "plates")

SCALE = 2.0  # fator de reamostragem das camadas

# Margem extra por elemento. O recorte precisa levar junto a sombra
# projetada; sem isso a sombra fica no plate e aparece como um retangulo
# claro atras do elemento quando ele flutua.
PAD = {
    "logo": 14,
    "title": 14,
    "sub": 14,
    # o card de resultado tem um halo verde amplo na arte: a margem
    # precisa alcanca-lo, senao sobra um anel do preenchimento do plate
    "cardResult": 60,
    "cardRest": 46,
}
PAD_FREE = 18  # notas, linhas — recortes soltos sobre fundo claro
PAD_DEFAULT = 24

# A mascara fica opaca ate quase a borda da caixa: o recorte precisa cobrir
# exatamente o buraco que o plate apagou, senao o preenchimento aparece
# como um anel em volta do elemento.
FEATHER = 6

# Caixas medidas sobre as artes originais (941x1672).
# (x0, y0, x1, y1, raio_do_canto)
SCENES = {
    "caos": {
        "file": "5F0A4926-BA0B-49C5-8626-D2B40D37A110.png",
        # numeros: saem de dentro dos cards (fundo branco) para poderem rolar
        "nested": {
            "numIn": (140, 892, 400, 968, 0, (255, 255, 255)),
            "numOut": (548, 892, 812, 968, 0, (255, 255, 255)),
            "numResult": (372, 1366, 590, 1432, 0, (255, 255, 255)),
        },
        "elements": {
            # colunas translucidas do fundo, que sobem
            "bars": (286, 292, 790, 936, 0),
            # linhas de tendencia do fundo (a verde caindo, a vermelha subindo)
            "trend": (0, 228, 941, 545, 0),
            # cedulas espalhadas — cada uma vira uma camada com deriva propria
            "note1": (470, 150, 715, 415, 0),
            "note2": (108, 505, 300, 618, 0),
            "note3": (0, 515, 120, 618, 0),
            "note4": (0, 1050, 250, 1300, 0),
            "note5": (760, 1370, 941, 1580, 0),
            "note6": (858, 1110, 941, 1250, 0),
            "logo": (80, 112, 380, 198, 0),
            "cardIn": (110, 626, 428, 1042, 46),
            "cardOut": (518, 626, 840, 1042, 46),
            "cardResult": (346, 1150, 614, 1508, 46),
        },
    },
    "operacao": {
        "file": "E0DC9E01-269F-49F1-9848-AD7A3166FE2F.png",
        "nested": {
            "num1": (168, 908, 400, 986, 0, (10, 46, 39)),
            "num2": (588, 908, 820, 986, 0, (10, 46, 39)),
            "numL": (232, 1300, 438, 1358, 0, (9, 42, 36)),
            "numR": (612, 1300, 782, 1358, 0, (9, 42, 36)),
        },
        "elements": {
            # colunas de vidro do fundo (sobem) e a estrela do canto (gira)
            "cols": (430, 96, 941, 560, 0),
            "star": (0, 262, 196, 486, 0),
            "wires": (196, 1090, 760, 1250, 0),
            "logo": (52, 98, 410, 196, 0),
            "title": (235, 292, 740, 388, 0),
            "card1": (80, 512, 450, 1100, 40),
            "card2": (500, 512, 866, 1100, 40),
            "statL": (112, 1232, 460, 1378, 26),
            "statR": (484, 1232, 826, 1378, 26),
        },
    },
    "periodo": {
        "file": "5E1A6311-5E30-42B3-8096-D854D854D4DD.png",
        "elements": {
            "logo": (62, 178, 352, 272, 0),
            "chipTop": (482, 454, 838, 530, 38),
            "tab0": (70, 600, 212, 682, 41),
            "tab1": (226, 600, 386, 682, 41),
            "tab2": (400, 600, 540, 682, 41),
            "tab3": (556, 600, 702, 682, 41),
            "tab4": (718, 600, 858, 682, 41),
            "chipBottom": (572, 1422, 838, 1498, 38),
            # a seta luminosa do fundo, com os nos e as hastes
            "arrow": (0, 618, 941, 1330, 0),
            "mJan": (34, 1322, 108, 1378, 0),
            "mFev": (182, 1322, 258, 1378, 0),
            "mMar": (316, 1322, 394, 1378, 0),
            "mAbr": (474, 1322, 552, 1378, 0),
            "mMai": (628, 1322, 706, 1378, 0),
            "mJun": (764, 1322, 842, 1378, 0),
        },
    },
    "phone": {
        "file": "133BCCC2-5D93-4FE2-8763-C59A943458A1.png",
        # conteudo da tela: recortado de dentro do aparelho, que fica branco
        "nested": {
            "scrGreet": (292, 486, 512, 560, 0, (255, 255, 255)),
            "scrTotal": (292, 572, 674, 688, 0, (255, 255, 255)),
            "scrSkel": (292, 698, 674, 776, 0, (255, 255, 255)),
            "scrChart": (290, 804, 676, 1078, 0, (255, 255, 255)),
            "scrRows": (290, 1078, 676, 1298, 0, (255, 255, 255)),
            "scrNav": (280, 1300, 686, 1358, 0, (255, 255, 255)),
            "chipChart": (30, 616, 278, 762, 0, (255, 255, 255)),
        },
        "elements": {
            "logo": (58, 52, 328, 132, 0),
            "title": (340, 252, 648, 315, 0),
            "phone": (266, 336, 698, 1434, 62),
            "chipLeft": (22, 564, 286, 784, 30),
            "badgeRight": (648, 912, 906, 1112, 30),
        },
    },
    "previsao": {
        "file": "934F3467-1214-4325-82FB-EA619BEFDCFB.png",
        "nested": {
            "chartLine": (92, 636, 876, 1030, 0, (255, 255, 255)),
        },
        "elements": {
            "logo": (48, 58, 316, 138, 0),
            "title": (72, 328, 316, 432, 0),
            "sub": (72, 444, 320, 512, 0),
            "calendar": (572, 278, 884, 576, 22),
            "chart": (60, 584, 880, 1092, 30),
            "assistant": (66, 1100, 430, 1306, 22),
            "goal": (448, 1100, 882, 1360, 22),
            "pillL": (122, 1396, 366, 1500, 22),
            "pillR": (390, 1396, 716, 1500, 22),
        },
    },
    "tudoum": {
        "file": "E58E53D7-0A8F-4D72-A326-B81F80680365.png",
        "nested": {
            "numIn": (96, 900, 330, 968, 0, (255, 255, 255)),
            "numOut": (330, 1390, 578, 1462, 0, (255, 255, 255)),
            "numRest": (556, 752, 812, 826, 0, (255, 255, 255)),
        },
        "elements": {
            # barras 3D e a seta do rodape — sobem depois dos cards
            "iso": (0, 930, 941, 1672, 0),
            "logo": (78, 96, 402, 182, 0),
            "title": (272, 260, 678, 320, 0),
            "cardIn": (76, 606, 346, 1018, 30),
            "cardOut": (312, 1084, 592, 1528, 30),
            "cardRest": (532, 392, 878, 912, 34),
        },
    },
}


def padded_mask(w, h, radius, pad):
    """
    Mascara do elemento dentro de uma caixa com margem.

    A area opaca vai ate FEATHER pixels da borda da caixa, de modo que o
    recorte cubra todo o buraco aberto no plate — inclusive a sombra e o
    halo do elemento. So a franja final e suavizada.
    """
    f = FEATHER if pad > 0 else 0
    grow = max(0, pad - f)
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    box = [pad - grow, pad - grow, w - 1 - pad + grow, h - 1 - pad + grow]
    if radius > 0:
        d.rounded_rectangle(box, radius=radius + grow, fill=255)
    else:
        d.rectangle(box, fill=255)
    return m.filter(ImageFilter.GaussianBlur(max(1.0, f * 0.8)))


def fill_hole(arr, box, pad=6):
    """
    Preenche a regiao com uma interpolacao das bordas vizinhas.
    Os fundos destas artes sao gradientes suaves, entao a extensao de
    borda + blur reconstroi o fundo de forma convincente.
    """
    x0, y0, x1, y1 = box
    H, W = arr.shape[:2]
    sx0, sy0 = max(0, x0 - pad), max(0, y0 - pad)
    sx1, sy1 = min(W, x1 + pad), min(H, y1 + pad)

    top = arr[max(0, sy0 - pad) : sy0 + 1, sx0:sx1].mean(axis=0)
    bot = arr[sy1 - 1 : min(H, sy1 + pad), sx0:sx1].mean(axis=0)
    left = arr[sy0:sy1, max(0, sx0 - pad) : sx0 + 1].mean(axis=1)
    right = arr[sy0:sy1, sx1 - 1 : min(W, sx1 + pad)].mean(axis=1)

    h, w = sy1 - sy0, sx1 - sx0
    ty = np.linspace(0, 1, h)[:, None, None]
    tx = np.linspace(0, 1, w)[None, :, None]

    vert = top[None, :, :] * (1 - ty) + bot[None, :, :] * ty
    horiz = left[:, None, :] * (1 - tx) + right[:, None, :] * tx
    arr[sy0:sy1, sx0:sx1] = vert * 0.5 + horiz * 0.5
    return arr


def fill_solid(arr, box, color):
    x0, y0, x1, y1 = box
    arr[y0:y1, x0:x1] = np.array(color, dtype=np.float32)
    return arr


def save(im, name):
    im = im.resize(
        (int(round(im.width * SCALE)), int(round(im.height * SCALE))), Image.LANCZOS
    )
    im.save(os.path.join(OUT, name))
    return im.size


def main():
    os.makedirs(OUT, exist_ok=True)
    manifest = {}

    for scene, cfg in SCENES.items():
        src = Image.open(os.path.join(REF, cfg["file"])).convert("RGB")
        W, H = src.size
        layers = {}
        k = 1080.0 / W

        # 1) elementos aninhados: saem de dentro de um elemento maior (ex.: o
        #    grafico dentro da tela do celular). Recortamos da arte original e
        #    apagamos a regiao com a cor de fundo do pai, para o pai virar uma
        #    "casca" vazia.
        work = np.asarray(src).astype(np.float32).copy()
        for name, (x0, y0, x1, y1, r, fill) in cfg.get("nested", {}).items():
            crop = src.crop((x0, y0, x1, y1)).convert("RGBA")
            crop.putalpha(padded_mask(x1 - x0, y1 - y0, r, 0))
            save(crop, f"{scene}-{name}.png")
            layers[name] = {
                "x": round(x0 * k, 1), "y": round(y0 * k, 1),
                "w": round((x1 - x0) * k, 1), "h": round((y1 - y0) * k, 1),
            }
            work = fill_solid(work, (x0, y0, x1, y1), fill)
        work_im = Image.fromarray(np.clip(work, 0, 255).astype(np.uint8))

        plate = work.copy()
        for name, (x0, y0, x1, y1, r) in cfg["elements"].items():
            pad = PAD.get(
                name,
                PAD_FREE
                if name.startswith(
                    ("note", "trend", "arrow", "m", "bars", "iso", "cols", "star", "wires")
                )
                else PAD_DEFAULT,
            )
            bx0, by0 = max(0, x0 - pad), max(0, y0 - pad)
            bx1, by1 = min(W, x1 + pad), min(H, y1 + pad)
            crop = work_im.crop((bx0, by0, bx1, by1)).convert("RGBA")
            crop.putalpha(padded_mask(bx1 - bx0, by1 - by0, r, pad))
            save(crop, f"{scene}-{name}.png")
            layers[name] = {
                "x": round(bx0 * k, 1),
                "y": round(by0 * k, 1),
                "w": round((bx1 - bx0) * k, 1),
                "h": round((by1 - by0) * k, 1),
            }
            plate = fill_hole(plate, (bx0, by0, bx1, by1))

        pl = Image.fromarray(np.clip(plate, 0, 255).astype(np.uint8))
        pl = pl.filter(ImageFilter.GaussianBlur(0.6))
        size = save(pl, f"{scene}-plate.png")
        manifest[scene] = {"plate": f"{scene}-plate.png", "layers": layers}
        print(f"{scene:9s} plate {size[0]}x{size[1]}  camadas: {len(layers)}")

    with open(os.path.join(OUT, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print("manifest.json escrito")


if __name__ == "__main__":
    main()
