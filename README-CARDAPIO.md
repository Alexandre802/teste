# Cardápio oficial

Fonte pública conferida em 02/09/2026: https://instadelivery.com.br/comidacaseiradamarciacosta

O catálogo canônico do site fica em `data/menu-original.json` e contém 2 categorias, 13 produtos disponíveis e 1 produto histórico indisponível. Ele inclui preços por tamanho, descrições completas, fotografias oficiais e os acompanhamentos publicados pela própria casa. Telefone, WhatsApp, endereço, horários, tempo de entrega, avaliação e formas de pagamento ficam centralizados em `data/restaurant.ts`. O arquivo `data/menu.ts` apenas tipa e expõe esses dados para a interface. `scripts/sincronizar-produtos.mjs` espelha os mesmos preços e opções no Supabase para o fluxo de caixa recalcular os pedidos no servidor.

Não adicionar produtos ou preços de outros restaurantes neste projeto.
