# Contexto do repositório

Site da **Casa de Ração Bandeira Branca** — pet shop em Jacareí-SP, revenda
PremieR Super Premium. Next.js 16 (App Router), TypeScript, Tailwind v4, Zustand.

O site anterior (Michel Food House, lanchonete) está em `arquivo/`, fora do
build e do typecheck. Não é para evoluir aquele código a partir daqui.

## Regras de conteúdo (as que mais importam aqui)

1. **Nenhum produto ou dado da casa dentro de JSX.** Catálogo em
   `data/products.ts`; seções em `data/sections.ts`; espécies e departamentos em
   `data/categories.ts`; banners e benefícios em `data/banners.ts`; telefone,
   WhatsApp e endereço em `data/business.ts`.
2. **Não inventar dado do negócio.** Preço, promoção, endereço, horário, prazo
   de entrega ou avaliação que a loja não confirmou não entra no site. Os preços
   de `data/products.ts` são rascunho de mercado e ficam escondidos atrás de
   `PRECOS_CONFIRMADOS`; o que a loja ainda não passou fica `null` e some da tela.
3. **Foto só do próprio produto.** Item sem fotografia confirmada usa
   `imagem: null` e cai no placeholder da marca. Nunca reaproveitar a foto de um
   item em outro, nem alterar a embalagem de uma marca.
4. **Nada de texto escondido para buscador.** Os termos de busca vivem no
   conteúdo visível e em `termos` do catálogo, que alimenta a busca do topo.
5. **Foto entra pelo nome do arquivo.** Salvar em `public/produtos/` com o nome
   igual ao `id` do produto basta — `npm run fotos` gera o mapa e roda sozinho
   antes de `dev` e `build`. Não é preciso editar o catálogo para isso.

## Antes de dar por pronto

- `npm run conferir` reprova id repetido, id com acento (o id vira nome de
  arquivo), categoria sem produto e âncora apontando para seção inexistente.
  Roda sozinho no `prebuild`.
- `npm test` sobe um navegador de verdade e checa âncoras em todas as páginas,
  cliques cobertos, carrinho, busca, carrossel, menu e login. Precisa do site
  no ar (`npm start`).

## Links de seção

Todo link para uma seção da home usa **`/#id`**, nunca `#id` — o rodapé, o menu
e a busca aparecem em `/carrinho` e `/login` também, e ali um `#id` sozinho não
leva a lugar nenhum. Use `paraSecao(id)` de `data/categories.ts`.

## Login

Auth.js v5 em `auth.ts`, com Google, Facebook e e-mail/senha. Um provedor só é
registrado se as chaves dele existirem no ambiente — botão que aparece na tela é
botão que funciona. E-mail e senha depende de `lib/usuarios.ts`, que ainda não
tem banco: o hash com scrypt já está pronto, falta ligar a consulta.

## Antes de construir UI

- A peça de referência aprovada é a fonte do design. Reproduzir antes de propor.
- A paleta é azul institucional sobre branco, amostrada da referência. Os tokens
  estão em `app/globals.css`, no bloco `@theme` — use `brand-500`, `brand-700`
  etc., não hex solto. Verde (`wa`) é exclusivo de ação de WhatsApp.
- Tipografia: Montserrat. Títulos pesados, texto de apoio limpo.
- Cards: borda fina `line`, sem sombra, raio `radius-card` / `radius-tile`.
- Consulte o sistema visual com o `ui-ux-pro-max` quando precisar decidir algo
  que a referência não cobre:
  `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain style`

## Animação

**Este projeto não usa biblioteca de animação.** Nada de Framer Motion, Remotion
ou motion design. As únicas movimentações são interações normais de interface:
carrossel (`translateX` + transição CSS), hover discreto, abrir menu, scroll
suave e feedback de botão. `prefers-reduced-motion` desliga o giro automático do
carrossel.

O recuo das âncoras é `scroll-padding-top` no `html`, e só ele — repetir com
`scroll-mt` nas seções soma os dois e a âncora para longe demais.

## Segredos

`.env.local` lê chaves por variável de ambiente. Nunca escreva chave em arquivo
versionado. Variáveis documentadas em `.env.example`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
