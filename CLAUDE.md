# Contexto do repositório

Site da **Michel Food House** — lanchonete em Jacareí-SP. Next.js 16 (App Router),
TypeScript, Tailwind v4, Framer Motion, Zustand.

## Regras de conteúdo (as que mais importam aqui)

1. **Nenhum produto ou dado da casa dentro de JSX.** Produtos e categorias em
   `lib/catalog.ts`; endereço, telefone, horário e avaliações em `lib/business.ts`.
2. **Não inventar dado do negócio.** Preço, ingrediente, promoção, horário de
   fechamento, prazo de entrega ou avaliação que não esteja confirmado não entra —
   nem no site, nem no prompt do atendente automático. Onde a descrição de origem
   vinha truncada, o texto termina em "…" e fica assim.
3. **Foto só do próprio produto.** Item sem fotografia confirmada usa `image: null`
   e cai no placeholder da marca. Nunca reaproveitar a foto de um item em outro.
4. **Nada de texto escondido para buscador.** Os termos de busca vivem em conteúdo
   visível (`components/sections/BuscaLocal.tsx`). Texto oculto é cloaking e arrisca
   o domínio.

## Antes de construir UI

- Decida o sistema visual com o `ui-ux-pro-max`:
  `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain style`
- Prefira blocks reais do MCP `shadcn-ui` a escrever seção do zero.
- A paleta é exclusivamente laranja (laranja intenso → queimado → âmbar → dourado)
  sobre marrom quase preto. Os tokens estão em `app/globals.css`, no bloco `@theme`.

## Animação

O lanche do hero se abre com o scroll (`components/hero/ExplodedBurger.tsx`). O
progresso vem da geometria da seção, não de `useScroll` com `target` — quando o filho
monta, a ref do pai ainda está vazia e o framer mede a página inteira. Só `transform`
e `opacity` são animados. `prefers-reduced-motion` entrega o lanche montado e imóvel.

Para peça de **vídeo** (campanha, reels), use a skill `remotion-site` — lá a regra é
outra: toda animação é função de `useCurrentFrame()`.

## Segredos

`.env.local` e `.mcp.json` leem chaves por variável de ambiente. Nunca escreva chave
em arquivo versionado. Variáveis documentadas em `.env.example`.
