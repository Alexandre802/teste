# Waatzo — Reel 1080x1920 (Remotion)

Vídeo vertical de ~86 s reconstruído a partir das 10 artes em
`referencias/imagens/`. **Sem narração** — apenas efeitos sonoros.
Cada elemento (card, ícone, campo de busca, número, gráfico, blob) é uma
camada React independente, animada separadamente. Nenhuma imagem de
referência é usada como frame estático.

## Rodar

```bash
npm install
npm run studio      # editor visual do Remotion
npm run render      # gera out/waatzo-reel.mp4
npm run sfx         # regera os efeitos sonoros em public/sfx/
```

> Neste ambiente o Chromium do sistema é usado via `remotion.config.ts`
> (`setBrowserExecutable`). Em outra máquina, apague essa linha para o
> Remotion baixar o próprio binário.

## Onde mexer

| O que mudar | Arquivo |
| --- | --- |
| Duração de cada cena, ordem, transições | `src/timeline.ts` → `SCENES` |
| Todos os textos da tela | `src/timeline.ts` → `TEXTS` |
| Volume por família de efeito | `src/timeline.ts` → `MIX` |
| Cores, sombras, pesos de fonte | `src/theme.ts` |
| Curvas, molas e helpers de animação | `src/lib/anim.ts` |
| Animação interna de uma cena | `src/scenes/SceneNN.tsx` |
| Timbre dos efeitos sonoros | `tools/make_sfx.py` |

Cada cena também é uma composição isolada (`S01`…`S10`) no Studio, o que
permite revisar e ajustar uma parte sem renderizar o vídeo inteiro.

## Estrutura

```
src/
  timeline.ts          painel de controle (durações, textos, mixagem)
  theme.ts             tokens de marca amostrados das artes
  Video.tsx            montagem das 10 cenas + efeitos das transições
  Root.tsx             composições registradas
  lib/anim.ts          molas, easings, stagger, typewriter, contador
  lib/fonts.ts         carregamento local da Inter (sem rede)
  components/          Backdrop, Logo, Text, Ui, Icons, Sfx, SceneShell
  scenes/Scene01..10   uma cena por arte de referência
public/
  fonts/               Inter (woff2, pesos 400–900)
  photos/              recortes fotográficos das artes
  sfx/                 19 efeitos sonoros sintetizados
tools/make_sfx.py      gerador dos efeitos (numpy → wav)
```

## Ritmo

As durações seguem o áudio de referência (85,7 s), distribuídas pelo peso
de cada trecho da copy. O campo `vo` em cada cena de `SCENES` registra qual
frase a cena representa — é só referência de ritmo, o áudio não entra no
vídeo.

## Efeitos sonoros

19 efeitos sintetizados proceduralmente (sem dependência de biblioteca
externa), cobrindo a lista pedida: whoosh curto e de transição, swipe,
pop de UI, soft/bubble pop, clique digital, tap, notificação, impacto,
bass hit, sub boom, riser, reverse whoosh, glitch, tick, chime de sucesso,
sparkle e logo sting.

Cada disparo fica ao lado da animação que ele sonoriza:

```tsx
<Sfx name="notification_pop" at={70} gain={0.9} />
```

Os efeitos das transições são disparados em `Video.tsx`, em frames
absolutos, para permitir antecipação (riser/reverse whoosh antes do corte).
