# Três Estrelas — banner animado

Peça de 30s em formato 3:1, construída em Remotion. O motion segue a
linguagem extraída dos dois vídeos de referência em `referencias/audio/`;
a leitura completa dessa análise está em `PLANO-VIDEO.md`, na raiz.

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
inteira, sem tocar nas cenas.

## Trocar os plates

As artes atuais são composições achatadas, **com o texto embutido na imagem**.
Enquanto for assim, `src/config/plates.ts` marca cada uma com `baked: true` e
o fundo recebe um véu que rebaixa a arte para a camada animada aparecer sozinha.

Quando os plates limpos (sem texto) chegarem:

1. substitua o arquivo em `public/plates/`;
2. vire `baked` para `false` naquela cena.

O véu some, o fundo volta à intensidade cheia e a cena passa a ser
arte limpa + camadas animadas em código. Nenhuma outra mudança é necessária.
Na cena 3, `baked: false` também troca o número da arte pelo contador em
código, que conta até 100.000.

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
