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
    Type.tsx           revelação tipográfica com máscara, stagger, sweep
    Ui.tsx             cards, abas, chips, contadores, esqueletos
    Charts.tsx         linhas que se desenham, barras 3D, seta luminosa
    Icons.tsx          ícones em SVG
    Fx.tsx             flash, glitch, speed lines, faíscas, corte vermelho
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
```

---

## As 14 cenas

| # | Cena | Referência |
| --- | --- | --- |
| 01 | "Método não dá resultado. Mas sabe por quê?" | `55933092…` |
| 02 | "Não é necessariamente por causa do método." | `5B1C2A21…` |
| 03 | Receitas × Despesas × Resultado (o caos) | `5F0A4926…` |
| 04 | "Você até pode estar fazendo dinheiro..." | `13D31795…` |
| 05 | "Mas não consegue enxergar…" | `9D589EAF…` |
| 06 | "Quanto entrou? saiu? sobrou?" | `FD6718AA…` |
| 07 | "Quanto vai fechar na próxima semana?" | `DD7785A5…` |
| 08 | "Foi pensando nisso que nasceu a Monttra" | `81318C44…` |
| 09 | Mockup do app — "Veja o lucro real" | `133BCCC2…` |
| 10 | "Acompanhe por período" | `5E1A6311…` |
| 11 | "Tudo em um só lugar" | `E58E53D7…` |
| 12 | "Resultado da operação" (surebets, cena escura) | `E0DC9E01…` |
| 13 | "Previsão da semana" (IA, calendário, meta) | `934F3467…` |
| 14 | Chamada final — "Teste grátis por 3 dias" | — |

---

## Sobre a reconstrução

As artes de referência têm 941×1672 — abaixo de Full HD. Em vez de fazer upscale
das imagens, cada cena foi **redesenhada em vetor/DOM na resolução nativa de
1080×1920**: tipografia, cards, chips, gráficos, calendário, números, ícones,
conectores e barras 3D são elementos independentes, animáveis um a um. O
resultado é nítido de verdade, não interpolado.

Duas exceções, recortadas das artes em 2× e usadas como camadas: o robô do
"Assistente IA" e a malha de pontos do rodapé da cena escura (`public/cutouts/`).

Posições, proporções e cores foram medidas diretamente sobre as artes originais
para preservar o layout e a identidade.

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

`out/monttra-reel.mp4` — 1080×1920, 60fps, 76,5s, H.264 High (CRF 20, faststart),
áudio AAC 192kbps estéreo a 48kHz com ~1,6 dB de headroom. ~75 MB.

Para regerar:

```bash
npm run build     # master CRF 17 em out/monttra-reel.mp4
```

Para uma versão leve (~20 MB, útil para WhatsApp ou revisão rápida):

```bash
npx remotion ffmpeg -i out/monttra-reel.mp4 \
  -c:v libx264 -preset slow -b:v 2100k -maxrate 2600k -bufsize 4200k \
  -profile:v main -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart \
  -y out/monttra-reel-preview.mp4
```

Os arquivos derivados (`out/*-preview.mp4`, `out/*-master.mp4`, quadros de
inspeção) ficam fora do versionamento — só o entregável final é versionado.
