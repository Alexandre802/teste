# Cardápio oficial

Fonte pública conferida em 02/09/2026: https://instadelivery.com.br/comidacaseiradamarciacosta

O catálogo canônico do site fica em `data/menu-original.json` e contém 2 categorias, 12 produtos e as opções/complementos publicados pela própria casa. O arquivo `data/menu.ts` apenas tipa e expõe esses dados para a interface. `scripts/sincronizar-produtos.mjs` espelha os mesmos preços e opções no Supabase para o fluxo de caixa recalcular os pedidos no servidor.

Não adicionar produtos ou preços de outros restaurantes neste projeto.
