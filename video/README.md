# Reel Monttra — Remotion 1080×1920

Vídeo vertical (9:16) de **67 s / 2010 frames a 30 fps**, reconstruído em React a
partir das 10 imagens de `referencias/imagens`, seguindo o ritmo da copy em
`referencias/copy`.

**Sem narração.** A faixa de áudio é composta apenas por efeitos sonoros.

---

## Como rodar

```bash
cd video
npm install

npm run dev        # Remotion Studio (preview interativo)
npm run render     # out/monttra-reel.mp4
npm run typecheck
```

Neste ambiente o Chrome do Remotion não pode ser baixado, então o render usa o
Chromium já instalado:

```bash
npx remotion render MonttraReel out/monttra-reel.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

### Composições registradas

| ID | O que é |
|---|---|
| `MonttraReel` | o reel completo |
| `Solo-s1` … `Solo-s10` | uma cena isolada, para iterar rápido |

---

## Onde mudar cada coisa

O projeto foi organizado para que **duração, textos, animação e timing** sejam
editáveis sem mexer no layout das cenas.

| Quero mudar… | Arquivo |
|---|---|
| duração de uma cena, transição, trilha de SFX | `src/config/scenes.ts` |
| qualquer texto ou número em tela | `src/config/copy.ts` |
| cores, tipografia, sombras, presets de mola | `src/config/theme.ts` |
| como um elemento entra (delay/direção/escala) | prop `enter` da `<Layer>` na cena |
| curvas das transições entre cenas | `src/transitions.tsx` |

A duração total da composição é **calculada** a partir de `scenes.ts`
(`TOTAL_DURATION = Σ durações − Σ transições`). Mudar a duração de uma cena
reajusta o vídeo inteiro sozinho.

### Exemplo — deixar a cena 4 mais longa e trocar a transição

```ts
// src/config/scenes.ts
{
  id: "s4",
  durationInFrames: 300,                                  // era 258
  transition: { kind: "wipeGreen", durationInFrames: 24 } // era glitchDark/20
  ...
}
```

---

## Estrutura

```
video/
├── public/
│   ├── fonts/        Plus Jakarta Sans (woff2 vendorizado, sem rede no render)
│   └── sfx/          18 efeitos sonoros .wav
├── tools/
│   └── generate_sfx.py   sintetiza os SFX (Python puro, determinístico)
└── src/
    ├── config/       theme · copy · scenes
    ├── components/   primitivas reutilizáveis
    ├── scenes/       Scene01…Scene10 + shell
    ├── transitions.tsx
    ├── MonttraReel.tsx
    └── Root.tsx
```

### Componentes

`Layer` é a peça central: posiciona um elemento em coordenadas absolutas na tela
1080×1920 e recebe a sua **própria** animação de entrada. Nenhuma cena anima uma
imagem inteira — cada card, ícone, número, barra e decorativo é uma `Layer`
independente.

| Componente | Função |
|---|---|
| `Layer` | camada posicionada + entrada + flutuação contínua |
| `anim.ts` | `useEnter`, `useProgress`, `useCountUp`, `useFloat`, `usePulse`, `useParallax`, `useExit` |
| `Headline` | título revelado linha a linha por máscara, com stagger |
| `NumberText` | contagem progressiva no formato pt-BR |
| `TypeWriter` | digitação caractere a caractere com cursor |
| `Sparkline` / `GroupedBars` / `Donut` / `Ring` / `ProgressBar` / `Timeline` | gráficos que se desenham |
| `PhoneFrame` | mockup de iPhone em CSS (a tela é um container React) |
| `Logo` | marca com as barras crescendo em stagger |
| `Backdrop` | fundos claro e escuro com parallax |
| `SfxTrack` | dispara os efeitos nos frames declarados |

---

## Cenas

| # | Cena | Frames | Transição p/ a próxima | Bloco da copy |
|---|---|---|---|---|
| 1 | Gancho — "Método não dá resultado." | 198 | slideUp | Método não dá resultado. Mas sabe por quê? |
| 2 | Ganhos e gastos espalhados | 226 | fadeScale | …espalhados em anotações, planilhas e contas |
| 3 | Faz dinheiro, não vê o lucro | 198 | slideLeft | …mas não consegue enxergar quanto está ganhando |
| 4 | Quanto realmente sobrou? | 258 | glitchDark | quanto entrou, saiu, sobrou — e a próxima semana |
| 5 | Nasceu a Monttra *(escura)* | 226 | wipeGreen | Foi pensando nisso que nasceu a Monttra |
| 6 | Acompanhe tudo que entrou e saiu | 228 | slideUp | por dia, semana, mês, 90 dias ou ano |
| 7 | Calculadora de surebets | 258 | fadeScale | Registra suas surebets… lucro, ROI |
| 8 | Defina metas | 196 | slideLeft | E ainda define metas |
| 9 | Clareza para planejar | 168 | glitchDark | …ter clareza para planejar os próximos passos |
| 10 | CTA final *(escura)* | 212 | — | Teste a Monttra gratuitamente por 3 dias |

---

## Efeitos sonoros

Os 18 efeitos são **sintetizados proceduralmente** por `tools/generate_sfx.py`
(sem dependências externas e determinístico — regerar produz bytes idênticos):

```bash
python3 tools/generate_sfx.py
```

`whoosh-short` · `whoosh-transition` · `swipe-fast` · `pop-ui` · `pop-soft` ·
`click-digital` · `tap-button` · `notification-pop` · `impact-hit` · `bass-hit` ·
`sub-boom` · `riser-short` · `reverse-whoosh` · `glitch-digital` · `tick-micro` ·
`chime-success` · `sparkle-shine` · `logo-sting`

Cada cena declara suas próprias deixas em `scenes.ts`, em frames relativos ao
início da cena:

```ts
sfx: [
  c(0,  "reverse-whoosh", 0.5),   // sucção antes do primeiro elemento
  c(41, "impact-hit",    0.75),   // batida na palavra "resultado."
  ...ticks(70, 5, 4, 0.22),       // microcliques acompanhando as barras
]
```

---

## Nota sobre as referências

O briefing citava "ConsulTech" e "5 imagens", mas as referências entregues são
**10 peças da Monttra** — a identidade seguida aqui é a da Monttra (verde
`#0EA46A`, tinta `#0B2A20`, fundo `#F2F3F0`), preservando textos, posições,
cores e composição de cada peça.

As imagens não entram no vídeo como bitmap: tudo foi **reconstruído nativamente**
em React/SVG/CSS, então a saída é 1080×1920 real, sem upscale nem perda.
