# MD Cortes Store

Controle de vendas e estoque da MD Cortes Store — um app web instalável (PWA),
feito para uma pessoa só: o Maicon, dono da loja.

A prioridade do app é **velocidade**: abrir e registrar uma venda em poucos
segundos, o estoque baixando sozinho e o lucro recalculado na hora.

```
REGISTRAR VENDA → ATUALIZAR ESTOQUE → CALCULAR LUCRO → LEMBRAR O MAICON
```

---

## Colocar no ar

### 1. Banco de dados (Supabase)

Crie um projeto em [supabase.com](https://supabase.com) e rode as migrações **na
ordem**, no SQL Editor do painel:

| Arquivo | O que faz |
|---|---|
| `supabase/migrations/0001_schema.sql` | tabelas, índices e o gatilho que cria o perfil no cadastro |
| `supabase/migrations/0002_policies.sql` | RLS — cada linha amarrada a `auth.uid()` |
| `supabase/migrations/0003_functions.sql` | venda, cancelamento e movimentação (atômicas e reenviáveis) |
| `supabase/migrations/0004_storage_realtime.sql` | bucket das fotos e publicação de tempo real |

Com a CLI do Supabase: `supabase db push`.

### 2. Criar o usuário do Maicon

**Authentication → Users → Add user**, com e-mail e senha. Não existe cadastro
aberto no app: quem não está no Supabase não entra. O gatilho de `0001` cria o
perfil e as preferências sozinho.

Em **Authentication → URL Configuration**, aponte a *Site URL* para o endereço
publicado — é o que faz o link de "esqueci minha senha" voltar para o app.

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local   # e preencha
```

O mínimo para rodar é `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Sem elas o app não inventa um login de mentira: mostra a tela explicando o que falta.

### 4. Rodar

```bash
npm install
npm run dev
```

### 5. Publicar

Na Vercel, aponte o **Root Directory** para `md-cortes-store` e repita as
variáveis de ambiente. O `vercel.json` já agenda o disparo dos lembretes a cada
30 minutos.

---

## Instalar no celular

Abra o endereço no navegador e use **Adicionar à tela de início** (Safari) ou
**Instalar app** (Chrome). A partir daí abre em tela cheia, sem barra de
endereço, e a sessão fica ativa.

---

## Como funciona por dentro

### Local-first: a venda nunca se perde

A tela lê de um espelho local em IndexedDB e escreve numa fila; o Supabase entra
por sincronização. Duas consequências práticas:

- **Confirmar uma venda é instantâneo** — nada espera a rede.
- **Sem sinal, a venda fica guardada no aparelho** e sobe sozinha quando a
  conexão volta. O estado aparece o tempo todo no topo: *Sincronizado* ou
  *N aguardando sincronização*.

As três operações que mexem em estoque (venda, cancelamento, movimentação)
passam por funções do Postgres. Elas são atômicas e **idempotentes**: o id é
gerado no aparelho, então reenviar a mesma venda não baixa o estoque duas vezes.

### Lembrete inteligente

A cada 2 horas (ajustável para 1, 3 ou 4) o app pergunta:

> Maicon, você vendeu? Como está o estoque?

com dois caminhos diretos: **Registrar venda** e **Atualizar estoque**.

O relógio reinicia a cada sinal de vida — venda, entrada de estoque ou o próprio
lembrete anterior. Quem acabou de vender às 15h55 não é incomodado às 16h. Fora
da faixa ativa (padrão 08:00–22:00) nada dispara.

A regra mora em `lib/reminders.ts` e é a mesma usada pelo aviso na tela e pelo
Web Push, para os dois nunca discordarem. A permissão do navegador só é pedida
depois que o Maicon toca em **Ativar lembretes** — pedir na abertura é o jeito
mais rápido de levar um bloqueio definitivo.

### Dinheiro

Todo valor é inteiro em centavos, do banco à tela. E faturamento nunca é
apresentado como lucro:

```
lucro bruto   = valor da venda − custo da peça
lucro líquido = lucro bruto − despesas do período
```

### Estoque

Nenhuma quantidade é escrita "por cima". Venda, entrada, ajuste no cadastro e
cancelamento entram como movimentação, e o saldo é consequência — o que mantém
o histórico batendo com o número da prateleira. Cancelar uma venda devolve as
peças e mantém o registro marcado como cancelado; nada é apagado.

---

## Estrutura

```
app/               rotas (App Router)
  (app)/           telas internas, atrás do login
  api/push/        inscrição e disparo do Web Push
components/        UI reutilizável, por área
hooks/             sessão, sincronização, lembretes, service worker
lib/               estado (Zustand), seletores, formatação, marca, tokens
services/          Supabase (leitura/escrita), conversões, exportação
supabase/          migrações SQL
tests/             lógica e o fluxo principal ponta a ponta
types/             tipos do domínio
utils/             CSV
public/            service worker, ícones, página offline
```

---

## Comandos

```bash
npm run dev        # desenvolvimento
npm run build      # produção
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # lógica + fluxo de venda
npm run icons      # regera os ícones do app a partir da marca
```

---

## Trocar a logo provisória pela oficial

A marca vive em dois lugares: `lib/brand.ts` (nome, cores, caminhos) e
`components/ui/Logo.tsx` (o desenho). Ponha o arquivo oficial em `public/marca/`,
ajuste esses dois e rode `npm run icons` para regerar os ícones da tela inicial.
Nenhuma tela conhece o desenho — todas passam pelo componente.

---

## Backup

**Mais → Configurações → Exportar dados** gera CSV de vendas, estoque e despesas,
com ponto e vírgula e acentuação que o Excel em português abre direto.
