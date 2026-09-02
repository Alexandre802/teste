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
| `data/menu.ts` | Produtos, preços, descrições, fotos, categorias e opções |
| `data/restaurant.ts` | Nome, logo, WhatsApp, Instagram, endereço, horários, links |
| `data/deliveryZones.ts` | Cidades atendidas, taxa, pedido mínimo e prazo |

Os tipos estão em `types/index.ts`.

## O que ainda falta cadastrar

O site **não inventa dado que a casa não confirmou**. Enquanto faltar, a tela
mostra "Informação a cadastrar" e o recurso que depende do dado fica desligado,
com aviso honesto. O que está pendente hoje:

- **Número do WhatsApp** (`NEXT_PUBLIC_WHATSAPP`). Sem ele o botão de enviar não
  aparece: no lugar entra "Copiar mensagem do pedido", que copia o texto pronto.
- **Endereço da cozinha** (`NEXT_PUBLIC_ENDERECO`).
- **Instagram** (`NEXT_PUBLIC_INSTAGRAM`). Sem perfil, a seção de feed some.
- **Horários** (`restaurant.openingHours`, hoje uma lista vazia).
- **Taxa de entrega, pedido mínimo e prazo** (`data/deliveryZones.ts`, hoje
  `null`). Enquanto forem `null`, o resumo escreve "a combinar no WhatsApp" e o
  total soma apenas o subtotal.
- **Preços e descrições do cardápio.** Os itens de `data/menu.ts` foram
  transcritos das telas de referência enviadas pela casa e estão marcados com
  `confirmado: false`. Enquanto houver item assim, o cardápio exibe um aviso de
  "cardápio em conferência". Depois de confirmar cada item, troque para
  `confirmado: true` e o aviso some sozinho.

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
