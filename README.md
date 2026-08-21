# Três Estrelas — vídeo vertical 1080×1920 (Remotion)

Vídeo de 36s em 9:16 para Reels / TikTok / Stories, montado em
[Remotion](https://remotion.dev) + React, a partir das 6 artes de referência
em `referencias/imagens/`.

**Sem narração** — a trilha é só de efeitos sonoros, sincronizados com a
animação.

```bash
npm install
npm run studio          # abre o editor visual do Remotion
npm run build           # renderiza out/tres-estrelas.mp4
```

## A ideia

A identidade visual da Três Estrelas é preservada **pixel a pixel**: nada foi
redesenhado. Cada arte é fatiada em camadas independentes (celulares, cards,
palavras, bolinhas, gráficos, caixas) e o fundo é reconstruído por baixo, de
modo que qualquer peça pode se mover sem deixar "fantasma" do original.

A checagem `tools/verify.py` recompõe fundo + todos os sprites em repouso e
compara com a arte original: **0% de pixels com desvio acima de 25** nas seis
cenas — ou seja, parado o vídeo é idêntico à referência; o que muda é só o
movimento.

## Onde mexer

Praticamente tudo que se costuma querer ajustar está em **`src/config.ts`**:

| O quê | Onde |
|---|---|
| Duração de cada cena | `SCENES[].duration` (em segundos, via `s()`) |
| Direção da transição | `SCENES[].from` |
| Zoom lento de fundo | `SCENES[].bgZoom` |
| Sobreposição entre cenas | `OVERLAP` |
| Velocidade do texto palavra a palavra | `WORD_STEP` |
| Cascata de listas e cards | `ROW_STEP`, `CARD_STEP` |
| "Peso" das molas | `SPRING` |
| Volume de cada efeito | `SFX_GAIN` |
| Contagem da cena 2 | `COUNTER` |

O tempo de cada elemento dentro de uma cena fica no objeto `T` no topo do
arquivo da cena (`src/scenes/SceneN.tsx`) — todos em quadros, a 30 fps.

## As seis cenas

| # | Arte | O que anima |
|---|---|---|
| 1 | `35D3…` | Pedidos entrando um a um nas telas de Shopee / Mercado Livre / SHEIN; cards de notificação caindo como alerta de iPhone; título palavra a palavra |
| 2 | `EA92…` | Contagem até 100.000 com os dígitos feitos da mesma textura de caixas; ao cravar o valor, funde no recorte original |
| 3 | `F81E…` | Linha do rastreio descendo de *Pedido vendido* → *Separado* → *Enviado*, acendendo cada bolinha |
| 4 | `657C…` | Zoom no mapa, rota Goiânia → São Paulo acendendo e a caixa atravessando o traçado |
| 5 | `E524…` | Domo, caixa, escudo e os 4 cards entrando; depois a linha percorre até *ENTREGUE* com aproximação de câmera |
| 6 | `4507…` | Encerramento: galpão sobe, nome bate na tela, tarja abre, notificações pipocam, sting de marca |

## Como as camadas são geradas

```bash
python3 tools/slice.py     # fatia as artes -> public/layers/ + src/layers.gen.ts
python3 tools/digits.py    # dígitos 0-9 com a textura de caixas (cena 2)
python3 tools/route.py     # rastreia a curva do mapa nos pixels (cena 4)
python3 tools/sfx.py       # sintetiza os 18 efeitos -> public/sfx/
python3 tools/verify.py    # confere que o recorte reconstrói a arte original
```

`tools/specs.py` guarda a caixa de cada elemento. O fatiador cuida de:

- **ordem de extração** — o que está na frente sai primeiro;
- **reconstrução do fundo** — interpolação tipo Laplace a partir da moldura,
  com percentil baixo (`dark=`) para o brilho do elemento não clarear o buraco;
- **`grow_to_ink`** — a caixa cresce sozinha até a tinta acabar, então não
  sobra rabo de texto;
- **`fill="flat"` + `limit`** — nas telas de app, preenche com a "cor do papel"
  medida na própria tela;
- **`exclusive`** — marca regiões que já pertencem a outro sprite, para um
  recorte posterior não carregar o remendo do vizinho.

## Efeitos sonoros

Os 18 efeitos em `public/sfx/` são sintetizados do zero em `tools/sfx.py`
(48 kHz, estéreo): whoosh curto e de transição, swipe, pop de UI, soft pop,
click digital, tap, notificação, impacto, bass hit, sub boom, riser, reverse
whoosh, glitch, tick, chime de confirmação, sparkle e o logo sting do
encerramento.

## Ambiente

O `remotion.config.ts` aponta para um Chromium local em vez de baixar o do
Remotion. Se rodar em outra máquina, apague ou ajuste a linha
`Config.setBrowserExecutable(...)`.
