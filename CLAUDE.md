# Contexto do repositório

Repositório de criação de sites com **Remotion** (animação/vídeo programático em React).

## Antes de construir qualquer UI ou animação

1. Use a skill **`remotion-site`** (`.claude/skills/remotion-site/SKILL.md`) — ela define o
   pipeline e as regras invioláveis do Remotion.
2. Decida o sistema visual **antes** de escrever componente, com o `ui-ux-pro-max`:
   `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain style`
3. Prefira blocks reais do MCP `shadcn-ui` (`list_blocks` / `get_block`) a escrever seções do
   zero. Gere componente novo (MCP `21st`) só quando não existir nada próximo.

## Regra que mais quebra render no Remotion

Toda animação é função de `useCurrentFrame()`. Nada de `setInterval`, `setTimeout`,
`requestAnimationFrame`, `transition`/`animation` do CSS, `Math.random()` ou `Date.now()`
dentro de composição. Detalhes em `.claude/skills/remotion-site/SKILL.md`.

## Segredos

`.mcp.json` lê chaves por variável de ambiente (`GITHUB_PERSONAL_ACCESS_TOKEN`,
`TWENTY_FIRST_API_KEY`). Nunca escreva chave em arquivo versionado.
