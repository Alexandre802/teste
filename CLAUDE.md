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

## Pedido

O checkout inteiro vive em `components/cart/CartDrawer.tsx`, que orquestra os
passos: sacola → entrega/retirada → identificação → endereço → pagamento →
revisão → confirmação. O endereço é pulado na retirada.

- Endereço com campos, validação e formatação: `lib/endereco.ts`. Rua, número e
  bairro são obrigatórios; o resto é opcional.
- Forma de pagamento e troco: `lib/pagamento.ts`. O formato das linhas que a
  cozinha recebe está travado por teste.
- Taxa, pedido mínimo, área e prazo: `lib/entrega.ts`. **Tudo `null` até o
  proprietário confirmar** — o site não mostra número que ninguém confirmou.
- A mensagem do WhatsApp é montada em `lib/whatsapp.ts` e o `wa.me` funciona
  sem nenhuma credencial. É o caminho garantido; a Cloud API é um extra.

## Nada de função falsa

Regra que vale para o projeto todo: **método que não funciona de verdade não
aparece na tela.** Sem credencial configurada, a opção some e o site diz o que
está acontecendo — nunca simula. Isso já foi violado três vezes e cada uma
podia chegar ao cliente como fraude:

- pagamento em "modo demonstração" que reportava o pedido como pago;
- botões de Google e Facebook que davam o cliente por autenticado sem verificar
  nada;
- código de acesso por e-mail devolvido na própria resposta da API.

Rota que depende de credencial ausente **falha fechada**, com mensagem honesta.

## Testes

`npm run test:e2e` (constrói antes, por `pretest:e2e`). Playwright, em celular e
desktop. Cobrem o conteúdo exato da mensagem do WhatsApp, endereço obrigatório
na entrega, ausência de endereço na retirada, troco, proteção das APIs contra
payload adulterado, responsividade de 360 a 1920 px e o manifesto do PWA.

## Segredos

`.env.local` e `.mcp.json` leem chaves por variável de ambiente. Nunca escreva chave
em arquivo versionado. Variáveis documentadas em `.env.example`.

Segredo **jamais** em variável `NEXT_PUBLIC_*` — esse prefixo entrega o valor ao
navegador. O que falta configurar está em `RELATORIO-PRODUCAO.md`.
