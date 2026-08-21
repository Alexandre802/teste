"""Cena 2: gera os digitos 0-9 com a MESMA textura de caixas do numero
original, para a contagem rolar sem perder o visual. No fim da contagem o
video volta para o recorte real, entao o repouso e identico a imagem."""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC = "referencias/imagens/EA922747-51B7-400C-9229-492897FEB9B3.png"
OUT = "public/layers/s2/digits"
FONT = "/mnt/skills/examples/canvas-design/canvas-fonts/BigShoulders-Bold.ttf"
W, H = 1080, 1920
BAND = (20, 630, 1075, 1135)          # faixa do "+100.000"

os.makedirs(OUT, exist_ok=True)
im = Image.open(SRC).convert("RGB").resize((W, H), Image.LANCZOS)
a = np.asarray(im).astype(np.float32)

# ---- geometria dos glifos (lida do perfil de densidade da faixa) --------
# os digitos se encostam, entao as bordas vem dos vales do perfil.
# ha perspectiva: os da esquerda sao maiores.
DIGIT_SLOTS = [(200, 88), (292, 160), (455, 151),
               (660, 145), (805, 120), (928, 120)]
DOT_SLOT   = (610, 55)
PLUS_SLOT  = (40, 155)
NUM_TOP, NUM_BOT = 650, 1108          # extensao vertical dos digitos
digits = [dict(x=x, y=NUM_TOP, w=w, h=NUM_BOT - NUM_TOP) for x, w in DIGIT_SLOTS]

# ---- textura das caixas -------------------------------------------------
d = digits[1]                                     # o primeiro "0", bem cheio
tex = im.crop((d["x"] + 6, d["y"] + 30, d["x"] + d["w"] - 6, d["y"] + d["h"] - 30))
tex = tex.resize((420, 620), Image.LANCZOS)
tex.save(f"{OUT}/_tex.png")

DW, DH = max(x["w"] for x in digits), max(x["h"] for x in digits)
PAD = 26
CW, CH = DW + PAD * 2, DH + PAD * 2

def glyph_mask(ch, w, h):
    """Mascara do digito esticada para ocupar a mesma caixa do original."""
    size = int(h * 1.42)
    f = ImageFont.truetype(FONT, size)
    tmp = Image.new("L", (size * 2, int(size * 1.7)), 0)
    ImageDraw.Draw(tmp).text((size // 2, int(size * 0.85)), ch, 255, font=f, anchor="mm")
    bb = tmp.getbbox()
    return tmp.crop(bb).resize((w, h), Image.LANCZOS)

tex_big = tex.resize((DW, DH), Image.LANCZOS)
for ch in "0123456789":
    m = glyph_mask(ch, DW, DH)
    card = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))

    # sombra projetada, como no render original
    sh = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    sh.paste((4, 10, 46, 210), (PAD + 7, PAD + 12), m)
    card.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)))

    body = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    body.paste(tex_big, (PAD, PAD), m)

    # aresta escura embaixo/direita = volume das pilhas de caixa
    edge = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    edge.paste((6, 16, 60, 235), (PAD + 5, PAD + 6), m)
    cut = Image.new("L", (CW, CH), 0); cut.paste(m, (PAD, PAD))
    edge.putalpha(Image.fromarray(
        np.minimum(np.asarray(edge.split()[3]), 255 - np.asarray(cut))))
    card.alpha_composite(edge)
    card.alpha_composite(body)
    card.save(f"{OUT}/{ch}.png")

meta = dict(
    cell=[CW, CH], pad=PAD, digit=[DW, DH],
    # onde o contador deve ficar para casar com o numero da arte
    centerX=(DIGIT_SLOTS[0][0] + DIGIT_SLOTS[-1][0] + DIGIT_SLOTS[-1][1]) / 2,
    centerY=(NUM_TOP + NUM_BOT) / 2,
    digitH=NUM_BOT - NUM_TOP,
    plus=PLUS_SLOT, dot=DOT_SLOT,
    # avanco medio por caractere, medido no proprio numero da arte:
    # 6 digitos + 1 ponto ocupam o vao total entre o 1o e o ultimo glifo
    advDigit=round((DIGIT_SLOTS[-1][0] + DIGIT_SLOTS[-1][1] - DIGIT_SLOTS[0][0])
                   / (len(DIGIT_SLOTS) + 0.45), 1),
    advDot=round((DIGIT_SLOTS[-1][0] + DIGIT_SLOTS[-1][1] - DIGIT_SLOTS[0][0])
                 / (len(DIGIT_SLOTS) + 0.45) * 0.45, 1),
    slots=[dict(x=x, y=NUM_TOP, w=w, h=NUM_BOT - NUM_TOP) for x, w in DIGIT_SLOTS])
json.dump(meta, open("public/layers/s2/digits.json", "w"), indent=1)
print("ok ->", OUT)
