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
