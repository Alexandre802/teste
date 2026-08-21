# Três Estrelas — filme institucional

Peça de 30s em **3840×1280 (3:1)**, construída em Remotion. É a mesma
proporção das artes do cliente (2172×724) e dos vídeos de referência, então
cada arte entra inteira no quadro: sem barra lateral e sem recorte. O motion segue a
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

## As artes no quadro

Em 3:1 a arte coincide com o quadro: entra inteira, sem recorte e sem barra.
`focal` e `pan` em `src/config/plates.ts` deixam de recortar; só o `veil`
segue em uso, para rebaixar a arte onde a camada animada precisa de espaço.

Como as artes vêm achatadas, com a tipografia embutida, a camada animada
**não redesenha o que a arte já entrega**. Ela anima por cima:

- as listas dentro das três telas da cena 1, medidas com grade sobre a arte;
- as notificações chegando nas colunas laterais, num espaço aberto por um
  degradê que apaga os cards embutidos;
- os marcadores do rastreio acendendo em sequência na cena 4 — o aparelho
  está em perspectiva na arte, então nada de retângulo reto por cima;
- a rota e a caixa atravessando o mapa na cena 5;
- a estrutura pulsando ao redor da caixa e as estrelas acendendo na cena 6.

Quando os plates limpos (sem texto) chegarem, substitua o arquivo em
`public/plates/` e vire `baked` para `false` naquela cena.

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
