#!/usr/bin/env python3
"""
Texturas de acabamento (grão de filme, light leak, vinheta).

São o que separa um render "limpo demais / cara de IA" de uma peça com
textura de finalização. Saem em video/public/img/.

Rodar:  python3 tools/make_textures.py
"""
import os

import numpy as np
from PIL import Image, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "img")
rng = np.random.default_rng(7)


def film_grain(size=512):
    """Grão monocromático tileável, aplicado em overlay com opacidade baixa."""
    g = rng.normal(0.5, 0.16, (size, size))
    img = Image.fromarray(np.clip(g * 255, 0, 255).astype("uint8"), "L")
    img = img.filter(ImageFilter.GaussianBlur(0.45))
    # empilha em RGBA cinza com alfa constante — o blend fica no CSS
    a = np.array(img)
    a = (a // 4) * 4  # quantiza para comprimir melhor
    rgba = np.dstack([a, a, a, np.full_like(a, 255)])
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, "grain.png"), optimize=True)
    return "grain.png"


def light_leak(w=1080, h=1920):
    """Vazamento de luz roxo em diagonal, para sobrepor em screen."""
    yy, xx = np.mgrid[0:h, 0:w]
    canvas = np.zeros((h, w, 3), dtype=float)
    beams = [
        (0.18, 0.12, 0.55, (0.78, 0.30, 1.00), 0.85),
        (0.82, 0.88, 0.42, (0.55, 0.20, 0.95), 0.65),
        (0.50, 0.05, 0.30, (0.90, 0.60, 1.00), 0.40),
    ]
    for cx, cy, spread, color, amp in beams:
        d = np.sqrt(((xx / w - cx) / spread) ** 2 + ((yy / h - cy) / (spread * 1.6)) ** 2)
        falloff = np.exp(-(d**1.7) * 2.2) * amp
        for c in range(3):
            canvas[..., c] += falloff * color[c]
    canvas = np.clip(canvas, 0, 1)
    img = Image.fromarray((canvas * 255).astype("uint8"), "RGB")
    img = img.filter(ImageFilter.GaussianBlur(28))
    img.save(os.path.join(OUT, "light-leak.jpg"), quality=88)
    return "light-leak.jpg"


def vignette(w=1080, h=1920):
    """Vinheta em PNG com alfa — escurece cantos sem lavar o centro."""
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx / w) - 0.5) ** 2 + (((yy / h) - 0.5) * 0.62) ** 2)
    alpha = np.clip((d - 0.22) / 0.42, 0, 1) ** 1.5 * 235
    rgba = np.dstack(
        [np.zeros_like(alpha), np.zeros_like(alpha), np.zeros_like(alpha), alpha]
    ).astype("uint8")
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, "vignette.png"))
    return "vignette.png"


def caustic_bg(w=540, h=960):
    """
    Fundo orgânico de ondas roxas (ref. 5FD796DB), gerado por soma de senos.
    Fica atrás das cenas com leve parallax — evita fundo chapado.
    """
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = xx / w, yy / h
    field = np.zeros((h, w))
    for freq, ang, amp in ((2.1, 0.4, 1.0), (3.7, 1.9, 0.6), (5.3, 3.1, 0.35), (8.2, 0.9, 0.2)):
        field += amp * np.sin(2 * np.pi * freq * (u * np.cos(ang) + v * np.sin(ang)))
    field = (field - field.min()) / (field.max() - field.min())
    field = field**1.6
    top = np.array([0.24, 0.02, 0.47])
    bot = np.array([0.06, 0.00, 0.16])
    grad = bot + (top - bot) * v[..., None]
    glow = np.array([0.62, 0.20, 0.95])
    rgb = np.clip(grad + field[..., None] * glow * 0.42, 0, 1)
    img = Image.fromarray((rgb * 255).astype("uint8"), "RGB")
    img = img.resize((w * 2, h * 2), Image.LANCZOS).filter(ImageFilter.GaussianBlur(6))
    img.save(os.path.join(OUT, "caustic-bg.jpg"), quality=90)
    return "caustic-bg.jpg"


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for fn in (film_grain, light_leak, vignette, caustic_bg):
        name = fn()
        p = os.path.join(OUT, name)
        print(f"  {name:<18} {os.path.getsize(p)/1024:7.0f} KB")
    print("Pronto.")
