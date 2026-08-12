# Waatzo — Reel 1080x1920 (Remotion)

Vídeo vertical de **85,7 s — exatamente a duração da narração de referência**,
reconstruído a partir das 10 artes em `referencias/imagens/`.
**Sem narração no vídeo** — apenas efeitos sonoros. Cada elemento (card,
ícone, campo de digitação, número, relógio, blob) é uma camada React
independente. Nenhuma imagem de referência entra como frame estático.

## Rodar

```bash
npm install
npm run studio      # editor visual do Remotion
npm run render      # master em out/waatzo-reel.mp4 (crf 18)
npm run web         # versão de entrega waatzo-reel.mp4 (~21 MB)
npm run sfx         # regera os efeitos sonoros em public/sfx/
npm run fonts       # regera src/lib/interFonts.ts a partir de public/fonts
```

O arquivo pronto está versionado em `video/waatzo-reel.mp4`
(1080x1920, 30 fps, 85,7 s, H.264 + AAC).

> Neste ambiente o Chromium do sistema é usado via `remotion.config.ts`
> (`setBrowserExecutable`). Em outra máquina, apague essa linha para o
> Remotion baixar o próprio binário.

## Sincronia com a narração

A decupagem não é estimada: `tools/find_cuts.py` mede a energia do áudio de
referência, encontra as pausas da locução e devolve o frame de cada virada de
frase. Esses frames estão em `SCENES` (campo `at`), em `src/timeline.ts` —
**toda troca de tela cai no centro de uma pausa real da narração.**

```bash
python3 tools/find_cuts.py    # relista as pausas do áudio
```

São 14 blocos. O `APP` é um take de demonstração do aplicativo, remontado a
partir das quatro capturas de tela (Início, Conversas, Interesses, Agenda) —
ele divide com o `S04` a janela de 13,43 s a 20,30 s.

Os demais blocos usam as 10 artes. Os três últimos são retomadas: o trecho
final da copy volta a assuntos já ilustrados ("ele confirma agendamentos…",
"é como ter uma funcionária…", "ninguém respondeu a tempo"), e retomar a arte
correspondente com outro enquadramento é melhor do que deixar uma cena parada
por 18 segundos.

| bloco | fala | entra em |
| --- | --- | --- |
| S01 | A maioria dos profissionais… | 0,00 s |
| S02 | Perde porque o concorrente respondeu primeiro | 4,65 s |
| S03 | Você atende clientes o dia inteiro… | 7,68 s |
| APP | Enquanto você está fazendo um corte, um procedimento… | 13,43 s |
| S04 | …outras pessoas estão mandando mensagem | 17,90 s |
| S05 | Elas chamam o próximo salão… | 20,30 s |
| S06 | Foi exatamente para resolver isso que nasceu o Waatzo | 28,65 s |
| S07 | …respondendo clientes, agendando horários | 35,90 s |
| S08a | enviando lembretes e recuperando quem sumiu | 41,23 s |
| S09 | Tudo automaticamente, 24 horas por dia | 44,69 s |
| S08b | Ele confirma agendamentos, reduz faltas… | 51,64 s |
| S06b | É como ter uma funcionária que nunca atrasa… | 62,50 s |
| S02b | …ninguém respondeu a tempo | 69,09 s |
| S10 | Teste grátis por 14 dias | 77,07 s |

Cada bloco declara `designDur`: o ritmo para o qual a coreografia foi
desenhada. Se a fala correspondente for mais curta, a cena **acelera** em vez
de cortar a animação pela metade (`src/lib/timing.tsx`).

## Movimento

Além das entradas escalonadas, há três camadas de movimento contínuo:

- **Câmera** (`src/components/Camera.tsx`): cada cena tem um percurso de
  enquadramentos — aproxima do cartão narrado, percorre a lista, abre o plano.
  O alvo é limitado ao que o zoom cobre, então a câmera nunca revela borda.
- **Deriva de cena** (`SceneShell`): zoom lento e deslocamento ao longo de
  todo o bloco, na direção da transição de entrada.
- **Vida própria dos elementos**: flutuação dos cartões, ponteiros girando,
  sino balançando, selos pulsando, brilho correndo nas barras.

## Onde mexer

| O que mudar | Arquivo |
| --- | --- |
| Frame de cada virada, ordem, transições | `src/timeline.ts` → `SCENES` |
| Todos os textos da tela | `src/timeline.ts` → `TEXTS` |
| Volume por família de efeito | `src/timeline.ts` → `MIX` |
| Percurso da câmera de uma cena | `const CAM` / `moves` na própria cena |
| Cores, sombras, pesos de fonte | `src/theme.ts` |
| Curvas, molas e helpers de animação | `src/lib/anim.ts` |
| Animação interna de uma cena | `src/scenes/SceneNN.tsx` |
| Timbre dos efeitos sonoros | `tools/make_sfx.py` |

Cada bloco também é uma composição isolada no Studio (`S01`, `S08a`, `S08b`,
`S06b`, `S02b`…), o que permite revisar uma parte sem renderizar o vídeo todo.

## Estrutura

```
src/
  timeline.ts          decupagem, textos e mixagem
  theme.ts             tokens de marca amostrados das artes
  Video.tsx            montagem dos 13 blocos + efeitos das transições
  Root.tsx             composições registradas
  lib/anim.ts          molas, easings, stagger, typewriter, contador
  lib/timing.tsx       escala de tempo e variante de cada bloco
  lib/fonts.ts         Inter embutida em base64 (sem rede)
  components/          Backdrop, Camera, Logo, Text, Ui, Icons, Sfx, SceneShell
  scenes/Scene01..10   uma cena por arte de referência
  scenes/SceneApp      walkthrough do aplicativo (cursor + câmera)
  components/app/      kit de UI do app: AppKit, Screens, Cursor
public/
  fonts/               Inter (woff2, pesos 400–900)
  photos/              recortes fotográficos das artes
  sfx/                 19 efeitos sonoros sintetizados
tools/
  make_sfx.py          gerador dos efeitos (numpy → wav)
  embed_fonts.py       woff2 → base64
  find_cuts.py         detecta as pausas da narração
  encode-web.mjs       master → versão de entrega
```

## Efeitos sonoros

19 efeitos sintetizados proceduralmente (sem dependência externa), cobrindo a
lista pedida: whoosh curto e de transição, swipe, pop de UI, soft/bubble pop,
clique digital, tap, notificação, impacto, bass hit, sub boom, riser, reverse
whoosh, glitch, tick, chime de sucesso, sparkle e logo sting.

Cada disparo fica ao lado da animação que ele sonoriza, em frames de projeto —
a mesma escala de tempo da cena se aplica a eles:

```tsx
<Sfx name="notification_pop" at={70} gain={0.9} />
```

Os efeitos das transições são disparados em `Video.tsx`, em frames absolutos,
para permitir antecipação (riser/reverse whoosh antes do corte).
