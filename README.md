# Michel Food House

Site oficial da **Michel Food House** — lanchonete no Bandeira Branca I, em Jacareí-SP.
Cardápio completo, sacola, pagamento e fechamento de pedido pelo WhatsApp.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # produção
npm run lint
```

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Zustand.

Sem backend próprio: a sacola, a identificação do cliente e o histórico ficam no
navegador; pagamento e WhatsApp são rotas de API que falam com serviços externos.

## Como atualizar o conteúdo

Nenhum produto ou dado da casa está escrito dentro de componente. Tudo sai de dois
arquivos:

| O que mudar | Arquivo |
|---|---|
| Produtos, preços, descrições, categorias, esgotados, destaques | `lib/catalog.ts` |
| Endereço, telefone, WhatsApp, horário, avaliações, textos institucionais | `lib/business.ts` |
| Fotos de ambiente da galeria | `lib/photos.ts` |
| Promoções | array `promocoes` em `components/sections/Promocoes.tsx` |
| Termos de busca local | `lib/seo.ts` |

### Mudar um preço

`lib/catalog.ts`, campo `price` (número, sem `R$`). A formatação em real é automática.

### Marcar um item como esgotado

`available: false`. O card mostra "Esgotado" e desabilita o botão sozinho.

### Trocar o número do WhatsApp

`lib/business.ts` → `whatsapp` (formato internacional, só dígitos: `5512988447711`),
`phoneE164` e `phoneDisplay`. Muda em todos os botões, no rodapé e no JSON-LD de uma vez.

### Adicionar a foto de um produto

Coloque o arquivo em `public/produtos/<slug>.webp` e preencha `image: img('<slug>')`
no produto. **Um produto sem foto própria deve continuar com `image: null`** — ele cai
no placeholder da marca em vez de exibir a foto de outro item.

## Fotos

- `public/produtos/` — 34 fotos reais, extraídas do cardápio da casa e mapeadas
  item a item. São de baixa resolução (≈380 px): servem, mas um ensaio fotográfico
  melhora muito os cards. 43 dos 77 itens ainda não têm foto e usam o placeholder.
- `lib/photos.ts` — fotos de ambiente vindas do perfil do Google Maps, por URL.
  São links do Google e **podem expirar**. O ideal é baixar cada arquivo, salvar em
  `public/galeria/` e trocar o `src` pelo caminho local; aí dá para remover o
  `remotePatterns` de `next.config.ts`.

## Configuração externa

Copie `.env.example` para `.env.local`. Sem nenhuma variável o site funciona: o pedido
fecha pelo WhatsApp e o pagamento roda em modo demonstração, que avisa na tela que
nada foi cobrado.

### Pagamento (Pix e cartão)

1. Crie uma aplicação no [painel do Mercado Pago](https://www.mercadopago.com.br/developers/panel/app).
2. Preencha `MP_ACCESS_TOKEN`.
3. Cadastre o webhook apontando para `https://SEU_DOMINIO/api/webhook/mercadopago`
   e preencha `MP_WEBHOOK_SECRET` — **sem ele qualquer um pode forjar um
   "pagamento aprovado"**.
4. `MP_SANDBOX=1` durante os testes.

### WhatsApp automático

Precisa da [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
com número comercial verificado. Preencha `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
e `WHATSAPP_VERIFY_TOKEN`, e aponte o webhook para
`https://SEU_DOMINIO/api/whatsapp/webhook`.

Com isso funcionam três coisas:

- **pagamento aprovado → a lanchonete recebe o pedido** no WhatsApp, com itens,
  total, tipo, cliente e endereço;
- **o cliente recebe a confirmação** no número dele;
- **atendente automático** responde as mensagens recebidas.

O atendente usa a API da Anthropic (`ANTHROPIC_API_KEY`) e recebe o cardápio inteiro
no prompt, com instrução explícita de não inventar item, preço, promoção nem prazo —
quando não sabe, diz que vai confirmar com a equipe.

> **Limite da plataforma:** a API só envia mensagens a partir do número **da loja**.
> Não existe forma de disparar uma mensagem em nome do cliente. Quem manda do número
> dele é ele mesmo, pelo link `wa.me` do site — que é como o site já fecha o pedido.

### Login

A identificação por nome + WhatsApp funciona sem configuração e é o que alimenta a
saudação de retorno, o histórico e a mensagem do pedido. **Não há verificação por SMS**
— para isso é preciso um provedor (Firebase Auth, Twilio Verify). O botão do Facebook
só aparece com `NEXT_PUBLIC_FACEBOOK_APP_ID` definido e exige um app Meta configurado.

O histórico é por aparelho: trocou de celular, ele não vai junto. Para acompanhar o
cliente entre dispositivos é preciso guardar o histórico no servidor, com login real.

## SEO

`app/layout.tsx` traz metadata, Open Graph e dois blocos JSON-LD (`Restaurant` com
cardápio completo e `WebSite`), montados a partir de `lib/business.ts` e `lib/catalog.ts`
— só com dados confirmados, sem horário de fechamento inventado. Há `sitemap.xml` e
`robots.txt` gerados.

Os termos de busca local aparecem em **conteúdo visível**, na seção "O que servimos em
Jacareí" (`components/sections/BuscaLocal.tsx`). Não existe bloco de texto escondido
para robô: texto que só o buscador enxerga é *cloaking*, contraria as
[políticas de spam do Google](https://developers.google.com/search/docs/essentials/spam-policies)
e arrisca rebaixamento ou remoção do índice.

## Acessibilidade e movimento

Navegação por teclado, foco visível, HTML semântico, `aria-label` nos controles e
`alt` descritivo nas fotos. `prefers-reduced-motion` desliga o movimento: o lanche do
hero aparece montado e imóvel. Em telas pequenas e aparelhos com pouca memória a
animação usa afastamento menor e dispensa os rótulos.

## Estrutura

```
app/
  layout.tsx           metadata, fontes, JSON-LD
  page.tsx             composição das seções
  globals.css          tokens de cor, glass, utilitários
  api/checkout         abre o pagamento (Mercado Pago)
  api/webhook/mercadopago   pagamento aprovado → WhatsApp
  api/whatsapp/webhook      atendente automático
components/
  layout/    Header, Footer
  hero/      Hero, ExplodedBurger, BurgerLayers
  menu/      MenuSection, CategoryTabs, ProductCard, ProductModal
  cart/      CartFab, CartDrawer, PaymentStep
  account/   LoginSheet, ClienteDeVolta
  sections/  Featured, About, Reviews, Gallery, Promocoes, Location, BuscaLocal
  ui/        Button, Sheet, Reveal, ProductImage, Icons
lib/         business, catalog, photos, store, whatsapp, whatsapp-api, payments, seo
referencias/ cardápio de origem e prints usados para montar o catálogo
```

## Ferramental de design

`.claude/skills/` traz as skills de design (`ui-ux-pro-max` e irmãs) e a skill
`remotion-site`, para peças de vídeo. `.mcp.json` configura os MCPs de UI. Detalhes em
`CLAUDE.md`.

## Outro site neste repositório

`allp-fit/` guarda o site da **Allp Fit**, academia em Londrina/PR — projeto
Next.js separado, com `package.json`, conteúdo e identidade visual próprios.
Nada ali compartilha código com a Michel Food House. Instruções em
`allp-fit/README.md`.
