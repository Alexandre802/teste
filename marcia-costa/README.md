# Comida Caseira da Márcia Costa

Site e PWA de pedidos da **Comida Caseira da Márcia Costa** — marmitas, comida
caseira, lanches e açaí com entrega em Jacareí e São José dos Campos.

Next.js 16 (App Router), TypeScript, Tailwind v4, Framer Motion, Zustand e
Lucide. Projeto independente: nenhum dado, texto, foto ou componente de outro
restaurante do repositório é usado aqui.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run typecheck
npm run lint
npm run test:e2e # Playwright, celular e desktop (constrói antes)
```

## Fluxo do cliente

`/` (home) → `/cardapio` → produto → `/pedido` → `/pagamento` → `/confirmacao`
→ WhatsApp. A home vem antes de qualquer produto, como pedido no briefing.

O carrinho fica no `localStorage`, então recarregar a página não perde o pedido.

## Onde ficam os dados

Nenhum produto, preço, endereço ou horário mora dentro de componente. Para
atualizar o site, mexa só nestes três arquivos:

| Arquivo | O que guarda |
| --- | --- |
| `data/menu-original.json` | O cardápio oficial, como veio da fonte pública da casa |
| `data/menu.ts` | Tipa e expõe o JSON acima para a interface |
| `data/restaurant.ts` | Nome, logo, WhatsApp, Instagram, endereço, horários, links |
| `data/deliveryZones.ts` | Cidades atendidas, taxa, pedido mínimo e prazo |

Os tipos estão em `types/index.ts`.

## O que ainda falta cadastrar

O site **não inventa dado que a casa não confirmou**. Enquanto faltar, a tela
mostra "Informação a cadastrar" e o recurso que depende do dado fica desligado,
com aviso honesto. O que está pendente hoje:

- **Instagram** e **chave do Google Maps** — sem elas o feed some e o mapa vira
  o endereço com um botão que abre o aplicativo.
- **Instagram** (`NEXT_PUBLIC_INSTAGRAM`). Sem perfil, a seção de feed some.
- **Horários** (`restaurant.openingHours`, hoje uma lista vazia).
- **Taxa de entrega, pedido mínimo e prazo** (`data/deliveryZones.ts`, hoje
  `null`). Enquanto forem `null`, o resumo escreve "a combinar no WhatsApp" e o
  total soma apenas o subtotal.
- **Açaí e lanches.** O cardápio oficial da casa no InstaDelivery publica
  apenas `MARMITEX IRRESISTÍVEL` e `BEBIDAS`. Açaí e lanches apareciam nas
  telas de referência do começo do projeto, mas **não estão na fonte** — veja
  `README-CARDAPIO.md`. Enquanto não forem confirmados, o site não os anuncia.

Copie `.env.example` para `.env.local` e preencha o que já estiver confirmado.
Nenhuma dessas variáveis é segredo — são dados públicos exibidos no próprio
site. **Nunca** coloque chave de API em variável `NEXT_PUBLIC_*`: esse prefixo
entrega o valor ao navegador.

## Imagens

`public/images/` guarda `brand/`, `products/` e `banners/`. Todas saíram das
telas de referência da própria casa, em `referencias/`, recortadas por
`scripts/extrair-imagens.py` (`npm run imagens`).

Para trocar por uma fotografia real, basta sobrescrever o arquivo em
`public/images/` — o script não precisa rodar de novo. Produto sem foto própria
usa `image: null` e cai no selo da marca; nunca reaproveite a foto de um item em
outro.

## Testes

`npm run test:e2e` roda em viewport de celular e de desktop e cobre: a home
aparecendo antes dos produtos, carrinho (somar, diminuir, remover, sobreviver ao
reload), fechamento dos modais pelo X, por fora e pelo Esc, endereço obrigatório
na entrega e ausente na retirada, troco, todas as formas de pagamento, o texto
exato da mensagem do WhatsApp, o manifesto do PWA, área de toque mínima de 44px
e ausência de rolagem horizontal de 360 a 1920 px.

Em ambiente com o Chromium instalado fora do Playwright, aponte
`PLAYWRIGHT_CHROMIUM_PATH` para o executável.

---

## Fluxo de caixa (área administrativa)

Além do site de pedidos, o projeto tem um painel privado em `/admin` onde a
Márcia acompanha vendas, recebimentos, despesas e lucro. **Todo pedido feito
pelo site entra no painel sozinho** — ninguém precisa cadastrar venda à mão.

### Como o pedido chega ao caixa

Quando o cliente toca em "Enviar pedido no WhatsApp":

1. o navegador manda para o servidor **apenas** id do produto, quantidade e
   opções escolhidas — nunca preço nem total;
2. a função `comida_caseira_create_order` recalcula no banco o preço, os
   adicionais, o custo, a taxa de entrega e o total;
3. o pedido é gravado e devolve um número;
4. só então a mensagem é montada, já com `*PEDIDO #XXXX*`, e o WhatsApp abre.

Se o banco não responder, **o WhatsApp não abre**: a tela diz que não foi
possível registrar o pedido e pede para tentar de novo. Pedido não some em
silêncio.

Tocar duas vezes em "enviar" não cria dois pedidos: cada checkout carrega uma
chave de idempotência, e o banco devolve o pedido que já existe. O botão também
trava enquanto a gravação acontece.

### Dinheiro: as quatro contas

O sistema não trata todo pedido como dinheiro recebido.

| Número | O que é |
| --- | --- |
| **Faturamento bruto** | Soma dos pedidos pagos ou concluídos |
| **Recebimentos** | Dinheiro que entrou de fato (inclui receita manual, desconta estorno) |
| **A receber** | Pedidos não cancelados que ainda estão como pendentes |
| **Lucro bruto** | Faturamento − custo dos produtos |
| **Lucro líquido** | Recebimentos − custo dos produtos − despesas |

Um pedido novo nasce como **pendente**. Só quando a casa marca **pago** ele
vira recebimento. Cancelar tira do faturamento; se já estava pago, o painel
oferece registrar o **reembolso**, que lança o estorno em vez de apagar o
histórico.

### Telas

Resumo (com gráfico de vendas, formas de pagamento e últimos pedidos), Pedidos,
detalhe do pedido com as ações de status, Receitas, Despesas, Relatórios,
Caixa (abertura, sangria, suprimento e fechamento), Produtos (onde se informa o
**custo**, que nunca aparece no site), Clientes e Configurações.

No computador o menu é uma barra lateral; no celular, uma barra inferior com o
botão central `+` para lançar receita ou despesa.

### Banco de dados

Supabase (PostgreSQL). As migrations estão em `supabase/migrations`, com o
prefixo `comida_caseira_` para nunca se misturar com outro cliente. Dinheiro
sempre em **centavos** (`bigint`) — float não entra perto de caixa. Cada item
do pedido guarda um **snapshot** do nome, do preço e do custo: mudar o preço
amanhã não reescreve o que o cliente pagou ontem.

Segurança: a RLS está ativa em todas as tabelas. O cliente anônimo **não lê
nada** — nem pedido, nem despesa, nem cliente, nem custo — e a única coisa que
consegue executar é a função de criar pedido. Papéis: `owner`, `manager` e
`cashier` (o caixa registra, mas não apaga lançamento nem muda preço).

### Configurar

```bash
# 1. Crie um projeto no Supabase, exclusivo da Comida Caseira.
# 2. Aplique supabase/migrations/*.sql em ordem (SQL Editor ou CLI).
# 3. Preencha .env.local:
#      NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# 4. Leve o cardápio para o banco (o servidor precisa dos preços):
SUPABASE_SERVICE_ROLE_KEY=... npm run sincronizar-produtos
# 5. Crie o usuário da Márcia em Authentication e libere o acesso:
#      insert into comida_caseira_users (user_id, nome, role)
#      values ('<id do usuário>', 'Márcia', 'owner');
```

Não existe cadastro público de conta administrativa. Sem o passo 5, um usuário
autenticado não enxerga absolutamente nada.

### Testes do banco

```bash
npm run test:db
```

Sobe um Postgres descartável, aplica as migrations e roda 70 verificações:
o cenário 2× R$ 25,00 + R$ 5,00 de entrega = R$ 55,00, preço enviado pelo
navegador sendo ignorado, opção de outro produto descartada, idempotência,
marcar pago, cancelar, reembolsar, fechamento de caixa e a RLS vista pelos
papéis `anon`, dona, intruso autenticado e caixa.

### O que ainda tem duas fontes

Telefone, WhatsApp, Instagram e endereço aparecem tanto nas Configurações do
painel quanto nas variáveis `NEXT_PUBLIC_*`. O **site público lê as variáveis**;
o painel guarda o registro interno. A tela de Configurações avisa isso em
destaque. As **taxas de entrega não** têm esse problema: site e servidor leem a
mesma tabela `comida_caseira_delivery_zones`.

---

## Avaliações animadas (Remotion)

A seção **Avaliações** da home é uma peça Remotion: toda animação é função de
`useCurrentFrame()`, sem `setTimeout` nem transição de CSS, então o mesmo frame
sempre gera o mesmo pixel — no player e no render.

```
remotion/
  index.ts                        registerRoot
  Root.tsx                        composições e duração calculada dos dados
  compositions/AvaliacoesReel.tsx a peça em si
```

```bash
npm run remotion          # abre o Remotion Studio para editar
npm run remotion:render   # gera out/avaliacoes.mp4 (para Instagram, por exemplo)
```

O `@remotion/player` entra por import dinâmico (`components/home/AvaliacoesPlayer.tsx`),
então o bundle do Remotion não pesa no primeiro carregamento da home. A peça só
toca quando a seção entra na tela, e **não toca** para quem configurou
`prefers-reduced-motion`.

**Avaliações são reais ou não existem.** `data/avaliacoes.ts` começa vazio. Sem
depoimento cadastrado, a peça mostra a marca e o site diz que ainda não há
avaliações — nada de elogio inventado. O `aggregateRating` do schema.org só é
emitido quando existe avaliação de verdade: estrela falsa no resultado de busca
é motivo de penalização e é mentira para quem clica.

**Licença:** o Remotion é gratuito para pessoas físicas e organizações de até 3
pessoas, e exige licença de empresa acima disso. Confira os termos atuais em
<https://remotion.dev/license> antes de publicar comercialmente.

## Mapa

A seção **Onde estamos** usa o Google Maps Embed API. Três situações, nenhuma
delas fingindo:

| Situação | O que aparece |
| --- | --- |
| Endereço + `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Mapa embutido |
| Endereço sem chave | O endereço e um botão que abre o Google Maps |
| Sem endereço | "Informação a cadastrar" |

Iframe do Maps sem chave carrega uma vez e depois passa a devolver erro — seria
um mapa quebrado na frente do cliente, e por isso o site não tenta.

## As 100 palavras-chave

Estão em `data/palavras-chave.ts`, em sete grupos, e aparecem em **conteúdo
visível** na seção "O que entregamos, e onde"
(`components/sections/BuscaLocal.tsx`).

Duas coisas que valem dizer com todas as letras:

1. **`<meta name="keywords">` é ignorado pelo Google desde 2009.** A lista está
   lá porque não custa nada, mas quem ranqueia é o texto que o cliente lê.
2. **Texto escondido para buscador é cloaking** e pode custar o domínio. Por
   isso cada termo está numa lista visível, sob um título e uma frase de
   verdade sobre o que a casa faz. Um teste automatizado falha se qualquer
   termo ficar invisível.

Nenhum termo promete prato que a casa não faz: entram os produtos confirmados,
as categorias atendidas, a forma de pedir e as cidades.


---

## Versões das dependências

O projeto está no máximo que a cadeia do Next 16 aceita hoje. Duas ficaram
para trás **de propósito**, e vale saber por quê antes de subir:

| Pacote | Em uso | Última | Por que não subiu |
| --- | --- | --- | --- |
| `typescript` | 6.0.3 | 7.0.2 | O `typescript-eslint` que vem no `eslint-config-next` 16 exige `<6.1`. Com o TS 7 o `npm run lint` deixa de rodar — trocar o linter por uma versão do compilador não é ganho. |
| `eslint` | 9 | 10 | O `eslint-plugin-react` embutido no `eslint-config-next` 16 quebra no ESLint 10. |

As duas destravam quando o `eslint-config-next` publicar uma versão com
`typescript-eslint` e `eslint-plugin-react` mais novos. Até lá, subir qualquer
uma custa o lint.

### O que a atualização exigiu de mudança no código

- **`lucide-react` 1.x removeu todos os ícones de marca** (decisão de marca
  registrada). O ícone do Instagram passou a morar em
  `components/ui/IconeInstagram.tsx`, desenhado no mesmo traço dos demais. O
  campo `icone` dos menus deixou de ser amarrado ao tipo do lucide e aceita
  qualquer componente que desenhe um ícone.
- **`framer-motion` 13 apertou o tipo da curva de animação**: cubic-bezier
  agora precisa ser uma tupla de quatro números, não um `number[]` solto.
