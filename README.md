# Remotion video examples

Videos written as React components and rendered frame by frame with
[Remotion](https://www.remotion.dev/). The ConsulTech ad is the deliverable;
the rest are examples, from a 40-line primer to a full animated Pokédex.

## Quick start

```bash
npm install
npm run dev      # opens Remotion Studio — pick a composition and scrub
```

Render one to MP4:

```bash
npm run render:ad                               # ConsulTech ad → out/consultech-ad-master.mp4
npm run render                                  # ProductLaunch → out/product-launch.mp4
npx remotion render PokedexShowcase out/dex.mp4 # any composition by id
```

## Delivered files

`dist/` holds the finished ad and **is versioned**. `out/` is scratch — renders
and stills land there and are gitignored, so anything in `out/` disappears with
the working copy.

| File | What it is |
| --- | --- |
| `dist/consultech-ad-master.mp4` | The ad. 1080×1920, 30fps, 70.4s, CRF 22, narration embedded. |

The render is deterministic — `npm run render:ad` reproduces that file, and
`npm run render:ad:max` produces a near-lossless CRF 14 version (much larger)
if a broadcast master is ever needed.

## The compositions

| id | Length | What it shows |
| --- | --- | --- |
| `ConsulTechAd` | 70.4s | **The deliverable.** Vertical ad cut to a voiceover — see below. |
| `ProductLaunch` | 13.8s | Drifting aurora background, word-by-word spring text, staggered feature cards, counting stat tiles. Four scenes joined with fade / slide / wipe transitions. |
| `PokedexShowcase` | 15.8s | A Pokédex walkthrough — title, roster cards, a detail page with animating base-stat bars. Animated entirely with the animate.css ports. |
| `AnimateGallery` | 6s | Reference sheet: all twelve animate.css presets side by side, looping. |
| `HelloFrame` | 3s | The smallest useful example — `useCurrentFrame`, `useVideoConfig`, `interpolate`, `spring`, seeded `random`. Start here. |

## The ConsulTech ad

A 70s vertical ad built to a supplied voiceover (`public/audio/narration.mp3`).

**The edit is derived from the audio, not guessed.** The narration was analysed
with ffmpeg's `silencedetect` to locate every pause between spoken phrases; all
15 scene cuts in `src/ConsulTech/timing.ts` sit *inside* those pauses, so the
picture never changes over a word. `BEAT` holds the in-scene beats where the
narrator enumerates things — the four query categories, the five services, the
three benefits — so each element lands on the word that names it.

If the voiceover is re-recorded, re-run the analysis and update `CUT` / `BEAT`:

```bash
node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg \
  -i public/audio/narration.mp3 -af silencedetect=noise=-30dB:d=0.30 -f null - 2>&1 \
  | grep silence
```

**No subtitles.** On-screen copy is only ever a few heavy words reinforcing what
is being said — never a transcript of it.

**Nothing is a bitmap.** Every icon, panel, dashboard, chart and the logo mark
are drawn as SVG/DOM and animated. The brand artwork was used as reference for
colour, layout and iconography only; none of it is composited into the video.

Poppins — the brand face, identified from the rate-card PDF — is vendored in
`public/fonts/` and loaded via `FontFace` + `delayRender()` in `theme.ts`, so
renders are deterministic and work with no network.

```
src/ConsulTech/
├── ConsulTechAd.tsx      the Series of 15 scenes + audio + backdrop drive
├── timing.ts             cut points derived from the narration's pauses
├── theme.ts              brand tokens + local Poppins loading
├── components/           logo, circuit backdrop, HUD, icons, kinetic type
└── scenes/               Problem → Solution → Services → Close
```

## How this is put together

```
src/
├── Root.tsx                  every <Composition> is registered here
├── HelloFrame.tsx            the primer
├── lib/animate/              animate.css → Remotion
│   ├── presets.ts            keyframes as pure functions of progress
│   ├── Animate.tsx           <Animate preset={bounceIn} delay={10}> wrapper
│   └── AnimateGallery.tsx    the reference sheet composition
├── ProductLaunch/
│   ├── timing.ts             all durations; the composition length derives from these
│   ├── theme.ts              colour + type tokens
│   ├── animation.ts          shared spring/interpolate helpers
│   └── scenes/               title, features, stats, outro
└── Pokedex/
    ├── data.ts               type palette and entry data
    ├── PokedexShowcase.tsx   the TransitionSeries
    └── scenes/               intro, roster, detail, outro
```

### Animation is a function of the frame

Nothing here uses `useState`, `useEffect`, or a timer. Every visual is computed
from `useCurrentFrame()`, which is what lets Remotion seek to any frame and
render frames out of order across cores. Randomness goes through Remotion's
seeded `random()` rather than `Math.random()`, so the starfield in
`ProductLaunch` is identical on every machine and every run.

### animate.css, ported

[animate.css](https://github.com/animate-css/animate.css) is a CSS `@keyframes`
library — the browser owns the clock, so its animations can't be seeked. In
`src/lib/animate/presets.ts` each animation is rewritten as a function of
progress (0 → 1), with the keyframe stops transcribed from the library's
`source/` directory and their `animation-timing-function` mapped to Remotion's
`Easing`. For example `bounceIn`'s `0.3 → 1.1 → 0.9 → 1.03 → 0.97 → 1` scale
becomes one `interpolate()` call over the input range `[0, .2, .4, .6, .8, 1]`.

Twelve presets are ported: `fadeIn(Up|Down|Left|Right)`, `bounceIn`,
`bounceInUp`, `backInDown`, `zoomIn`, `flipInX`, `lightSpeedInRight`, plus the
looping attention seekers `pulse`, `tada` and `headShake`.

```tsx
<Animate preset={bounceIn} delay={10} durationInFrames={26}>
  <Card />
</Animate>
```

### Timing

Scene durations are constants, and the composition's `durationInFrames` is
derived from them — for a `TransitionSeries`, transitions overlap the scenes on
both sides, so the total is `sum(scenes) − sum(transitions)`. Retime a scene and
the video length follows automatically.

## Rendering without network access

Remotion downloads its own Chrome Headless Shell on first render. If that host
is blocked, point it at a Chromium you already have:

```bash
npx remotion render ProductLaunch out/video.mp4 \
  --browser-executable=/path/to/chrome
```

## Credits and asset notice

- **Remotion** — https://github.com/remotion-dev/remotion
- **animate.css** — https://github.com/animate-css/animate.css. The presets in
  `src/lib/animate/presets.ts` are a port of its keyframes, not a copy of its
  code.
- **flutter_pokedex** by Pham Sy Hung (MIT) —
  https://github.com/hungps/flutter_pokedex. The Pokédex example follows its
  layout and uses its type-colour palette; the images in `public/pokemon/` come
  from that repository's `assets/images/`.

⚠️ The Pokémon sprites and names are the intellectual property of Nintendo /
Game Freak / The Pokémon Company. They are here for a non-commercial example,
the same way the reference project uses them. **Swap them for your own artwork
before using this in anything you ship or publish.** Everything else in the
Pokédex example — layout, animation, stat bars — works unchanged with different
images and data in `src/Pokedex/data.ts`.

## Working on this with Claude Code

`.claude/skills/remotion/SKILL.md` holds the full Remotion ruleset, and
`CLAUDE.md` describes this repo's conventions. Both load automatically.
