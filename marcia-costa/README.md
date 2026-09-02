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
