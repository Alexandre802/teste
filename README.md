# ConsulTech — Reel vertical 1080×1920 (Remotion + React)

Vídeo vertical 9:16 (Reels / TikTok / Stories) reconstruído em **Remotion** a
partir das 5 imagens de referência da ConsulTech. Nada é imagem estática: cada
card, ícone, gráfico, campo de busca, número e elemento decorativo foi
reconstruído como **camada independente em React/SVG/CSS** para poder ser
animado individualmente.

- **Formato:** 1080×1920, 30 fps
- **Duração:** 71,61 s (2148 frames) — narração de 70,16 s + 1,45 s de respiro no CTA
- **Áudio:** narração fornecida + 18 efeitos sonoros gerados proceduralmente

```bash
npm install
npm run studio     # abre o Remotion Studio (preview interativo)
npm run render     # gera out/consultech-reel.mp4
```

---

## Cenas

| # | Composição | Tela de referência | Entra em | Duração |
|---|------------|--------------------|----------|---------|
| 1 | `scene-1-oportunidades` | 2/8 — "Quantas oportunidades você perdeu?" | 0,00 s | 16,47 s |
| 2 | `scene-2-eoPior` | 3/8 — "E o pior..." | 16,47 s | 8,60 s |
| 3 | `scene-3-precisaConsultar` | 5/8 — "Precisa consultar?" | 25,07 s | 17,37 s |
| 4 | `scene-4-cemMais` | 5/8 — "100+ tipos de consultas" | 42,44 s | 16,73 s |
| 5 | `scene-5-pagueSo` | 8/8 — "Pague só pelo que usar" | 59,15 s | 12,43 s |

Cada cena também existe como composição isolada no Studio, para revisar uma
tela por vez sem esperar o vídeo inteiro.

## Sincronia com a narração

O áudio é analisado em **três granularidades** (`npm run analyze`, gera
`src/config/speechMap.ts`):

| | quantidade | serve para |
|---|---|---|
| `PHRASES` | 41 grupos de fala | posicionar os cortes de cena nas pausas e trocar de assunto |
| `BEATS` | 194 onsets de palavra (166 pal/min) | **âncora principal**: cada card, ícone e título entra numa palavra falada |
| `SYLLABLES` | 281 núcleos silábicos (4,0 síl/s) | acentos finos (ticks, brilhos) |

Nenhuma cena usa frames arbitrários: o timing sai de `src/lib/sync.ts`, que
traduz esses instantes em delays de animação.

```ts
const S = sceneSync("precisaConsultar");
const B = {
  cards: [S.phrase(2), S.phrase(3), S.phrase(4), S.phrase(5)], // 1 card por frase
  boltBadge: S.beat(4),                                        // na 5ª palavra
};
```

### Dois níveis de sincronia

**Por ritmo (sem transcrição, é o estado atual).** Os títulos são distribuídos
dentro da frase falada por **peso silábico** e encaixados no onset de palavra
mais próximo — "Quantas / oportunidades / você / perdeu?" entra nos frames
6 / 18 / 46 / 62, cada um numa palavra real da locução.

**Por conteúdo (com transcrição).** Salve o texto da narração em
`narration.txt` e rode:

```bash
npm run align
```

O alinhador (`tools/align_text.py`) faz um alinhamento forçado leve — distribui
as palavras pelas frases detectadas por peso silábico e encaixa cada uma no
onset mais próximo — gerando `src/config/narrationText.ts` com o instante de
**cada palavra**. A partir daí:

- `alignWordsToPhrase()` passa a usar o instante **exato** em que cada palavra
  do título é dita (sem precisar mexer em nenhuma cena);
- o comando imprime os segundos sugeridos para `SCENE_STARTS`, procurando as
  palavras-chave de cada tela na transcrição.

### Conferir a sincronia

A composição `ConsulTechReel-sync` (no Studio) mostra o vídeo com timecode,
nome da cena, contador de frases e um pisca a cada palavra falada — é o jeito
mais rápido de apontar "em 0:34 já era a tela 100+".

---

## Onde mexer em cada coisa

| O que você quer mudar | Arquivo |
|---|---|
| Duração/ordem das cenas, fps, resolução | `src/config/timeline.ts` (`SCENE_STARTS`) |
| Qualquer texto do vídeo | `src/config/copy.ts` |
| Cores, fontes, sombras, gradientes da marca | `src/config/theme.ts` |
| Timing interno de uma cena (beats) | objeto `B` no topo do arquivo da cena |
| Posições/tamanhos de uma cena | objeto `L` no topo do arquivo da cena |
| Efeitos sonoros de uma cena | array `sceneNCues` no arquivo da cena |
| Volume geral dos SFX | `MASTER_SFX_VOLUME` em `src/config/sfx.ts` |
| Efeitos das transições | `transitionCues` em `src/Video.tsx` |
| Estilo das transições | `src/components/SceneShell.tsx` |
| "Personalidade" do movimento (molas, easings) | `src/lib/anim.ts` |

### Exemplo — deixar a cena 3 mais curta

```ts
// src/config/timeline.ts
{ id: "cemMais", start: 42.44 },  // ← adiante esse valor: a cena 3 encurta
                                  //    e a cena 4 estica, sem tocar em nada mais
```

Frames, transições e cues de SFX são todos derivados desses segundos.

---

## Estrutura

```
src/
  config/
    timeline.ts      duração/cortes — fonte única de verdade
    theme.ts         identidade visual (cores, pesos, sombras)
    copy.ts          todos os textos
    sfx.ts           biblioteca de efeitos + volumes
    speechMap.ts     GERADO — frases, palavras e sílabas do áudio
    narrationText.ts GERADO — transcrição alinhada (opcional)
  lib/
    sync.ts          traduz fala em delays de animação
    anim.ts          fadeUp, fadeSide, popIn, card3dIn, stagger, float,
                     glowPulse, camera, typewriter, countUp, drawPath
    fonts.ts         injeta a Poppins embutida (400/500/600/700/800)
    poppinsCss.ts    GERADO — @font-face em data: URI
    SfxTrack.tsx     toca listas de cues
  components/
    SceneShell.tsx   transições + câmera + RevealText (revelação por máscara)
    Brand.tsx        logo hexagonal, wordmark, paginação "5/8", header
    Primitives.tsx   GlassCard, WhiteCard, DarkPanel, IconCircle, BadgeCircle,
                     CheckSeal, Chip, SearchField, CtaButton, SkeletonLine
    Icons.tsx        19 ícones vetoriais (carro, velocímetro, balança, ...)
    Charts.tsx       Sparkline, MiniBars, TrendLine, AreaChart, Donut, legenda
    Decor.tsx        asterisco, swoosh, anel azul, grid de pontos, arcos,
                     glow, seta curva, relógio, ampulheta de vidro
    Bureaus.tsx      marcas das fontes de dados (SPC, Serasa, BoaVista, RF)
  scenes/            uma cena por arquivo (beats + layout + SFX no topo)
public/
  audio/narration.mp3
  audio/sfx/*.wav    18 efeitos gerados
  fonts/*.woff2      Poppins
tools/
  gen_sfx.py         gerador dos 18 efeitos sonoros
  analyze_audio.py   extrai frases/palavras/sílabas do áudio -> speechMap.ts
  align_text.py      alinha a transcrição ao áudio -> narrationText.ts
  inline-fonts.mjs   embute os woff2 como data: URI
```

---

## Animações usadas

Nenhum elemento é animado "como imagem inteira": tudo é camada.

- **Textos** — revelação por máscara (`clip-path`) + deslize + desfoque, palavra
  por palavra; brilho pulsante nas palavras azuis; micro-tremor de impacto em
  "pior...".
- **Cards** — entrada 3D com mola (`translate3d` + `rotateY` + escala + blur),
  em stagger, e flutuação contínua depois de assentar.
- **Ícones** — pop com mola e leve rotação de entrada, independente do card.
- **Campos de busca** — digitação caractere a caractere com cursor piscando.
- **Gráficos** — sparkline e área desenhando por `stroke-dashoffset` + máscara,
  barras crescendo em stagger, donut preenchendo arco por arco, legenda
  entrando item a item.
- **Números** — contagem progressiva com easing: `100+`, `1.248`, `98,7%`,
  `2,3s` (formato pt-BR preservado).
- **Decorativos** — asterisco girando na entrada, swooshes e anéis desenhando,
  relógio com ponteiros andando, ampulheta com areia escoando durante toda a
  cena, arcos e grids de pontos surgindo.
- **Câmera** — push-in lento por cena, com o fundo em parallax mais lento que o
  conteúdo.
- **Transições** — cross-dissolve de 12 frames com zoom/push/punch + desfoque;
  escalas sempre ≥ 1 para as bordas do quadro nunca aparecerem.

### Sobre as referências de animação

O vocabulário de movimento segue as referências citadas no briefing
(animate.css, transições de herói do flutter_pokedex, molas do
SwiftUI-Animations), mas **reimplementado em `src/lib/anim.ts`** em função de
`useCurrentFrame()`:

| Referência | Equivalente aqui |
|---|---|
| `fadeInUp` / `fadeInLeft` | `fadeUp()` / `fadeSide()` |
| `zoomIn` / `bounceIn` | `popIn()` / preset de mola `bouncy` |
| `pulse` / `flash` | `glowPulse()` |
| transição de herói (card → tela) | `card3dIn()` + `SceneShell` |
| mola de UI declarativa | presets `soft / snappy / bouncy / pop / heavy` |

O motivo de não usar as bibliotecas CSS diretamente é técnico: keyframes de CSS
avançam pelo relógio do navegador, e no Remotion o tempo é o número do frame —
uma animação em CSS sairia dessincronizada e não determinística entre renders.
Tudo aqui é função pura do frame, o que garante o mesmo resultado em qualquer
máquina e permite fazer scrub na timeline.

Os repositórios de referência não são acessíveis a partir deste ambiente (a
política de egresso bloqueia github.com), então o mapeamento acima foi feito a
partir dos padrões conhecidos dessas bibliotecas.

## Efeitos sonoros

Não havia biblioteca de áudio disponível offline, então os 18 efeitos pedidos
são **sintetizados proceduralmente** (`tools/gen_sfx.py`, ~200 linhas de DSP com
numpy: filtros SVF, sweeps exponenciais, envelopes percussivos, saturação,
reverb por convolução, bitcrush):

whoosh curto · whoosh de transição · swipe/pass-by · pop UI · soft/bubble pop ·
digital click · tap/button press · notification pop · impact/hit · bass hit ·
sub boom · riser · reverse whoosh · digital glitch · tick/micro click ·
success chime · sparkle/shine · logo sting

```bash
npm run sfx    # regenera public/audio/sfx/*.wav
```

### Mix

A narração fornecida é baixa (pico −5,5 dBFS, RMS de voz −21 dBFS), então
`NARRATION_VOLUME = 1.25` (em `timeline.ts`) leva a voz para ≈ −3,2 dBFS de pico
e `MASTER_SFX_VOLUME = 0.6` (em `sfx.ts`) deixa os efeitos ≈ 4 dB acima do RMS
da voz — audíveis como acento, sem mascarar a locução e sem clipar a soma.

Cada cena declara seus cues em frames relativos; as transições têm cues
absolutos em `src/Video.tsx` (reverse whoosh → whoosh encorpado → bass hit) para
poderem atravessar o corte.

## Notas de fidelidade

- Tipografia: **Poppins** (400–800) embutida no bundle como data: URI — nada
  depende de CDN nem do servidor de arquivos estáticos em tempo de render
  (`npm run fonts` regenera a partir de `public/fonts`).
- Cores, raios, sombras, gradientes e posições foram extraídos das imagens de
  referência e centralizados em `theme.ts`; nenhuma cor nova foi inventada.
- A ampulheta 3D da tela 3/8 e o cubo do logo foram **reconstruídos em SVG**
  (gradientes, reflexos, tampas metálicas) porque precisam ser animáveis.
- As marcas das fontes de dados (SPC, Serasa, BoaVista, Receita Federal) são
  reconstruções simplificadas — mesmo papel visual e mesmas cores que ocupam na
  referência.
