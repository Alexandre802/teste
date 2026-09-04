# ASSET_MAP — imobiliaria-demo

Inventário dos arquivos entregues junto com o briefing e onde cada um é usado.
As quatro capturas de tela são **referência de layout**: nenhuma delas entra no
site como imagem de fundo de seção. Só as *fotografias* recortadas delas são
usadas como fotografia.

## Vídeo — fonte oficial do movimento do hero

| Arquivo | Origem | Uso |
|---|---|---|
| `public/videos/remotion/hero-original.mp4` | vídeo enviado (720×1280, 24 fps, 8 s, 192 quadros, com áudio) | Preservado como referência do movimento. Não é carregado pelo site. |
| `public/videos/remotion/hero-scrub.mp4` | recodificação do original | **É o vídeo que o site toca.** Mesmos 192 quadros, sem áudio, todos os quadros como keyframe (`-g 1`) para que `seekTo()` responda na hora durante o scroll. |
| `public/videos/remotion/hero-scrub.webm` | mesma recodificação, em VP9 | Reserva. Algumas compilações de Chromium em Linux vêm sem H.264 e ficariam sem hero; o site escolhe a fonte por `canPlayType`. |

### Duas coisas mudaram em relação ao arquivo enviado

**1. O selo de recorte foi apagado.** O vídeo original tem, gravado na
imagem, o botão de recorte do aplicativo que exportou o arquivo — um
retângulo escuro com um ícone, fixo em `x 553–633, y 28–62`, presente nos
192 quadros. Ele apareceria no canto superior direito do hero o tempo todo.
Foi removido com `delogo=x=545:y=16:w=100:h=58`, que reconstrói a região a
partir da borda da caixa. O fundo atrás do selo é liso em todos os quadros
(céu, depois forro), então não sobrou emenda visível — conferido quadro a
quadro. O original fica intacto em `hero-original.mp4`.

**2. Todo quadro virou keyframe.** Sem isso o navegador precisaria decodificar
desde o keyframe anterior a cada `seekTo`, e o scroll engasgaria. O custo é
tamanho de arquivo (4,5 MB → 4,7 MB no MP4), o que aqui é barato.

Comandos usados, para quem precisar refazer com outro vídeo:

```
ffmpeg -i hero-original.mp4 -an -vf "delogo=x=545:y=16:w=100:h=58" \
  -c:v libx264 -preset slow -crf 26 -g 1 -keyint_min 1 -sc_threshold 0 \
  -bf 0 -pix_fmt yuv420p -movflags +faststart hero-scrub.mp4

ffmpeg -i hero-original.mp4 -an -vf "delogo=x=545:y=16:w=100:h=58" \
  -c:v libvpx-vp9 -crf 40 -b:v 0 -g 1 -keyint_min 1 -deadline good \
  -cpu-used 4 -row-mt 1 -pix_fmt yuv420p hero-scrub.webm
```

Trocando o vídeo, ajuste `HERO_FPS`, `HERO_DURATION_IN_FRAMES`, `HERO_WIDTH`
e `HERO_HEIGHT` em `remotion/constants.ts` — e a caixa do `delogo`, ou
remova o filtro se o novo arquivo estiver limpo.

Movimento conferido quadro a quadro no arquivo original:

| Quadro | Progresso | Momento |
|---|---|---|
| 0 | 0,00 | vista aérea — casa, piscina, jardim, mata, montanhas, pôr do sol |
| 12–48 | 0,06–0,25 | a câmera desce e avança |
| 48–96 | 0,25–0,50 | atravessa o espaço acima da piscina |
| 96–132 | 0,50–0,69 | a porta de vidro cresce no enquadramento |
| 132–150 | 0,69–0,78 | a porta abre |
| 150–176 | 0,78–0,92 | entrada e travessia da sala |
| 176–191 | 0,92–1,00 | interior, abertura traseira, mesa externa, árvores, floresta |

O conteúdo comercial só aparece a partir de 0,88 — dentro do trecho final.

## Capturas de referência (layout)

| Arquivo | Referência de |
|---|---|
| `public/imagens/referencias/01-hero-inicio.webp` | Hero, quadro inicial + "Role para continuar" |
| `public/imagens/referencias/02-hero-final.webp` | Hero, conteúdo comercial no fim do percurso |
| `public/imagens/referencias/03-imoveis.webp` | Catálogo: filtros, busca e cards |
| `public/imagens/referencias/04-apresentacao.webp` | Apresentação da imobiliária |

## Fotografias

| Arquivo | Origem | Uso |
|---|---|---|
| `public/imagens/hero/hero-inicio.webp` | quadro 0 do vídeo (já sem o selo) | Poster do hero enquanto o vídeo carrega |
| `public/imagens/hero/hero-final.webp` | quadro 191 do vídeo (já sem o selo) | Hero estático em `prefers-reduced-motion` |
| `public/imagens/contato/escritorio.webp` | quadro 12 do vídeo (já sem o selo) | Fundo da seção de localização e contato |
| `public/imagens/imoveis/casa-da-mata.webp` | recorte de `03-imoveis` | Card Casa da Mata |
| `public/imagens/imoveis/casa-do-mirante.webp` | recorte de `03-imoveis` | Card Casa do Mirante |
| `public/imagens/imoveis/villa-horizonte.webp` | recorte de `03-imoveis` | Card Villa Horizonte |
| `public/imagens/imoveis/casa-jardim.webp` | recorte de `03-imoveis` | Card Casa Jardim |
| `public/imagens/imoveis/refugio-da-serra.webp` | recorte de `03-imoveis` | Card Refúgio da Serra |
| `public/imagens/imoveis/casa-das-aguas.webp` | recorte de `03-imoveis` | Card Casa das Águas |
| `public/imagens/sobre/excelencia.webp` | recorte de `04-apresentacao` | Bloco "Excelência em cada escolha" |
| `public/imagens/sobre/detalhes.webp` | recorte de `04-apresentacao` | Bloco "Atuação com atenção aos detalhes" |

Os recortes foram tirados apenas da área fotográfica das capturas — fora das
regiões onde havia botão de favoritar, borda de card ou texto — e ampliados 2×
(lanczos) para não borrarem em tela retina. A resolução original das capturas
limita a nitidez: em produção essas fotos são substituídas pelo acervo do
cliente. Cada imóvel tem foto própria; nenhuma foto se repete entre itens.
