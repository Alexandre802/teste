# Três Estrelas — reel vertical

Peça de 30s em 9:16 (1080×1920), construída em Remotion. O motion segue a
linguagem extraída dos dois vídeos de referência em `referencias/audio/` e os
tempos saem das marcações da copy em `referencias/copy/`; a leitura completa
dessa análise está em `PLANO-VIDEO.md`, na raiz.

## Rodar

```bash
cd video
npm install
npm run dev     # abre o Remotion Studio
npm run build   # renderiza out/tres-estrelas.mp4
```

Neste ambiente o Chrome do Remotion não sobe sozinho; o render usa o
headless shell já instalado:

```bash
npx remotion render TresEstrelas out/tres-estrelas.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

## Como o motion está montado

Tudo é derivado de uma grade de tempo único, em `src/config/beat.ts`:

- **`BEAT = 15` quadros** (0,5s a 30fps) — os 120 BPM medidos na referência.
- Nenhuma animação começa fora da grade. `beat(n)` converte tempo musical em quadros.
- `overshoot()` é a entrada padrão: o elemento passa do ponto e volta, em ~0,4s.

A virada entre cenas é uma receita só, em `src/components/Fx.tsx`, aplicada
nos seis limites de cena:

1. estouro branco de ~2 quadros (`Flash`);
2. separação RGB com desfoque direcional (`RgbSplit`, ±6 quadros);
3. o tipo da cena nova assenta antes dos elementos laterais.

`src/config/timeline.ts` é a única fonte da estrutura: mexer ali muda a peça
inteira, sem tocar nas cenas. Os cortes das cenas seguem a copy — ESCALA em
8–12s, A GRANDE PROMESSA em 16–20s e a ASSINATURA em 27–30s.

## As artes no quadro vertical

As artes do repositório são 3:1 e o quadro é 9:16, então o corte vertical
mostra cerca de 19% da largura de cada arte. `src/config/plates.ts` define
por onde cortar:

- `focal` é a **fração horizontal da arte** que fica no centro do quadro.
  A conversão para `objectPosition` está em `Plate.tsx` — com `object-fit:
  cover` a porcentagem distribui o excedente, não aponta o pixel, e tratar
  as duas como a mesma coisa faz o recorte escorregar para cima do texto
  embutido na arte.
- `mode: 'inset'` faz a arte flutuar menor sobre o ambiente em código, com
  bordas esfumadas — é como a caixa protegida aparece na cena 6.
- `veil` é o quanto a arte é rebaixada. As artes ainda trazem a tipografia
  embutida, e os recortes foram escolhidos em regiões sem texto.

Quando os plates limpos (sem texto) chegarem:

1. substitua o arquivo em `public/plates/`;
2. vire `baked` para `false` naquela cena e leve `veil` para perto de zero.

## Áudio

Não há narração nem trilha no repositório. A timeline foi construída na grade
de 120 BPM justamente para receber a trilha depois sem remontagem: basta
adicionar o `<Audio>` em `src/Video.tsx`. Se a locução tiver marcação
diferente, os tempos de cena ficam todos em `src/config/timeline.ts`.

## Pendências

- Plates sem texto (ver acima).
- Logo Três Estrelas em PNG/SVG com transparência — hoje só existe embutido na arte.
- Fonte da marca: o display é aproximado com Anton + inclinação de -8°
  (`DISPLAY_SKEW` em `src/config/theme.ts`).
