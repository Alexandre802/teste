# Render e publicação

## Studio (desenvolvimento)

```bash
npx remotion studio                    # entry point do remotion.config.ts
npx remotion studio remotion/index.ts
```

## Render local

```bash
# vídeo
npx remotion render HeroReel out/hero.mp4

# props dinâmicas
npx remotion render HeroReel out/cliente.mp4 --props='{"title":"Acme"}'
npx remotion render HeroReel out/cliente.mp4 --props=./data/acme.json

# frame estático (poster do hero)
npx remotion still HeroReel out/hero-poster.jpg --frame=45 --quality=90

# trecho
npx remotion render HeroReel out/corte.mp4 --frames=30-120
```

Listar o que existe: `npx remotion compositions`.

## Codecs e formatos

| Destino | Comando |
|---|---|
| MP4 H.264 (padrão, compatível) | `--codec=h264` |
| WebM VP9 (menor, web moderna) | `--codec=vp9 out/hero.webm` |
| WebM VP8 | `--codec=vp8` |
| Fundo transparente | `--codec=prores --prores-profile=4444` ou `--codec=vp9 --image-format=png` |
| GIF | `--codec=gif --every-nth-frame=2` |
| Só áudio | `--codec=mp3` / `--codec=wav` |
| Sequência de imagens | `--sequence --image-format=png` |

Qualidade e peso:

```bash
npx remotion render HeroReel out/hero.mp4 --crf=23     # 0 = sem perda, 51 = pior; 18–28 é a faixa útil
npx remotion render HeroReel out/hero.mp4 --scale=0.5  # renderiza em metade da resolução
```

Para loop de fundo de hero, comece em `--crf=30` no WebM e suba a qualidade só se aparecer
banding no gradiente.

Flags úteis: `--concurrency=4`, `--log=verbose`, `--muted`, `--overwrite`,
`--pixel-format=yuv420p` (compatibilidade máxima), `--gl=angle` (problemas de WebGL/Three).

## Render programático (Node)

```ts
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';

const serveUrl = await bundle({ entryPoint: path.resolve('remotion/index.ts') });
const inputProps = { title: 'Acme' };
const composition = await selectComposition({ serveUrl, id: 'HeroReel', inputProps });

await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  outputLocation: 'out/acme.mp4',
  inputProps,
});
```

É este o caminho para vídeo personalizado por usuário (rota de API, worker, fila).

## CI (GitHub Actions)

```yaml
- uses: actions/setup-node@v4
  with: { node-version: 22 }
- run: npm ci
- run: npx remotion render HeroReel out/hero.mp4 --codec=h264
- run: npx remotion render HeroReel out/hero.webm --codec=vp9
- run: npx remotion still HeroReel out/hero-poster.jpg --frame=45
- uses: actions/upload-artifact@v4
  with: { name: hero, path: out/ }
```

O Chrome Headless Shell é baixado pelo Remotion na primeira execução — cacheie
`~/.cache/remotion` (ou `node_modules/.remotion`) para acelerar o job. Em imagens enxutas,
instale as libs de sistema do Chrome (`libnss3`, `libatk-bridge2.0-0`, `libgbm1`, `libasound2`).

## AWS Lambda (render distribuído)

```bash
npm i @remotion/lambda
npx remotion lambda functions deploy
npx remotion lambda sites create remotion/index.ts --site-name=hero
npx remotion lambda render <serve-url> HeroReel
```

Vale quando há muitos vídeos personalizados ou peça longa; para um hero fixo, render no CI
é mais simples e mais barato. Precisa de credenciais AWS com as permissões do
`remotion lambda policies` — não commite chave nenhuma no repositório.

## Onde os arquivos entram no site

```
public/
├── hero.mp4
├── hero.webm
└── hero-poster.jpg
```

Sirva com cache longo e imutável (`Cache-Control: public, max-age=31536000, immutable`) e
versione o nome do arquivo quando o vídeo mudar. Em CDN, confirme que `video/webm` está no
`Content-Type` — servido errado, o navegador cai silenciosamente no MP4.

## Verificação pós-render

```bash
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate out/hero.mp4
```

Confira: duração = `durationInFrames / fps`, dimensões pares, codec esperado, tamanho dentro
do alvo.
