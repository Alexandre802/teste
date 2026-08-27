# MD_cortes

Controle de cortes e faturamento da barbearia. Gabriel e Nino lançam o corte
pelo celular em três toques; o Maicon vê tudo — indicadores, gráfico, equipe e
notificação — no mesmo instante, sem atualizar a página.

Não é aplicativo de loja: é uma **PWA estática**. Instala na tela de início,
abre em tela cheia e sai da build como HTML, CSS e JS soltos — nenhum processo
Node rodando. Todo o servidor é o **Supabase**.

---

## Autenticação

Quem valida senha é o **Supabase Auth**, sempre. O app não tem lista de
usuários, não tem senha no código e **não tem nenhum caminho que dispense o
servidor**: não existe modo local, entrada de demonstração nem fallback. Esse
código foi apagado do projeto, não desligado — não há variável que o traga de
volta.

Na tela de login o campo aceita `gabriel` ou `gabriel@mdcortes.app`. Sem o `@`,
o app completa com `NEXT_PUBLIC_LOGIN_DOMAIN` e chama
`supabase.auth.signInWithPassword`. Senha errada devolve
**"Usuário ou senha inválidos"** e mais nada: nenhuma sessão, nenhuma rota
interna aberta.

Com o login aceito, o app lê `profiles` pelo `auth.uid()` e é o `role` de lá que
decide a tela:

| Usuário | E-mail | Role | Tela |
|---|---|---|---|
| `maicon` | maicon@mdcortes.app | `developer` | painel da barbearia, com equipe e notificações |
| `gabriel` | gabriel@mdcortes.app | `employee` | painel próprio |
| `nino` | nino@mdcortes.app | `employee` | painel próprio |

Ninguém escolhe perfil na tela: o perfil vem do banco, pela sessão.

As rotas internas (`/inicio`, `/lancamentos`, `/equipe`, `/perfil`) não abrem
sem sessão, e `/equipe` devolve o funcionário para `/inicio`. Isso é
conveniência de tela, **não** a segurança: quem impede o Gabriel de ler os dados
do Nino é a Row Level Security do banco. Trocar a rota no navegador não contorna
nada — o Postgres devolve lista vazia.

Se a build sair sem as chaves do Supabase, o app mostra **"Sistema não
configurado"** e ninguém entra. Sem banco não há senha para validar, e deixar
passar mesmo assim é o oposto do que este sistema precisa fazer.

---

## Configuração

As chaves ficam em `.env.production`, versionado, e vêm de um lugar só: a build.
Já houve um caminho que deixava configurar pelo aparelho, e ele saiu — num
sistema de produção era um buraco, porque bastava escrever no `localStorage`
para repontar o app para outro projeto Supabase.

```
NEXT_PUBLIC_SUPABASE_URL=https://qtxcqlzfqfckcjpeboeo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…
NEXT_PUBLIC_LOGIN_DOMAIN=mdcortes.app
```

A chave publishable é pública por natureza: ela vai no JavaScript entregue a
todo celular que abrir o app. Quem protege os dados é a RLS. A **service_role**
é outra história e nunca entra em arquivo com `NEXT_PUBLIC_`.

---

## Banco

No **SQL Editor** do Supabase, nesta ordem:

1. `supabase/schema.sql` — tabelas, índices, RLS, gatilhos e Realtime
2. `supabase/seed.sql` — serviços da casa e os cargos dos três

Os dois podem ser rodados de novo sem quebrar nada.

O que as políticas garantem:

- `haircuts` — o funcionário lê e escreve só onde `employee_id = auth.uid()`. O
  `employee_id` não vem do formulário: o `WITH CHECK` do INSERT obriga a ser o
  usuário autenticado, então o Gabriel não lança em nome do Nino nem forjando a
  requisição.
- `profiles` — cada um vê o próprio; quem tem `role = 'developer'` vê todos. O
  funcionário ajusta o próprio nome, nunca o próprio cargo.
- `notifications` — só o destinatário lê e marca como lida. **Não existe
  política de INSERT**: quem cria o aviso é um gatilho do Postgres.
- O Realtime respeita a RLS: cada sessão só recebe eventos das linhas que
  poderia ler.

---

## Rodar e publicar

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # gera o site em out/
npm start              # serve out/ para conferir
```

### Vercel

```bash
npm run publicar:vercel
```

Gera o site, copia o `vercel.json` para dentro de `out/` e sobe **só essa
pasta**, num projeto fixado em `md-cortes`. Como o que sobe não tem
`package.json`, a Vercel não detecta framework e não reconstrói nada — o que
está na pasta é o que vai ao ar. O `--project md-cortes` garante que o deploy
não caia em cima de outro projeto da conta.

Na primeira vez a CLI pede `vercel login`, que abre o navegador.

O `vercel.json` cuida do que a Vercel não acerta sozinha numa PWA: `sw.js` sem
cache (em cache, o aparelho trava numa versão antiga para sempre),
`manifest.webmanifest` com `application/manifest+json` (sem o tipo certo o
Chrome ignora o manifest e o convite de instalar nunca aparece) e
`/_next/static/` com cache eterno, seguro porque esses arquivos têm hash no
nome.

---

## Instalar no celular

- **Android (Chrome):** abra o endereço → menu → *Instalar aplicativo*.
- **iPhone (Safari):** *Compartilhar* → *Adicionar à Tela de Início*.

Depois disso o MD_cortes abre pelo ícone, em tela cheia, sem barra de navegador.

---

## Testes

O projeto real do Supabase não é alcançável do ambiente onde os testes rodam, e
não se testa login sem as senhas de verdade. Então `scripts/teste/supabase-falso.mjs`
sobe um Supabase de mentira que responde os mesmos endpoints, com três usuários
conhecidos:

```bash
npm run supabase-falso                       # num terminal
NEXT_PUBLIC_SUPABASE_URL=http://localhost:5555 \
NEXT_PUBLIC_SUPABASE_ANON_KEY=chave-de-teste \
  npm run build                              # noutro
```

Isso exercita senha certa, senha errada, papéis, proteção de rota, persistência
e logout. **O que ele prova:** que o app pede senha ao servidor e só aceita a
resposta boa. **O que não prova:** que o projeto Supabase real está configurado
certo — só o primeiro login de verdade dirá.

---

## Estrutura

```
app/
  layout.tsx              casca, fontes, provedores, service worker
  page.tsx                abertura: decide login ou painel
  login/                  "Acesse sua conta"
  (privado)/
    layout.tsx            portão de sessão + barra inferior
    inicio/               painel do funcionário ou do Maicon, conforme o cargo
    lancamentos/          histórico com filtros
    equipe/               cartões da equipe e relatório individual (só Maicon)
    perfil/               conta, instalação, avisos, sair

lib/data/                 adapter: Supabase, ou a recusa quando falta chave
lib/hooks/                sessão, cortes, histórico, notificações, PWA
lib/date.ts               todo recorte de dia/semana/mês no fuso da barbearia
supabase/                 schema.sql e seed.sql
scripts/teste/            o Supabase de mentira usado nos testes
```

---

## Preços dos serviços

O catálogo entra com preço **zero** de propósito: a tabela real da barbearia não
foi informada, e chutar valor de serviço é inventar dado da casa. Ajuste em
`supabase/seed.sql` (ou na tabela `services`) e o valor passa a aparecer
sugerido no formulário — o funcionário ainda pode mudar antes de lançar.

---

## Comandos

| | |
|---|---|
| `npm run dev` | desenvolvimento em <http://localhost:3000> |
| `npm run build` | gera o site estático em `out/` |
| `npm start` | serve `out/` para conferir |
| `npm run publicar:vercel` | publica na Vercel, no projeto `md-cortes` |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emitir |
| `npm run criar-usuarios` | cria os três usuários no Supabase Auth |
| `npm run icones` | regenera os ícones da PWA |
| `npm run supabase-falso` | sobe o Supabase de mentira dos testes |
