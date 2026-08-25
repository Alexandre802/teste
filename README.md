# Casa de Ração Bandeira Branca

Site da **Casa de Ração Bandeira Branca** — pet shop em Jacareí-SP, revenda
PremieR Super Premium. Next.js 16 (App Router), TypeScript, Tailwind v4.

A interface foi reconstruída a partir da peça de referência aprovada: paleta
azul amostrada pixel a pixel do arquivo, Montserrat, cards de borda fina sem
sombra e o mesmo ritmo de espaçamento.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run lint
```

## O que editar

Quase tudo do dia a dia mora em `data/` — não é preciso abrir componente:

| Arquivo | O que controla |
| --- | --- |
| `data/products.ts` | catálogo: nome, marca, preço, promoção, imagem, categoria, estoque, destaque |
| `data/sections.ts` | quais seções de produtos existem na home e em que ordem |
| `data/categories.ts` | espécies (fileira de ícones) e departamentos populares |
| `data/banners.ts` | slides do carrossel, banners promocionais, benefícios e serviços |
| `data/business.ts` | telefone, WhatsApp, cidade, endereço, horários |

### Preços

Os valores em `data/products.ts` são **rascunho de referência de mercado**, não
os preços oficiais da loja. Por isso o site não os exibe: enquanto

```ts
export const PRECOS_CONFIRMADOS = false;
```

os cards mostram "Consultar — preço no WhatsApp" e o carrinho mostra subtotal
"A combinar". Depois de revisar valor por valor com a loja, troque para `true`:
preço, preço antigo riscado, selo de desconto e parcelamento aparecem sozinhos,
sem mexer em componente nenhum.

### Imagens

- **Produtos:** `imagem: null` cai no placeholder da marca. Coloque a foto real
  em `public/produtos/` e aponte no catálogo — ver `public/produtos/README.md`.
- **Banners:** os arquivos em `public/banners/` são recortes da peça de
  referência, em baixa resolução. Servem para o layout ficar de pé; troque por
  fotografia real de campanha quando houver.

## Estrutura

```
app/            rotas: / , /login , /carrinho , sitemap, robots, favicon
components/
  layout/       cabeçalho, busca, menu lateral, botão de carrinho, rodapé
  home/         carrossel, benefícios, categorias, banners, seções, serviços
  ui/           ProductCard, CategoryCard, SectionHeader, QuantitySelector, ícones
  cart/         página do carrinho
  account/      formulário de login
data/           catálogo e conteúdo editável
lib/            carrinho (zustand + localStorage), busca, formatação, WhatsApp, auth
arquivo/        site anterior da Michel Food House, fora do build
```

## Decisões que valem saber

- **Sem biblioteca de animação.** O carrossel é `translateX` + transição CSS de
  500ms, com clones nas pontas para o loop ficar contínuo. Nada de Framer Motion
  ou Remotion neste projeto.
- **Carrinho no `localStorage`.** Guarda só id e quantidade; nome, preço e foto
  vêm sempre do catálogo. Corrigir um produto em `data/products.ts` corrige na
  hora o carrinho de quem já tinha o item.
- **Login não é falso.** `lib/auth.ts` responde sempre "não configurado". Para
  ligar de verdade, troque o corpo das três funções — nenhum componente muda.
- **Só o confirmado aparece.** Endereço completo e horário estão `null` em
  `data/business.ts`; o rodapé e o JSON-LD simplesmente não os mostram até
  serem preenchidos.
