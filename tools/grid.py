from PIL import Image, ImageDraw
import sys, os, glob

SRC = "referencias/imagens"
OUT = "/tmp/claude-0/-home-user-teste/f702a868-82c8-5eea-a65e-0ad7013c3ec5/scratchpad/grid"
os.makedirs(OUT, exist_ok=True)

# canonical working space
W, H = 1080, 1920

for f in sorted(glob.glob(f"{SRC}/*.png")):
    im = Image.open(f).convert("RGB").resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(im, "RGBA")
    for x in range(0, W, 50):
        c = (255,0,255,220) if x % 200 == 0 else (0,255,255,90)
        d.line([(x,0),(x,H)], fill=c, width=2 if x%200==0 else 1)
    for y in range(0, H, 50):
        c = (255,0,255,220) if y % 200 == 0 else (0,255,255,90)
        d.line([(0,y),(W,y)], fill=c, width=2 if y%200==0 else 1)
    for x in range(0, W, 200):
        for y in range(0, H, 200):
            d.rectangle([x+2,y+2,x+86,y+34], fill=(0,0,0,190))
            d.text((x+6,y+8), f"{x},{y}", fill=(255,255,0,255))
    tag = os.path.basename(f)[:4]
    im.save(f"{OUT}/{tag}.png")
    print(tag, "->", f"{OUT}/{tag}.png")
