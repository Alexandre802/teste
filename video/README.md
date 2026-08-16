# Nubank Reels — 1080×1920 / Remotion

Vídeo vertical de 22,5 s (9 cenas de 2,5 s), 1080×1920 @ 60 fps, com trilha de
efeitos sonoros e **sem narração**, construído em Remotion + React.

As cenas foram **reconstruídas em código** a partir das 5 imagens de referência
em `../referencias/imagens/`. Nenhuma cena é a foto animada inteira: cartão,
chip, bandeira, logo, tela do app, botões, gráficos e ícones são camadas
independentes, cada uma com sua própria animação.

## Rodar

```bash
npm install
npm run dev        # abre o Remotion Studio para revisar e ajustar
npm run render     # gera out/nubank-reels.mp4
```

O render usa o Chromium já instalado na máquina — o caminho está em
`remotion.config.ts`. Em outra máquina, apague essa linha e o Remotion baixa o
próprio navegador.

## Onde mexer

Quase todo ajuste do dia a dia acontece em **um arquivo só**:

### `src/config/timeline.ts`
Duração, textos e efeitos sonoros de cada cena.

```ts
{
  id: "s01-leque",
  title: ["O FUTURO", "DO DINHEIRO", "É SIMPLES."],
  durationInSeconds: 2.5,        // muda aqui e o vídeo inteiro se recalcula
  sfx: [
    { at: 0.0,  sound: "sub-boom", volume: 0.9 },   // `at` em segundos, relativo à cena
    { at: 0.35, sound: "whoosh-short", volume: 0.7 },
  ],
}
```

- Mudar `durationInSeconds` de qualquer cena reajusta o início de todas as
  seguintes e a duração total da composição, sem tocar em mais nada.
- `title` é a legenda de referência da cena. O texto que aparece na tela mora no
  componente da cena (cada linha tem seu próprio timing de entrada).
- Para trocar um som, basta trocar o nome — a lista completa está no tipo
  `SfxName`.

### `src/config/theme.ts`
Cores (amostradas pixel a pixel das referências), fontes e formato do vídeo.

### `src/scenes/SceneNN*.tsx`
O motion de cada cena. Os frames-chave estão em constantes no topo do arquivo
(`IMPACT`, `SWAP_START`, `CHECK_HIT`…), então dá para reajustar o ritmo sem
caçar números no meio do JSX.

### `src/scenes/index.ts`
Liga o `id` da timeline ao componente. Cena sem componente registrado é pulada —
útil para trabalhar em uma cena isolada.

## Estrutura

```
src/
  config/
    theme.ts        paleta, tipografia, formato
    timeline.ts     duração, textos e marcação de SFX  ← painel de controle
  lib/
    anim.ts         curvas de easing, springs, shake, motion blur, stagger
    fonts.ts        carrega Archivo/Inter locais antes do primeiro frame
  components/
    NuCard.tsx      cartão em camadas (corpo, chip, contactless, logo, bandeira, brilho)
    AppScreen.tsx   tela do app em DOM, rolável e com seções destacáveis
    PhoneFrame.tsx  aparelho, bisel, ilha dinâmica, reflexo de vidro
    Cursor.tsx      ponteiro dirigido por waypoints, com clique e arrasto
    Widgets.tsx     contador, gráfico que se desenha, escudo+check, pódio neon
    TextFX.tsx      revelação por máscara, stagger por palavra, impacto, saída
    Backdrop.tsx    fundo, light leak, poeira, vinheta e grão
    Icons.tsx       ícones da interface em SVG
    SfxTrack.tsx    converte as marcações da timeline em faixas de áudio
  scenes/           uma cena por arquivo
tools/
  make_sfx.py       sintetiza os 18 efeitos sonoros
  make_textures.py  gera grão, light leak, vinheta e fundo
public/
  sfx/    18 WAV 48 kHz estéreo
  img/    texturas de acabamento
  fonts/  Archivo + Inter (subset latino)
```

## Efeitos sonoros

Os 18 efeitos são **sintetizados**, não sampleados de banco — `tools/make_sfx.py`
constrói cada um em DSP (varredura de filtro para os whooshes, envelopes
percussivos para os impactos, parciais de sino para os chimes, gating aleatório
para o glitch). Para regerar ou ajustar:

```bash
python3 tools/make_sfx.py
```

Disponíveis: `whoosh-short`, `whoosh-transition`, `swipe-pass`, `pop-ui`,
`pop-soft`, `click-digital`, `tap-button`, `notification`, `impact`, `bass-hit`,
`sub-boom`, `riser`, `reverse-whoosh`, `glitch`, `tick`, `success`, `sparkle`,
`logo-sting`.

## Roteiro

| # | Tempo | Cena | Motion |
|---|-------|------|--------|
| 1 | 0:00–0:02,5 | O futuro do dinheiro é simples | cartões entram em profundidade e abrem em leque mostrando as cores |
| 2 | 0:02,5–0:05 | Uma conta feita para dar mais controle | cartão sobe do pódio, ícones orbitam |
| 3 | 0:05–0:07,5 | Menos burocracia. Mais liberdade | MENOS é expulso, MAIS entra com impacto |
| 4 | 0:07,5–0:10 | Tudo na palma da mão | zoom no app, botões em stagger, cursor abre o crédito, rola a tela e chega no Pix |
| 5 | 0:10–0:12,5 | Seu dinheiro merece mais | destaque luminoso em MAIS, linha e contador crescendo |
| 6 | 0:12,5–0:15 | Seu dinheiro rende | números contando e gráfico se desenhando |
| 7 | 0:15–0:17,5 | Mais segurança. Sempre | escudo se desenha, check chega com impacto |
| 8 | 0:17,5–0:20 | Controle na palma da mão | aparelho sobe, notificações em stagger |
| 9 | 0:20–0:22,5 | Menos complicação. Mais possibilidades | palavras trocam de posição, fecho com a assinatura |

## Observação sobre as referências

O briefing citava "identidade da ConsulTech", mas as 5 imagens de referência são
todas do Nubank — o vídeo seguiu o que está nas imagens. As peças usam marcas
registradas de terceiros (Nubank, Mastercard); para uso além de estudo/portfólio,
confirme a autorização de uso das marcas.
