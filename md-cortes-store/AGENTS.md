<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MD Cortes Store — regras do projeto

App de controle de vendas e estoque de uma loja de roupas em Jacareí-SP.
Next.js 16 (App Router), TypeScript, Tailwind v4, Supabase, Framer Motion.

## Um dono, sempre

Existe **um único usuário**: Maicon, o proprietário. Não crie perfis, papéis,
permissões, equipe, vendedor nem estoquista. O `user_id` existe nas tabelas por
segurança (RLS), não para multiusuário.

## Dinheiro e estoque

1. **Todo valor é inteiro em centavos.** Nada de `float` para dinheiro. A
   conversão para texto acontece só em `lib/format.ts`.
2. **Faturamento não é lucro.** `lucro bruto = venda − custo da peça`;
   `lucro líquido = lucro bruto − despesas`. Quem calcula é `lib/selectors.ts`;
   nenhuma tela refaz a conta por conta própria.
3. **Estoque muda só por movimentação.** Venda, entrada, ajuste e cancelamento
   entram em `inventory_movements`. Nunca escreva uma quantidade "por cima":
   o histórico tem de continuar batendo com o saldo.
4. **Venda cancelada não some.** Vira `status = 'cancelada'` e devolve as peças.

## Local-first

A tela lê do espelho local (`lib/local/idb.ts`) e escreve na fila
(`outbox` em `lib/store.ts`); o Supabase entra por sincronização. É o que faz a
venda ser instantânea e o que segura os dados quando o sinal cai.

As três operações que mexem em estoque passam por funções do banco
(`supabase/migrations/0003_functions.sql`), que são atômicas e **idempotentes**:
o id vem do cliente, então reenviar a mesma venda não baixa o estoque de novo.
Qualquer operação nova que mexa em estoque precisa manter essa propriedade.

## Dados

**Não invente dado da loja.** Preço, custo, fornecedor, foto — nada entra sem
vir do Maicon. Os exemplos de `services/demonstracao.ts` são explicitamente
rotulados como demonstração e só entram quando ele pede.

**Foto só do próprio produto.** Peça sem foto usa `imageUrl: null` e cai no
símbolo da marca. Nunca reaproveite a foto de um item em outro.

## Visual

Fundo branco, muito ar, cartão arredondado com sombra quase invisível. O ouro é
a única cor de marca. **Verde só fala de lucro e estoque saudável; vermelho e
laranja só falam de alerta** — cor sempre significa alguma coisa. Os tokens
estão em `app/globals.css`, no bloco `@theme`.

Regras de CSS que valem sempre:

- Estilo de elemento (`body`, `button`, …) vai **dentro de `@layer base`**.
  Sem camada, ele vence as utilitárias do Tailwind na cascata — foi assim que
  `button { color: inherit }` apagou o texto do botão de entrar.
- Utilitária própria vai em `@layer utilities`.
- Tailwind v4 usa `!` como **sufixo** (`h-12!`), não prefixo. Precisou de
  `!` num componente? Provavelmente falta uma variante nele.

## Gráficos

Uma série por gráfico. Ouro e verde no mesmo desenho não servem: quem tem
daltonismo protan não separa o par (ΔE 3,6). Precisa das duas leituras? Dois
gráficos.

## Marca

Tudo passa por `lib/brand.ts` e `components/ui/Logo.tsx`. O nome é texto com a
fonte do app, não desenho — SVG com `<text>` vira um logo diferente em cada
aparelho. Trocar pela logo oficial é mexer só nesses dois lugares e rodar
`npm run icons`.

## Antes de dar por pronto

```
npm run lint && npm run typecheck && npm test && npm run build
```
