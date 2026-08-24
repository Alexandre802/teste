# Animação: timeline, interpolate, spring, transições

Tudo aqui parte do mesmo princípio: **o frame atual é a única fonte de tempo**.

```tsx
const frame = useCurrentFrame();
const { fps, durationInFrames, width, height } = useVideoConfig();
```

## interpolate — o cavalo de batalha

```tsx
import { interpolate, Easing } from 'remotion';

const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

const y = interpolate(frame, [0, 30], [40, 0], {
  easing: Easing.out(Easing.cubic),
  extrapolateRight: 'clamp',
});
```

Sempre passe `extrapolateLeft`/`extrapolateRight: 'clamp'` quando o valor não deve continuar
crescendo fora do intervalo — sem isso a opacidade passa de 1 e o elemento "estoura".

Multi-estágio numa chamada só:

```tsx
const scale = interpolate(frame, [0, 15, 90, 105], [0.8, 1, 1, 1.1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

Easings disponíveis: `Easing.linear`, `Easing.ease`, `Easing.quad`, `Easing.cubic`,
`Easing.bezier(x1,y1,x2,y2)`, `Easing.elastic()`, `Easing.bounce`, combináveis com
`Easing.in/out/inOut`.

## spring — movimento com física

```tsx
import { spring } from 'remotion';

const entrada = spring({
  frame,
  fps,
  config: { damping: 200, mass: 1, stiffness: 100 },
  durationInFrames: 30,   // opcional: encaixa a mola numa duração fixa
});

<div style={{ transform: `scale(${entrada})` }} />
```

Presets práticos:

| Sensação | config |
|---|---|
| Suave, sem overshoot | `{ damping: 200 }` |
| Pop leve (UI) | `{ damping: 12, mass: 0.5, stiffness: 100 }` |
| Elástico | `{ damping: 8, mass: 1, stiffness: 120 }` |

Para atrasar uma mola, desloque o frame: `spring({ frame: frame - 20, fps })`.

## Sequence — posicionar no tempo

```tsx
import { Sequence, AbsoluteFill } from 'remotion';

<AbsoluteFill>
  <Sequence durationInFrames={60}>
    <Intro />
  </Sequence>
  <Sequence from={60} durationInFrames={90}>
    <Features />
  </Sequence>
</AbsoluteFill>
```

Dentro de uma `<Sequence>`, `useCurrentFrame()` é **relativo ao início da sequence** — cada
cena anima do frame 0. É isso que torna as cenas reutilizáveis.

`<Series>` encadeia sem calcular offsets à mão:

```tsx
import { Series } from 'remotion';

<Series>
  <Series.Sequence durationInFrames={60}><Intro /></Series.Sequence>
  <Series.Sequence durationInFrames={90}><Features /></Series.Sequence>
  <Series.Sequence durationInFrames={45} offset={-10}><CTA /></Series.Sequence>
</Series>
```

`offset` negativo sobrepõe a cena anterior — útil para cross-fade manual.

## Transições entre cenas

```tsx
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={70}>
    <Hero />
  </TransitionSeries.Sequence>

  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 20 })}
  />

  <TransitionSeries.Sequence durationInFrames={90}>
    <Produto />
  </TransitionSeries.Sequence>

  <TransitionSeries.Transition
    presentation={slide({ direction: 'from-right' })}
    timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
  />

  <TransitionSeries.Sequence durationInFrames={60}>
    <CTA />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

A duração da transição é **descontada** do total: duas cenas de 70 e 90 com transição de 20
resultam em 140 frames, não 160. Some isso ao calcular `durationInFrames` da composição.

Apresentações disponíveis: `fade`, `slide`, `wipe`, `flip`, `clockWipe`, `iris`, `none`
(cada uma importada do seu próprio subcaminho).

## Loop, Freeze, Still

```tsx
import { Loop, Freeze } from 'remotion';

<Loop durationInFrames={45}>   {/* repete o ciclo até o fim da composição */}
  <Pulse />
</Loop>

<Freeze frame={30}>            {/* congela o filho no frame 30 */}
  <Chart />
</Freeze>
```

## Texto e revelação

Máscara de subida (mais limpo que animar cada letra):

```tsx
<div style={{ overflow: 'hidden' }}>
  <div style={{ transform: `translateY(${interpolate(frame, [0, 25], [100, 0], {
    easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp',
  })}%)` }}>
    {title}
  </div>
</div>
```

Stagger por palavra:

```tsx
{words.map((w, i) => {
  const s = spring({ frame: frame - i * 4, fps, config: { damping: 14 } });
  return (
    <span key={i} style={{ display: 'inline-block', opacity: s, transform: `translateY(${(1 - s) * 20}px)` }}>
      {w}&nbsp;
    </span>
  );
})}
```

## Áudio e vídeo

```tsx
import { Audio, staticFile } from 'remotion';
import { Video } from '@remotion/media';   // ou <OffthreadVideo> de 'remotion'

<Audio src={staticFile('trilha.mp3')} volume={0.6} startFrom={30} />
<Video src={staticFile('bg.mp4')} />
```

Fade de áudio em função do frame:

```tsx
<Audio
  src={staticFile('trilha.mp3')}
  volume={(f) => interpolate(f, [0, 30], [0, 0.8], { extrapolateRight: 'clamp' })}
/>
```

`<OffthreadVideo>` extrai frames com FFmpeg e é o mais confiável no render;
`@remotion/media` é a geração mais recente dos componentes de mídia. Não use a tag
`<video>` nativa — ela não é capturada.

## Aleatoriedade determinística

```tsx
import { random } from 'remotion';

const particulas = new Array(40).fill(0).map((_, i) => ({
  x: random(`x-${i}`) * width,
  y: random(`y-${i}`) * height,
}));
```

`random(seed)` devolve sempre o mesmo valor para a mesma seed — obrigatório, porque o render
distribuído executa frames em processos diferentes.

## Antipadrões

| Não faça | Faça |
|---|---|
| `transition: all .3s` no CSS | `interpolate(frame, ...)` |
| `useState` + `setInterval` para avançar cena | `<Sequence from={...}>` |
| Framer Motion / GSAP com relógio próprio | valores derivados do frame |
| `Math.random()` | `random('seed')` |
| `new Date()` | prop de entrada com data fixa |
| `<video>` / `<audio>` nativos | `<Video>` / `<Audio>` do Remotion |
| `durationInFrames` hardcoded no componente | `useVideoConfig()` |
