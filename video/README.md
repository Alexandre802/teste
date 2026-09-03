# Monttra — Reel vertical (Remotion)

Vídeo vertical **1080×1920 @ 60fps**, reconstruído em React/Remotion a partir das
13 artes de referência em `../referencias/imagens` e do roteiro em
`../referencias/copy`.

**Sem narração.** A trilha é composta apenas por efeitos sonoros, conforme pedido.
O áudio de narração em `../referencias/audio` foi usado somente como base de
ritmo e duração — ele não entra no vídeo.

---

## Rodar

```bash
npm install
npm run dev      # Remotion Studio (pré-visualização e ajuste ao vivo)
npm run build    # renderiza out/monttra-reel.mp4
```

Este ambiente não alcança o CDN do Remotion, então `remotion.config.ts` aponta
para o Chromium já instalado na imagem. Em uma máquina com internet, basta
remover esse trecho.

---

## O que editar

Praticamente tudo que muda com frequência está em **`src/config/timeline.ts`**:

| O que | Onde |
| --- | --- |
| Duração de cada cena | `SCENE_SECONDS` (em segundos) |
| Ordem / remoção de cenas | `SCENE_ORDER` |
| Todos os textos | `COPY` |
| Resolução e fps | `FPS`, `WIDTH`, `HEIGHT` |

Cores, fontes, curvas de aceleração e sombras ficam em **`src/config/theme.ts`**.
As cores foram amostradas pixel a pixel das artes originais — mexer ali muda a
identidade visual inteira de uma vez.

O timing interno de cada cena (quando cada card, número ou ícone entra) fica na
própria cena, em `src/scenes/`, como o `delay` de cada elemento — sempre em
frames a partir do início daquela cena. Mudar a duração de uma cena não
desalinha as outras.

---

## Estrutura

```
src/
  Root.tsx             composições (a principal + uma isolada por cena)
  Video.tsx            monta as cenas em sequência
  SceneLab.tsx         renderiza uma cena isolada (para inspeção)
  config/
    theme.ts           cores, fontes, easings, sombras
    timeline.ts        durações, ordem e textos
  components/
    anim.ts            helpers de animação (tween, spring, contador, typewriter)
    Scene.tsx          deriva de câmera + saída padrão de cena
    Bg.tsx             fundos claro/escuro, barras, grão, vinheta
    Logo.tsx           símbolo + wordmark em vetor, barras animáveis
    Type.tsx           utilitários de texto (máscara, sweep, texto de UI)
    Kinetic.tsx        tipografia cinética: palavras que encaixam, batidas,
                       troca de palavra, odômetro, badges
    Ui.tsx             cards, abas, chips, contadores, esqueletos
    Charts.tsx         linhas que se desenham, barras 3D, seta luminosa
    Icons.tsx          ícones em SVG
    Fx.tsx             flash, glitch, speed lines, faíscas, corte vermelho
    Plate.tsx          camadas recortadas das artes + fundo (plate)
    Sfx.tsx            biblioteca e disparo dos efeitos sonoros
  scenes/              S01…S14
public/
  fonts/               Anton, Archivo, Poppins (auto-hospedadas)
  sfx/                 18 efeitos sonoros sintetizados
  cutouts/             robô 3D e malha de pontos recortados das artes
  grain.png            textura de grão
tools/
  make_sfx.py          gera public/sfx/
  extract_assets.py    gera public/cutouts/
  decompose.py         recorta as artes em plate + camadas (public/plates/)
```

---

## As 14 cenas

Cada cena está ancorada em uma frase da narração (`../referencias/audio`,
67,0s). As fronteiras vieram das pausas reais do áudio, medidas por análise
de envelope — por isso as cenas de texto são curtas e as de interface são
longas: é o próprio roteiro que dita o ritmo.

| # | Tipo | Início | Dur | Cena | Arte |
| --- | --- | --- | --- | --- | --- |
| 1 | texto | 0,00 | 2,63 | "Método não dá resultado. Mas sabe por quê?" | `55933092…` |
| 2 | texto | 2,63 | 2,39 | "Não é necessariamente por causa do método." | `5B1C2A21…` |
| 3 | interface | 5,02 | 8,97 | Receitas × Despesas × Resultado | `5F0A4926…` |
| 4 | texto | 13,99 | 1,77 | "Você até pode estar fazendo dinheiro..." | `13D31795…` |
| 5 | texto | 15,76 | 3,24 | "Mas não consegue enxergar…" | `9D589EAF…` |
| 6 | texto | 19,00 | 2,56 | "Quanto entrou? saiu? sobrou?" | `FD6718AA…` |
| 7 | interface | 21,56 | 4,54 | "Tudo em um só lugar" | `E58E53D7…` |
| 8 | texto | 26,10 | 4,70 | "Quanto vai fechar na próxima semana?" | `DD7785A5…` |
| 9 | texto | 30,80 | 2,39 | "Foi pensando nisso que nasceu a Monttra" | `81318C44…` |
| 10 | interface | 33,19 | 7,41 | Mockup do app — "Veja o lucro real" | `133BCCC2…` |
| 11 | interface | 40,60 | 5,82 | "Acompanhe por período" | `5E1A6311…` |
| 12 | interface | 46,42 | 7,26 | "Resultado da operação" (surebets) | `E0DC9E01…` |
| 13 | interface | 53,68 | 7,06 | "Previsão da semana" (IA, calendário, meta) | `934F3467…` |
| 14 | CTA | 60,74 | 6,26 | "Teste grátis por 3 dias" | — |

---

## Como as cenas de interface são montadas

As seis telas de produto usam **os pixels das artes originais**, não uma
reconstrução. `tools/decompose.py` recorta cada elemento (cards, chips, abas,
calendário, aparelho…) da arte e gera o *plate*: a mesma arte com aqueles
elementos removidos, com o buraco preenchido por extensão das bordas.

No Remotion o plate entra como fundo e cada recorte volta para a sua posição
exata, animado de forma independente. Parado, o quadro é idêntico à arte —
verificável recompondo plate + camadas e comparando com o original.

Dois cuidados que o script resolve:

- o recorte leva junto a **sombra projetada** de cada elemento (margem de 30px
  com máscara dilatada e suavizada); sem isso a sombra ficava no plate e
  aparecia como um retângulo claro atrás do elemento;
- o plate **não pode ter movimento próprio** — qualquer transformação nele
  desalinharia as camadas. O avanço de câmera fica em `<Scene>`, que move
  fundo e camadas juntos, e é bem discreto (2%) para não cortar as bordas
  da arte.

Tudo é reamostrado em 2× com LANCZOS, então o render em 1080×1920 reduz a
partir de 1882×3344 em vez de ampliar os 941×1672 originais.

As cenas tipográficas continuam sendo vetor/DOM na resolução nativa, com
posições, proporções e cores medidas sobre as artes.

## Animação

O gesto tipográfico do reel está em `components/Kinetic.tsx`: cada palavra é
uma camada que chega de baixo, ampliada e borrada, e **encaixa** no lugar com
um leve overshoot — uma palavra a cada ~5 frames. O layout é fixado por flex,
então só transformações animam e nada reflui.

As cenas de texto **constroem** o bloco em ondas, mas nenhum elemento sai: o
quadro final de cada cena reproduz a arte de referência como ela é.

Entre cenas há um par punch-out / punch-in — a que sai encolhe e borra
enquanto a que entra chega ampliada e desfocada. `Scene.tsx` ainda aplica um
avanço de câmera contínuo e uma micro-oscilação, de modo que nenhum quadro
fica completamente parado.

## Efeitos sonoros

Os 18 efeitos são **sintetizados do zero** por `tools/make_sfx.py` (48kHz,
estéreo) — nada de biblioteca externa ou sample de terceiros. Cobrem a lista
pedida: whoosh curto e de transição, swipe, pop UI, soft pop, click digital,
tap, notification pop, impact, bass hit, sub boom, riser, reverse whoosh,
glitch, tick, success chime, sparkle e logo sting.

Cada cena declara os próprios disparos em `<SfxTrack cues={…} />`, com o frame
relativo ao início dela. Para regerar com outro caráter, edite os parâmetros de
síntese e rode `python3 tools/make_sfx.py`.

---

## Entrega

`out/monttra-reel.mp4` — 1080×1920, 60fps, 67,0s, H.264 High (CRF 20, faststart),
áudio AAC 192kbps estéreo a 48kHz com ~1,6 dB de headroom. ~33 MB.

Para regerar:

```bash
npm run build     # master CRF 17 em out/monttra-reel.mp4
```

Para uma versão leve (~21 MB, útil para WhatsApp ou revisão rápida):

```bash
npx remotion ffmpeg -i out/monttra-reel.mp4 \
  -c:v libx264 -preset slow -b:v 2400k -maxrate 3000k -bufsize 4800k \
  -profile:v main -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart \
  -y out/monttra-reel-preview.mp4
```

Os arquivos derivados (`out/*-preview.mp4`, `out/*-master.mp4`, quadros de
inspeção) ficam fora do versionamento — só o entregável final é versionado.
