# Cardápio oficial

Fonte pública conferida em 02/09/2026: https://instadelivery.com.br/comidacaseiradamarciacosta

O catálogo canônico do site fica em `data/menu-original.json` e contém 2 categorias, 12 produtos e as opções/complementos publicados pela própria casa. O arquivo `data/menu.ts` apenas tipa e expõe esses dados para a interface. `scripts/sincronizar-produtos.mjs` espelha os mesmos preços e opções no Supabase para o fluxo de caixa recalcular os pedidos no servidor.

Não adicionar produtos ou preços de outros restaurantes neste projeto.

## Auditoria da última sincronização

```
source=https://instadelivery.com.br/comidacaseiradamarciacosta
products=12
categories=2
Catálogo verificado contra o InstaDelivery original: 2 categorias, 12 produtos, 14 grupos de complementos/opções na fonte.
```

Os marcadores soltos que existiam na raiz (`.noop`, `.stop`, `.preview-*`,
`.sync-note`, `.cardapio-atualizado`, `.source-audit`, `VERIFICADO.md`) foram
removidos: eram arquivos de rascunho sem função no projeto, e a informação útil
deles está aqui.


## O que a fonte oficial NÃO tem

O InstaDelivery da casa publica **duas** categorias: `MARMITEX IRRESISTÍVEL` e
`BEBIDAS`. Não há **açaí** nem **lanches/sanduíches** na fonte, embora eles
apareçam nas telas de referência enviadas no começo do projeto.

Enquanto isso não for esclarecido pela casa, o site fala apenas do que dá para
pedir: os textos de marketing, a descrição de SEO e as 100 palavras-chave foram
alinhados ao catálogo real. Prometer açaí numa busca e não ter açaí no cardápio
manda o cliente embora.

Para incluir açaí e lanches, basta publicá-los no InstaDelivery (a próxima
sincronização traz sozinho) ou acrescentá-los à mão em `data/menu-original.json`
com nome, descrição, preço e foto confirmados.

## Sincronização automática

`prebuild` roda `scripts/atualizar-cardapio-oficial.mjs` antes de cada build.
Se a fonte estiver fora do ar ou inacessível, o script **avisa e mantém** o
último cardápio confirmado que está no repositório — o build não quebra e o
site não fica sem cardápio.

## Fotos

As fotos dos produtos são servidas pelo CDN que a própria casa já usa nos
marketplaces (`static-images.ifood.com.br`), liberado em `next.config.ts`. São
as fotos dela, e o site não hospeda cópia. Se o CDN sair do ar ou mudar as URLs,
`FotoProduto` cai no selo da marca em vez de quebrar a tela — mas vale trocar
por arquivos em `public/images/products/` quando a casa mandar os originais.
