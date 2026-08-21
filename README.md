# Três Estrelas — vídeo vertical 1080×1920 (Remotion)

Vídeo de 36s em 9:16 para Reels / TikTok / Stories, montado em
[Remotion](https://remotion.dev) + React sobre as 6 artes de
`referencias/imagens/`.

**Sem narração** — a trilha é só de efeitos sonoros, sincronizados com a
animação.

```bash
npm install
npm run studio          # editor visual do Remotion
npm run build           # renderiza out/tres-estrelas.mp4
```

## A regra do projeto

**A arte não é tocada.** Nenhum pixel é recortado, recriado, borrado ou
apagado, e nenhuma peça aparece duas vezes. O que roda no vídeo é sempre o
arquivo original (`public/art/sN.jpg`, apenas redimensionado de 941×1672
para 1080×1920).

Toda a animação vem de quatro recursos, e só deles:

| Recurso | O que faz |
|---|---|
| **Câmera** | transforma o quadro inteiro (zoom lento, aproximação dirigida) |
| **Revelação por máscara** | a arte *surge* por uma varredura de borda suave — nunca é substituída |
| **Cortina** | tapa uma superfície (tela de app, card) com uma cor lida da própria arte e recua, deixando o conteúdo original aparecer na ordem |
| **Overlay de luz** | brilho, clarão e passada de luz em modo `screen`, por cima |

Os realces (`<Piece>`) só escalam **para cima** e sempre dentro da janela do
próprio elemento — assim ele cobre o próprio lugar e nunca abre buraco nem
deixa cópia por baixo.

## Onde mexer

Quase tudo que se costuma ajustar está em **`src/config.ts`**:

| O quê | Onde |
|---|---|
| Duração de cada cena | `SCENES[].duration` (em segundos, via `s()`) |
| Direção da transição | `SCENES[].from` |
| Zoom lento de fundo | `SCENES[].bgZoom` |
| Sobreposição entre cenas | `OVERLAP` |
| Volume de cada efeito | `SFX_GAIN` |
| Contagem da cena 2 | `COUNTER` |
| Texto de cada região (referência) | `COPY` |

O tempo de cada elemento fica no objeto `T` no topo do arquivo da cena
(`src/scenes/SceneN.tsx`), sempre em quadros, a 30 fps. As faixas que montam
a cena ficam na lista `STEPS` logo abaixo.

## As seis cenas

| # | Arte | O que anima |
|---|---|---|
| 1 | `35D3…` | Título palavra a palavra; depois uma cascata única desce e vai descobrindo, na ordem, os celulares, cada pedido nas listas de Shopee / Mercado Livre / SHEIN e cada card de notificação |
| 2 | `EA92…` | O número da arte é descoberto casa a casa: 1 → 10 → 100 → 1.000 → 10.000 → 100.000. As caixas que formam os dígitos são as originais — nenhum dígito foi desenhado |
| 3 | `F81E…` | O celular sobe e a cortina da tela recua em degraus: é a própria linha do rastreio descendo de *Pedido vendido* → *Separado* → *Enviado*, com um brilho acompanhando a borda |
| 4 | `657C…` | Textos palavra a palavra, aproximação no mapa e um brilho percorrendo a rota **que já existe na arte** (nenhuma linha é desenhada por cima), com rastro de velocidade na caixa |
| 5 | `E524…` | A imagem se monta inteira (título, centro subindo, 4 cards pelas laterais); depois a cortina do card recua até *ENTREGUE*, com a câmera fechando no percurso |
| 6 | `4507…` | Galpão sobe, nome bate em duas batidas, tarja abre da esquerda para a direita, notificações nos quatro cantos, sting de marca |

## Ferramentas (todas somente-leitura sobre a arte)

```bash
python3 tools/prep.py      # arte -> public/art/ (só redimensiona) + cor do palco
python3 tools/regions.py   # geometria das regiões -> src/regions.gen.ts
python3 tools/route.py     # rastreia a curva do mapa nos pixels (cena 4)
python3 tools/sfx.py       # sintetiza os 18 efeitos -> public/sfx/
```

- `tools/detect.py` acha o limite real de cada elemento (a caixa cresce até a
  tinta acabar) e separa as palavras dos títulos pelo perfil de contraste.
- `tools/regions.py` também mede os **cantos reais** das telas dos celulares,
  para a cortina acompanhar a inclinação da arte em vez de chutar rotação.
- `tools/specs.py` guarda a caixa de partida de cada elemento.

Nenhuma dessas ferramentas grava imagem alterada: só coordenadas, cores de
apoio e os efeitos sonoros.

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
