# Allp Fit — site institucional

Site da **Allp Fit**, academia no Centro de Londrina/PR
(Av. Celso Garcia Cid, 231). Next.js 16 (App Router), TypeScript, Tailwind v4,
Framer Motion e Lucide.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## O que você muda sem tocar em componente

Todo o conteúdo do negócio mora em `data/`. A interface lê esses arquivos — não
existe preço, telefone ou horário escrito dentro de JSX.

| Arquivo | O que controla |
| --- | --- |
| `data/academy.ts` | Nome, endereço, telefone/WhatsApp, nota do Google, redes, domínio |
| `data/businessHours.ts` | Horário de cada dia da semana e o selo ABERTO/FECHADO |
| `data/plans.ts` | Planos, benefícios, preços mensal/anual, desconto e tabela comparativa |
| `data/modalities.ts` | Modalidades (com `ativo: false` para esconder sem apagar) |
| `data/testimonials.ts` | Avaliações transcritas do Google e o resumo do perfil |
| `data/faq.ts` | Perguntas frequentes e os objetivos da aula experimental |
| `data/gallery.ts` | Fotos, legendas, textos alternativos e o arranjo do bento grid |
| `data/differentials.ts` | Cartões de diferenciais, itens da seção institucional e a faixa de números |

### Preços

Os preços oficiais ainda **não** foram informados, então `preco` está `null` e o
cartão mostra "Consulte". Para publicar os valores reais, basta escrever o número
em reais — o layout não muda e a troca Mensal/Anual já anima o valor:

```ts
// data/plans.ts
preco: { mensal: 99.9, anual: 89.9 },
```

O desconto do plano anual segue a mesma regra: enquanto `descontoAnual` for
`null`, o selo "economize" não aparece.

```ts
export const descontoAnual: number | null = 15; // mostra "Economize 15% no anual"
```

### Horários

A referência do cliente confirmava apenas o fechamento ("Fecha 00:00"). Por isso
`abre` está `null` em todos os dias e a página mostra o fechamento confirmado com
um convite para confirmar no WhatsApp, em vez de afirmar que está aberto agora.

Preencha o horário de abertura e o selo **ABERTO AGORA / FECHADO AGORA** passa a
ser calculado sozinho (no fuso `America/Sao_Paulo`), inclusive no vira-noite:

```ts
// data/businessHours.ts
segunda: { abre: '06:00', fecha: '00:00' },
sabado:  { abre: '09:00', fecha: '18:00' },
domingo: { abre: null, fecha: null, fechado: true },
```

Os dias com horário completo também entram sozinhos no `openingHours` do
schema.org.

### Fotos

As fotos em `public/fotos/` foram recortadas das imagens enviadas pelo cliente
(perfil da academia no Google). Regras que o projeto segue:

- só entram fotografias da própria unidade — não há banco de imagens genérico;
- cada legenda descreve o que a foto realmente mostra; nenhuma foto ilustra um
  ambiente que ela não retrata;
- modalidade sem foto confirmada usa o marcador da marca (`foto: null`), nunca a
  foto de outro espaço;
- as placas dos carros de terceiros na foto da fachada foram desfocadas.

Para trocar uma foto, substitua o arquivo em `public/fotos/` e ajuste
`largura`/`altura` em `data/gallery.ts`.

---

## Estrutura

```
app/           layout (metadata, fontes, JSON-LD), página, robots, sitemap, ícones
components/
  layout/      Header, Footer, WhatsAppButton
  sections/    Hero, Stats, About, Structure, Modalities, Plans, PlanComparison,
               CtaBanner, Testimonials, Differentials, Gallery, TrialCTA,
               Location, Hours, Faq
  ui/          Logo, Button, SectionHeading, NeonLines, PlanToggle, Lightbox
  motion/      Reveal/Stagger, TextReveal, Counter
data/          conteúdo editável (tabela acima)
lib/           utilitários, navegação e dados estruturados
```

## Identidade visual

Os tokens estão no bloco `@theme` de `app/globals.css`: fundo quase preto
(`#09090F`), roxo/azul/ciano vindos das fitas de LED do teto do salão e o laranja
da marca (`#FF4B1F`) reservado para CTA. Títulos em Sora, texto em Inter.

O motivo visual recorrente — a fita de LED — está em `components/ui/NeonLines.tsx`
e é feito só com CSS.

## Movimento

Framer Motion, animando apenas `transform`, `opacity` e `filter`. Todo componente
com movimento respeita `prefers-reduced-motion`: quem pede menos animação recebe
a página montada e imóvel (inclusive a paralaxe do hero e o avanço automático do
carrossel de avaliações).

## Acessibilidade

Atalho "ir para o conteúdo", foco visível em ciano, `aria-label` nos controles,
`aria-expanded` nos acordeões e no menu, teclado no visualizador de fotos
(Esc, ← →) e texto alternativo descritivo em todas as fotos.

## Publicação

O site é estático (`○ Static` no build). Em qualquer host que rode Next 16
(Vercel, por exemplo), apontar o *root directory* para `allp-fit/` e usar
`npm run build`. Antes de publicar, ajuste `urlCanonica` em `data/academy.ts` se
o domínio for diferente de `allpfit.com.br` — ele alimenta canonical, Open Graph,
`robots.txt` e `sitemap.xml`.
