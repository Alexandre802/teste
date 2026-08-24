# Integrar a animação no site

Duas formas de o vídeo chegar ao usuário. Escolha antes de escrever componente.

| | `@remotion/player` | MP4/WebM renderizado |
|---|---|---|
| Interativo (props em runtime, controle do usuário) | sim | não |
| Peso na página | bundle React + composição | só o arquivo |
| Personalização por visitante | sim | não |
| Melhor para | configurador, preview, demo interativa | hero de fundo, campanha, social |

Padrão recomendado para landing page: **MP4 em produção no hero** (leve, começa a tocar
rápido) e **Player** apenas em seções interativas.

## Player em React/Vite

```tsx
import { Player } from '@remotion/player';
import { HeroReel } from '../remotion/compositions/HeroReel';

export const HeroPreview = () => (
  <Player
    component={HeroReel}
    inputProps={{ title: 'Seu produto', subtitle: 'em movimento', accent: '#6366f1' }}
    durationInFrames={150}
    fps={30}
    compositionWidth={1920}
    compositionHeight={1080}
    style={{ width: '100%' }}   // escala responsiva: largura fluida, altura pelo aspect ratio
    controls
    loop
    autoPlay
    acknowledgeRemotionLicense
  />
);
```

Pontos que costumam morder:

- `compositionWidth`/`compositionHeight` são a resolução **interna**; `style.width` é o
  tamanho **na página**. Nunca use media query dentro da composição para responsividade —
  deixe o Player escalar.
- `autoPlay` só funciona com áudio mudo na maioria dos navegadores. Combine com
  `muted` e ofereça um botão de som.
- `inputProps` deve ser memoizado, senão remonta a cada render do pai.

## Player em Next.js (App Router)

O Player é client-only. Isole num componente com `'use client'` e carregue sem SSR:

```tsx
// components/HeroPlayer.tsx
'use client';
import { Player } from '@remotion/player';
import { HeroReel } from '@/remotion/compositions/HeroReel';

export default function HeroPlayer(props: { title: string }) {
  const inputProps = useMemo(() => ({ ...props }), [props.title]);
  return (
    <Player
      component={HeroReel}
      inputProps={inputProps}
      durationInFrames={150}
      fps={30}
      compositionWidth={1920}
      compositionHeight={1080}
      style={{ width: '100%' }}
      loop
      autoPlay
      acknowledgeRemotionLicense
    />
  );
}
```

```tsx
// app/page.tsx
import dynamic from 'next/dynamic';
const HeroPlayer = dynamic(() => import('@/components/HeroPlayer'), { ssr: false });
```

Se o projeto do site e o do Remotion forem separados, o `transpilePackages` do Next precisa
alcançar o pacote das composições.

## Controle programático

```tsx
import { Player, PlayerRef } from '@remotion/player';

const ref = useRef<PlayerRef>(null);

ref.current?.play();
ref.current?.pause();
ref.current?.seekTo(90);
ref.current?.getCurrentFrame();

useEffect(() => {
  const p = ref.current;
  if (!p) return;
  const onFrame = () => setFrame(p.getCurrentFrame());
  p.addEventListener('frameupdate', onFrame);
  return () => p.removeEventListener('frameupdate', onFrame);
}, []);
```

Eventos: `play`, `pause`, `ended`, `seeked`, `frameupdate`, `timeupdate`, `error`,
`fullscreenchange`, `ratechange`, `volumechange`.

Tocar só quando o hero entra na viewport:

```tsx
const [visible, setVisible] = useState(false);
useEffect(() => {
  const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
  if (boxRef.current) io.observe(boxRef.current);
  return () => io.disconnect();
}, []);
useEffect(() => { visible ? ref.current?.play() : ref.current?.pause(); }, [visible]);
```

## Vídeo renderizado como fundo de hero

```tsx
<section className="relative isolate overflow-hidden">
  <video
    className="absolute inset-0 -z-10 h-full w-full object-cover"
    autoPlay muted loop playsInline
    poster="/hero-poster.jpg"
    preload="metadata"
  >
    <source src="/hero.webm" type="video/webm" />
    <source src="/hero.mp4" type="video/mp4" />
  </video>
  <div className="absolute inset-0 -z-10 bg-black/45" />  {/* legibilidade do texto */}
  <h1 className="...">…</h1>
</section>
```

Regras para não destruir a performance da landing:

- gere o `poster` com `npx remotion still` — é o LCP real, o vídeo não é;
- `preload="metadata"`, nunca `auto`;
- ofereça WebM (VP9/AV1) antes do MP4; o navegador escolhe o primeiro que suporta;
- loop de fundo: 6–10 s, sem áudio, corte que casa começo e fim;
- alvo de peso: < 2 MB para loop de fundo em 1080p (ajuste CRF, veja `render-deploy.md`).

## Acessibilidade

```tsx
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

- `prefers-reduced-motion: reduce` ⇒ mostre o poster estático em vez do vídeo/Player;
- vídeo de fundo é decorativo: sem informação exclusiva nele, e `aria-hidden` no elemento;
- texto sobre vídeo precisa de camada de contraste (overlay ou gradiente) — meça 4.5:1 no
  frame mais claro **e** no mais escuro;
- se houver narração, forneça legenda (`<track kind="captions">`) ou transcrição;
- nada de autoplay com som.
