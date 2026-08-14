#!/usr/bin/env python3
"""
Extrai elementos rasterizados das imagens de referencia para uso como camadas
independentes no Remotion.

Estrategia:
  - "soft"  -> recorte com mascara de bordas suaves (para elementos que ficam
               sobre fundo claro identico ao fundo reconstruido da cena)
  - "key"   -> remove o fundo claro por luminancia/saturacao (para elementos
               coloridos e saturados, ex.: verdes 3D)
Tudo e reamostrado com LANCZOS em 2x para render nativo em 1080x1920.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "..", "..", "referencias", "imagens")
OUT = os.path.join(HERE, "..", "public", "cutouts")

SRC = {
    "ia": "934F3467-1214-4325-82FB-EA619BEFDCFB.png",
    "cards3d": "E58E53D7-0A8F-4D72-A326-B81F80680365.png",
    "chaos": "5F0A4926-BA0B-49C5-8626-D2B40D37A110.png",
    "dark": "E0DC9E01-269F-49F1-9848-AD7A3166FE2F.png",
}


def load(key):
    return Image.open(os.path.join(REF, SRC[key])).convert("RGBA")


def soft_mask(size, feather, inset=0):
    """Mascara retangular com cantos e bordas suavizadas."""
    w, h = size
    m = Image.new("L", (w, h), 0)
    px = np.zeros((h, w), dtype=np.uint8)
    px[inset:h - inset, inset:w - inset] = 255
    m = Image.fromarray(px)
    return m.filter(ImageFilter.GaussianBlur(feather))


def cut_soft(img, box, name, feather=14, scale=2.0):
    crop = img.crop(box)
    m = soft_mask(crop.size, feather, inset=int(feather * 0.9))
    crop.putalpha(m)
    save(crop, name, scale)


def cut_key(img, box, name, scale=2.0, lum_hi=232, sat_min=16, blur=1.1, grow=0.0):
    """Remove fundo claro/dessaturado, mantendo pixels escuros ou saturados."""
    crop = img.crop(box)
    a = np.asarray(crop).astype(np.float32)
    rgb = a[..., :3]
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    sat = mx - mn
    lum = rgb.mean(axis=2)

    # alpha por escuridao
    al_dark = np.clip((lum_hi - lum) / 42.0, 0, 1)
    # alpha por saturacao (verdes/vermelhos do render 3D)
    al_sat = np.clip((sat - sat_min) / 26.0, 0, 1)
    alpha = np.clip(np.maximum(al_dark, al_sat) * (1.0 + grow), 0, 1)

    am = Image.fromarray((alpha * 255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(blur)
    )
    crop.putalpha(am)
    save(crop, name, scale)


def save(im, name, scale):
    if scale != 1.0:
        im = im.resize(
            (int(im.width * scale), int(im.height * scale)), Image.LANCZOS
        )
    path = os.path.join(OUT, name)
    im.save(path)
    print(f"  {name:22s} {im.width}x{im.height}")


def main():
    """
    Extrai apenas os dois elementos que nao compensa redesenhar.

    Todo o resto do reel (tipografia, cards, chips, graficos, calendario,
    numeros, icones, conectores, barras 3D, cedulas) e reconstruido em
    vetor/DOM dentro do Remotion, o que rende nitidez nativa em 1080x1920
    e permite animar cada elemento separadamente.
    """
    os.makedirs(OUT, exist_ok=True)
    print(f"Extraindo cutouts para {OUT}")

    # robo do "Assistente IA" — render 3D, dificil de reproduzir em vetor
    cut_soft(load("ia"), (46, 1080, 187, 1326), "robot.png", feather=10)

    # malha de pontos luminosa do rodape da cena escura
    cut_soft(load("dark"), (0, 1428, 941, 1672), "dark-mesh.png", feather=8)

    print("Concluido.")


if __name__ == "__main__":
    main()
