# Setup do projeto Remotion

Versão de referência: **Remotion 4.0.516** (todos os pacotes `@remotion/*` são versionados
em conjunto — mantenha-os na mesma versão exata, senão o render quebra).

## Caminho A — projeto novo só de vídeo

```bash
npx create-video@latest
```

Escolha o template (`Blank`, `Hello World`, `Tailwind`, `Stills`, `Audiogram`, `Music
visualization`, entre outros). Depois:

```bash
npm run dev        # abre o Remotion Studio em http://localhost:3000
```

## Caminho B — Remotion dentro de um site existente

Mantenha o vídeo isolado numa pasta e compartilhe design tokens com o site.

```
site/
├── app/ | src/            # Next.js ou Vite
├── remotion/
│   ├── index.ts           # registerRoot
│   ├── Root.tsx           # <Composition>
│   └── compositions/
│       └── HeroReel.tsx
├── public/                # assets consumidos por staticFile()
├── remotion.config.ts
└── package.json
```

```bash
npm i remotion @remotion/cli @remotion/player
npx remotion studio remotion/index.ts
```

Aponte o entry point no `remotion.config.ts` para não repetir o caminho:

```ts
import { Config } from '@remotion/cli/config';

Config.setEntryPoint('./remotion/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
```

## Entry point e raiz

```ts
// remotion/index.ts
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
```

```tsx
// remotion/Root.tsx
import { Composition } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import { HeroReel } from './compositions/HeroReel';

export const heroSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  accent: zColor(),
});

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="HeroReel"
        component={HeroReel}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={heroSchema}
        defaultProps={{
          title: 'Construído com Remotion',
          subtitle: 'Animação que é código',
          accent: '#6366f1',
        }}
      />
    </>
  );
};
```

O `schema` Zod faz o Studio gerar um painel de edição das props — é o que permite ao
usuário mexer no texto sem tocar no código. Use `zColor()` para color picker e
`zTextarea()` para texto longo (`@remotion/zod-types`).

### Duração calculada a partir dos dados

Quando a duração depende de props (ex.: áudio, número de slides), use `calculateMetadata`:

```tsx
<Composition
  id="Explainer"
  component={Explainer}
  schema={explainerSchema}
  defaultProps={{ slides: [] }}
  fps={30}
  width={1920}
  height={1080}
  durationInFrames={1}
  calculateMetadata={({ props }) => ({
    durationInFrames: props.slides.length * 90,
  })}
/>
```

## Dimensões por destino

| Destino | Resolução | fps |
|---|---|---|
| Hero de site / YouTube | 1920×1080 | 30 |
| Reels / TikTok / Shorts | 1080×1920 | 30 |
| Post quadrado | 1080×1080 | 30 |
| Vídeo de fundo leve (loop) | 1280×720 | 24–30 |

`width` e `height` devem ser **pares** — codecs H.264 exigem.

## Tailwind

```bash
npm i @remotion/tailwind-v4 tailwindcss
```

```ts
// remotion.config.ts
import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

Config.overrideWebpackConfig(enableTailwind);
```

Importe o CSS no `Root.tsx`. Compartilhe o mesmo arquivo de tokens (`@theme`) entre site e
composições — cor divergente entre hero e vídeo é o erro mais comum desta stack.

## Fontes

```tsx
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();
```

`loadFont()` já cuida do `delayRender` interno. Para fonte local, coloque em `public/` e
carregue com `@remotion/fonts`:

```tsx
import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

await loadFont({ family: 'Satoshi', url: staticFile('fonts/Satoshi.woff2') });
```

## Assets

```tsx
import { Img, staticFile } from 'remotion';

<Img src={staticFile('logo.svg')} />
```

Dados externos (API, fetch) devem segurar o render:

```tsx
const [handle] = useState(() => delayRender('carregando métricas'));
useEffect(() => {
  fetch('/api/stats')
    .then((r) => r.json())
    .then((d) => { setData(d); continueRender(handle); })
    .catch((e) => cancelRender(e));
}, [handle]);
```

## Pacotes úteis

| Pacote | Uso |
|---|---|
| `@remotion/player` | Embutir a animação no site |
| `@remotion/transitions` | Transições entre cenas |
| `@remotion/shapes` | `<Circle>`, `<Rect>`, `<Triangle>`, `<Star>`, `<Pie>` |
| `@remotion/google-fonts` | Fontes do Google com carregamento seguro |
| `@remotion/media` | `<Video>` / `<Audio>` (geração mais recente) |
| `@remotion/media-utils` | Duração de áudio, waveform, `visualizeAudio` |
| `@remotion/lambda` | Render distribuído na AWS |
| `@remotion/zod-types` | `zColor()`, `zTextarea()` para o painel do Studio |
| `@remotion/motion-blur` | `<Trail>`, `<CameraMotionBlur>` |
| `@remotion/paths` | Animação de traçado SVG |
