"""Recompoe bg + sprites em repouso e compara com o original.
Diferenca alta = recorte com costura visivel."""
import json, glob, os, sys
sys.path.insert(0, 'tools')
from slice import IMG
import numpy as np
from PIL import Image

OUTD = "/tmp/claude-0/-home-user-teste/f702a868-82c8-5eea-a65e-0ad7013c3ec5/scratchpad/verify"
os.makedirs(OUTD, exist_ok=True)

for s in ["s1","s2","s3","s4","s5","s6"]:
    d = f"public/layers/{s}"
    comp = Image.open(f"{d}/bg.jpg").convert("RGBA")
    for L in reversed(json.load(open(f"{d}/layers.json"))):  # extracao e frente->tras
        sp = Image.open(f"{d}/{L['name']}.png").convert("RGBA")
        comp.alpha_composite(sp, (L["x"], L["y"]))
    comp = comp.convert("RGB")
    orig = Image.open(f"referencias/imagens/{IMG[s]}").convert("RGB")\
               .resize((1080, 1920), Image.LANCZOS)
    a, b = np.asarray(comp, np.int16), np.asarray(orig, np.int16)
    diff = np.abs(a - b).max(axis=2)
    print(f"{s}: media={diff.mean():5.2f}  p99={np.percentile(diff,99):5.1f}  "
          f"px>25={100*(diff>25).mean():5.2f}%")
    Image.fromarray((np.clip(diff*4,0,255)).astype(np.uint8)).save(f"{OUTD}/{s}_diff.png")
    comp.save(f"{OUTD}/{s}_comp.jpg", quality=90)
    Image.open(f"{d}/bg.jpg").save(f"{OUTD}/{s}_bg.jpg", quality=90)
