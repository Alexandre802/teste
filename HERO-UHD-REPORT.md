# HERO UHD REPORT

## Fonte
```
codec_name=h264
width=720
height=1280
pix_fmt=yuv420p
r_frame_rate=24/1
avg_frame_rate=24/1
bit_rate=4239563
duration=8.000000
size=4393685
bit_rate=4393685
```

## Saída usada no site
- Arquivo: public/videos/remotion/hero-scrub-uhd.mp4
- Resolução: 2160x3840
- FPS: 24
- Quadros: 192
- Codec: H.264 / yuv420p
- CRF aplicado: 18
- GOP: 1 (todo quadro é keyframe para scroll-scrub)
- Filtro: Lanczos 3x + unsharp 7x7 forte/controlado + remoção do selo
- Tune: grain, para preservar microtextura e evitar aparência plastificada
- Observação: a fonte original é 720x1280. Esta versão prioriza nitidez percebida e baixa perda de compressão, mas não consegue inventar detalhe óptico que não exista no original.

## Tamanho
public/videos/remotion/hero-scrub-uhd.mp4: 74099201 bytes
public/imagens/hero/hero-inicio-uhd.webp: 1585868 bytes
public/imagens/hero/hero-final-uhd.webp: 731262 bytes
codec_name=h264
width=2160
height=3840
pix_fmt=yuv420p
r_frame_rate=24/1
avg_frame_rate=24/1
bit_rate=74097181
duration=8.000000
size=74099201
bit_rate=74099201
