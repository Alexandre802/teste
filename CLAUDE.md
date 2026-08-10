# CLAUDE.md

This is a Remotion video app: videos are React components, rendered frame by frame.

**Before writing or editing any composition, scene, or animation, read
`.claude/skills/remotion/SKILL.md`.** It is the full ruleset for this project —
component rules, media tags, timing with `Sequence`/`Series`/`TransitionSeries`,
`interpolate`/`spring`, and the determinism constraints. Remotion's own docs are
at https://www.remotion.dev/docs/.

## Layout

| Path | What it is |
| --- | --- |
| `src/Root.tsx` | Registers every `<Composition>`. New videos get added here. |
| `src/ProductLaunch/` | Product-launch example: aurora background, staggered text, stat counters. |
| `src/Pokedex/` | Pokédex example, styled after `hungps/flutter_pokedex`. |
| `src/lib/animate/` | animate.css keyframes ported to frame-driven Remotion presets. |
| `src/HelloFrame.tsx` | Minimal composition demonstrating the four core primitives. |
| `public/` | Local assets. Reference them with `staticFile()`, never a bare path. |

## Conventions in this repo

- **Durations live in one place.** Scene lengths are constants
  (`src/ProductLaunch/timing.ts`, `POKEDEX_SCENES` in `PokedexShowcase.tsx`) and
  the composition's `durationInFrames` is derived from them. With a
  `TransitionSeries`, total = sum(scenes) − sum(transitions). Never hardcode a
  total that can drift from the scenes.
- **Animation goes through `src/lib/animate`** when an animate.css preset fits
  (`fadeInUp`, `bounceIn`, `zoomIn`, `flipInX`, …). Reach for raw `spring()` or
  `interpolate()` for anything those don't cover.
- **Copy is a prop, not a literal.** Scene text comes in through
  `defaultProps` so it stays editable in Remotion Studio.
- `Math.random()`, `Date.now()`, `useState`, `useEffect` and event handlers do
  not belong in a composition. Use `random('seed')` and the frame number.

## Commands

```bash
npm run dev        # Remotion Studio at localhost:3000
npm run render     # render the ProductLaunch composition to out/
npm run typecheck  # tsc --noEmit
```

Rendering needs a Chrome/Chromium. If Remotion cannot download its own
(restricted network), pass an existing one:

```bash
npx remotion render <id> out/video.mp4 --browser-executable=/path/to/chrome
```

## ConsulTech ad (`src/ConsulTech/`)

A 70s vertical (1080×1920) ad cut to a supplied voiceover.

- **Timing is derived, not guessed.** `public/audio/narration.mp3` was analysed
  with ffmpeg `silencedetect` to find every pause; the cut points in
  `timing.ts` sit inside those pauses, and `BEAT` holds the in-scene beats where
  the narrator lists items. Re-record the voiceover → re-run the analysis and
  update `CUT`/`BEAT`.
- **No subtitles.** On-screen copy is only ever a few heavy words reinforcing
  the voice. Never caption the narration.
- **Poppins is vendored** in `public/fonts/` and loaded via `FontFace` +
  `delayRender()` in `theme.ts`. Do not switch to a CDN webfont — a network
  fetch at render time is non-deterministic and silently falls back.
- Everything on screen is drawn (SVG/DOM). No bitmap assets from the brand deck.
