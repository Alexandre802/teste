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
- CRF aplicado: 16
- GOP: 1 (todo quadro é keyframe para scroll-scrub)
- Filtro: Lanczos 3x + sharpen leve + remoção do selo do exportador
- Observação: a fonte original é 720x1280; o arquivo UHD evita nova perda por reescala/compressão e melhora a percepção de nitidez, mas detalhe óptico inexistente na fonte não pode ser recuperado perfeitamente sem uma fonte nativa 4K.

## Tamanho
public/videos/remotion/hero-scrub-uhd.mp4: 67326158 bytes
public/imagens/hero/hero-inicio-uhd.webp: 976476 bytes
public/imagens/hero/hero-final-uhd.webp: 459178 bytes
codec_name=h264
width=2160
height=3840
pix_fmt=yuv420p
r_frame_rate=24/1
avg_frame_rate=24/1
bit_rate=67324214
duration=8.000000
size=67326158
bit_rate=67326158
