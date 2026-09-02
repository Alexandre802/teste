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

## Fluxo de caixa (`/admin`)

Área administrativa privada, separada do site público. Todo pedido fechado no
site é gravado ANTES de o WhatsApp abrir (`app/api/pedido/registrar`), e o
número volta para a mensagem como `*PEDIDO #XXXX*`.

- Banco: Supabase, migrations em `supabase/migrations`, tudo com o prefixo
  `comida_caseira_`. Rodar em ordem; o primeiro administrador é criado pela
  instrução no fim de `0006`.
- **Dinheiro é sempre inteiro em centavos**, do banco à tela (`lib/admin/dinheiro.ts`).
  Nenhuma coluna nem variável de valor é float.
- **Datas no fuso `America/Sao_Paulo`** (`lib/admin/datas.ts`). O banco guarda
  `timestamptz`; quem decide o que é "hoje" é essa camada.
- **Preço nunca vem do navegador.** `comida_caseira_create_order` recebe id do
  produto e quantidade; preço, custo, taxa e total saem da tabela. Vale o mesmo
  para a taxa de entrega, cuja única fonte é `comida_caseira_delivery_zones`.
- **Pedido feito ≠ dinheiro recebido.** O pedido nasce `pending`. Só ao marcar
  como pago é que nasce um lançamento em `comida_caseira_entries`. Estorno é
  linha negativa, nunca exclusão.
- **RLS em tudo.** O visitante do site não lê pedido, caixa, despesa, cliente
  nem custo. A chave `service_role` não é usada em lugar nenhum do projeto.
- O custo do produto (`cost_cents`) é exclusivo do admin e **nunca** aparece no
  site.
- Sem as variáveis do Supabase configuradas, o painel diz o que falta e o site
  segue pelo WhatsApp — a regra do "nada de função falsa" vale aqui também.

## Testes

`npm run test:e2e` (constrói antes, por `pretest:e2e`). Playwright, em celular e
desktop. Cobrem o conteúdo exato da mensagem do WhatsApp, endereço obrigatório
na entrega, ausência de endereço na retirada, troco, proteção das APIs contra
payload adulterado, responsividade de 360 a 1920 px e o manifesto do PWA.

Do fluxo de caixa: `e2e/fluxo-de-caixa.spec.ts` (registro antes do WhatsApp,
falha fechada, idempotência) e `e2e/painel.spec.ts`.

O banco tem teste próprio, que roda num Postgres local sem Supabase:

```
psql -f supabase/tests/00_shim_supabase.sql
psql -f supabase/migrations/0001_...   # e os demais, em ordem
psql -f supabase/tests/01_fluxo.sql
```

Ele confere o caminho todo — pedido criado pelo anônimo, preço recalculado,
idempotência, RLS fechada, pendente ≠ recebido, marcar pago, despesa,
cancelamento, estorno e auditoria — e apaga o que criou.

## Segredos

`.env.local` e `.mcp.json` leem chaves por variável de ambiente. Nunca escreva chave
em arquivo versionado. Variáveis documentadas em `.env.example`.

Segredo **jamais** em variável `NEXT_PUBLIC_*` — esse prefixo entrega o valor ao
navegador. O que falta configurar está em `RELATORIO-PRODUCAO.md`.
