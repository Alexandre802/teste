---
name: remotion-site
description: "Criação de sites com vídeo/animação programática em Remotion (React). Use ao construir landing pages, hero animados, explainers, teasers, reels ou qualquer seção de site cuja animação seja renderizada com Remotion (@remotion/player embutido no site, ou MP4/WebM/GIF renderizado). Cobre scaffold do projeto, composições, timeline, springs, transições, integração no Next.js/Vite, render local e na Lambda, além dos MCPs de UI (shadcn/ui, 21st.dev) e do FILM (frame interpolation) para slow motion."
---

# Remotion Site — construção de sites com vídeo programático

Skill de orquestração para construir **sites cuja identidade visual é movimento**: hero
animado, explainer embutido, teaser renderizado em MP4, reels para social, transições de
seção. Toda animação é escrita em React e é uma **função pura do frame atual**.

## Quando aplicar

Aplique quando o pedido envolver:

- landing page / site com hero animado, vídeo de fundo ou explainer;
- gerar MP4 / WebM / GIF / sequência de PNG a partir de componentes React;
- vídeo com dados dinâmicos (nome do cliente, métricas, preço, screenshot);
- embutir um player de animação controlável dentro de um site React/Next.js;
- pipeline de render (local, CI ou AWS Lambda).

Não aplique para: animação puramente CSS de microinteração (hover, focus), backend, ou
edição de vídeo já filmado sem componente React envolvido.

## Stack instalada neste repositório

| Recurso | O que resolve | Como acessar |
|---|---|---|
| `ui-ux-pro-max` (+ `design`, `design-system`, `brand`, `ui-styling`, `banner-design`, `slides`) | Estilo, paleta, tipografia, padrão de landing, checklist de acessibilidade | `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain style` |
| MCP `shadcn-ui` | Código-fonte real de componentes e blocks shadcn/ui v4 + temas TweakCN | ferramentas `list_components`, `get_component`, `get_block`, `list_themes` |
| MCP `21st` | Busca e geração de componentes de UI do 21st.dev | ferramentas `search`, `generate`, `get_inspiration`, `search_logo` |
| Remotion 4.x | Composições, timeline, render | `npx remotion studio`, `npx remotion render` |
| FILM (frame interpolation) | Slow motion / interpolação entre frames, opcional e offline | `references/frame-interpolation.md` |

Detalhes de cada MCP e quando chamar cada um: `references/mcp-and-tools.md`.

## Pipeline

Siga na ordem. Não pule a etapa 1 — decisão visual antes de código evita retrabalho.

1. **Definir o sistema visual.** Rode a busca do `ui-ux-pro-max` para o tipo de produto e
   fixe estilo, paleta, par tipográfico e padrão de seções. Registre a decisão em
   `design/DESIGN.md` do projeto antes de escrever componente.
2. **Decidir o formato de entrega.** Três caminhos, e eles mudam a arquitetura:
   - *Player embutido* — animação interativa dentro do site (`@remotion/player`);
   - *Arquivo renderizado* — MP4/WebM servido como `<video>` de fundo ou asset de campanha;
   - *Ambos* — Player em dev/preview, MP4 em produção para peso e performance.
3. **Scaffold.** `references/setup.md` — projeto novo, ou pasta `remotion/` dentro de um
   site já existente.
4. **Compor.** Uma `<Composition>` por peça, `durationInFrames`/`fps` explícitos, props
   validadas com Zod para permitir edição no Studio.
5. **Animar.** `references/animation.md` — `useCurrentFrame`, `interpolate`, `spring`,
   `Sequence`, `TransitionSeries`.
6. **Integrar ao site.** `references/site-integration.md` — Player em Next.js/Vite, SSR,
   lazy load, poster, `prefers-reduced-motion`.
7. **Renderizar e publicar.** `references/render-deploy.md` — CLI, codecs, CI, Lambda.

## Regras invioláveis do Remotion

Quebrar qualquer uma destas produz vídeo com frames errados ou travado no render:

- **A animação é função do frame.** Todo valor animado deriva de `useCurrentFrame()`.
  Nunca use `setInterval`, `setTimeout`, `requestAnimationFrame`, `transition`/`animation`
  do CSS, Framer Motion ou GSAP com relógio próprio para o que aparece no vídeo. O render
  não roda em tempo real — ele salta de frame em frame.
- **Componentes puros.** Mesmo frame + mesmas props ⇒ mesmo pixel. Nada de `Math.random()`
  ou `Date.now()` soltos; use `random("seed")` do Remotion.
- **Assets locais via `staticFile()`**, servidos de `public/`. Nunca caminho relativo cru.
- **Assets assíncronos precisam segurar o frame** com `delayRender()` / `continueRender()`,
  senão o render captura o estado incompleto.
- **`fps`, `width`, `height`, `durationInFrames` são declarados na `<Composition>`** e lidos
  com `useVideoConfig()`. Não hardcode número de frames dentro do componente.
- **Áudio e vídeo só entram por componentes do Remotion** (`<Audio>`, `<Video>` /
  `<OffthreadVideo>`). `<video>` e `<audio>` nativos não são capturados.

## Licença — verificar antes de entregar

Remotion é gratuito para indivíduos e organizações de até 3 pessoas, e **exige licença de
empresa** acima disso ou para determinados usos comerciais. Antes de fechar entrega para
cliente, confirme os termos atuais em <https://remotion.dev/license> e sinalize ao usuário.
Não decida isso silenciosamente por ele.

## Checklist antes de entregar

- [ ] Nenhuma animação depende de tempo real (grep por `setInterval|setTimeout|requestAnimationFrame|transition:|animation:`)
- [ ] `npx remotion render` completa sem warning de asset e o MP4 abre
- [ ] Primeiro e último frame conferidos (`npx remotion still`)
- [ ] Duração real bate com `durationInFrames / fps`
- [ ] Áudio sincronizado e sem clipping no corte
- [ ] Player embutido: não bloqueia LCP, tem `poster`, respeita `prefers-reduced-motion`
- [ ] Textos passam contraste 4.5:1 sobre o fundo animado no frame mais claro e no mais escuro
- [ ] Sem emoji como ícone — SVG (Lucide/Heroicons/Phosphor)
- [ ] Responsivo: a composição escala por `style={{ width: '100%' }}` no Player, não por media query interna
- [ ] Licença Remotion verificada com o usuário

## Referências

- `references/setup.md` — scaffold, estrutura de pastas, Tailwind, fontes, Zod
- `references/animation.md` — timeline, interpolate, spring, sequences, transições
- `references/site-integration.md` — `@remotion/player` em Next.js e Vite
- `references/render-deploy.md` — render local, codecs, CI, Lambda
- `references/mcp-and-tools.md` — shadcn-ui MCP, 21st MCP, ui-ux-pro-max
- `references/frame-interpolation.md` — FILM para slow motion
