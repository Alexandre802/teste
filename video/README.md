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

São 13 blocos e **cada arte aparece uma única vez** — não há cena reprisada.
Dois blocos vêm de capturas de tela e não das 10 artes: `APP` (o walkthrough
do aplicativo) e `CHAT` (a conversa dentro do WhatsApp, mensagem a mensagem).
O `S12` é a única cena inteiramente criada aqui — tipografia no mesmo sistema
visual, para o fecho argumentativo da copy.

| bloco | fala | entra em | dur |
| --- | --- | --- | --- |
| S01 | A maioria dos profissionais… | 0,00 s | 4,7 s |
| S02 | Perde porque o concorrente respondeu primeiro | 4,65 s | 3,0 s |
| S03 | Você atende clientes o dia inteiro… | 7,68 s | 5,8 s |
| S04 | Enquanto você está fazendo um corte… mandando mensagem | 13,43 s | 6,9 s |
| S05 | Elas chamam o próximo salão… | 20,30 s | 8,4 s |
| **APP** | **Foi exatamente para resolver isso que nasceu o Waatzo…** | **28,65 s** | **7,2 s** |
| S07 | …respondendo clientes, agendando horários | 35,90 s | 5,3 s |
| S08 | enviando lembretes e recuperando quem sumiu | 41,23 s | 3,5 s |
| S09 | Tudo automaticamente, 24 horas por dia | 44,69 s | 6,9 s |
| **CHAT** | **Ele confirma agendamentos… responde objeções de preço** | **51,64 s** | **10,9 s** |
| S06 | É como ter uma funcionária que nunca atrasa… | 62,50 s | 6,6 s |
| S12 | …ninguém respondeu a tempo | 69,09 s | 8,0 s |
| S10 | Teste grátis por 14 dias | 77,07 s | 8,6 s |

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

Cada bloco também é uma composição isolada no Studio (`S01`, `APP`, `CHAT`,
`S12`…), o que permite revisar uma parte sem renderizar o vídeo todo.

O roteiro da conversa fica em `MSG`, dentro de `SceneChat.tsx`: cada entrada
diz em que frame a mensagem chega e em que frame o "digitando…" aparece antes
dela. As marcas foram tiradas das pausas reais da locução nesse trecho
(52,2 s · 54,2 s · 56,7 s · 58,9 s).

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
  scenes/Scene12       fecho argumentativo em tipografia
  scenes/SceneApp      walkthrough do aplicativo (cursor + câmera)
  scenes/SceneChat     a conversa no WhatsApp, mensagem a mensagem
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
