# MD_cortes

Controle de cortes e faturamento da barbearia. Gabriel e Nino lançam o corte
pelo celular em três toques; o Maicon vê tudo — indicadores, gráfico, equipe e
notificação — no mesmo instante, sem atualizar a página.

Não é aplicativo de loja nem site comum: é uma **PWA estática**. Instala na tela
de início, abre em tela cheia como aplicativo e **não precisa de hospedagem
paga** — a build gera arquivos soltos que rodam em qualquer lugar que sirva
HTML, inclusive de graça.

---

## Os dois modos

O sistema decide sozinho, na build, onde os dados vão morar.

| | **Modo local** (padrão) | **Modo nuvem** (Supabase) |
|---|---|---|
| Configuração | nenhuma | duas variáveis de ambiente |
| Onde os dados ficam | no próprio aparelho | no Postgres do Supabase |
| Login | senha definida no primeiro acesso | Supabase Auth |
| Permissão | espelhada no app | **Row Level Security**, no banco |
| Gabriel lança no celular dele… | …e fica no celular dele | …e chega no do Maicon na hora |
| Notificação do Maicon | só no mesmo aparelho | em tempo real, entre aparelhos |
| Custo | zero | zero (plano gratuito) |

O **modo local** serve para começar a usar hoje e para testar. O **modo nuvem**
é o que o pedido descreve de ponta a ponta — e é ele que faz sentido para a
barbearia de verdade, porque são três celulares diferentes.

Enquanto o modo local estiver ativo, o app diz isso na tela, com todas as
letras. Não há como usar por engano achando que está sincronizando.

---

## Rodar na sua máquina

```bash
cd md-cortes
npm install
npm run dev          # http://localhost:3000
```

No primeiro acesso o sistema pede que você defina a senha de cada perfil
(Maicon, Gabriel, Nino). Nenhuma senha existe no código.

Para gerar o site pronto para publicar:

```bash
npm run build        # escreve tudo em out/
npm start            # serve out/ localmente para conferir
```

---

## Ligar o modo nuvem (Supabase)

### 1. Criar o projeto

<https://supabase.com> → **New project**. O plano gratuito dá conta com folga:
uma barbearia com três pessoas gera algumas centenas de linhas por mês.

### 2. Criar os três usuários

Pelo painel (**Authentication → Users → Add user**, marcando *Auto Confirm*) ou
pelo script, que faz os três de uma vez:

```bash
export SUPABASE_URL="https://xxxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="..."     # Project Settings → API Keys
export SENHA_MAICON="..." SENHA_GABRIEL="..." SENHA_NINO="..."
npm run criar-usuarios
```

A `service_role` só existe nesse terminal. Ela **nunca** entra em arquivo do
projeto — quem a tiver ignora todas as permissões do banco.

### 3. Criar as tabelas e as permissões

No **SQL Editor** do Supabase, cole e rode, nesta ordem:

1. `supabase/schema.sql` — tabelas, índices, RLS, gatilhos e Realtime
2. `supabase/seed.sql` — serviços da casa e os cargos dos três

Os dois podem ser rodados de novo sem quebrar nada.

### 4. Apontar o app para o projeto

**Pelo próprio aplicativo** (é o caminho normal, e não exige gerar o site de
novo): em **Perfil → Conectar à nuvem**, cole o *Project URL* e a chave *anon
public*. O app guarda no aparelho e recarrega já conectado.

Feito isso, o botão **Copiar link para o outro celular** empacota a mesma
configuração num endereço. Quem abrir esse link entra conectado sem digitar
nada — é assim que o segundo e o terceiro celular são configurados.

**Pela build**, se preferir deixar fixo no site publicado:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

A ordem de precedência é: o que foi salvo no aparelho vence; sem isso valem as
variáveis da build; sem nem isso, o app abre em modo local.

A chave `anon` é pública por natureza e pode ficar no JavaScript entregue ao
celular — por isso ela também pode viajar no link de convite. Quem protege os
dados é a RLS do passo 3, não o segredo da chave. A `service_role` é outra
história e **nunca** entra em nenhum dos dois lugares.

---

## Publicar sem contratar hospedagem

A build é um site estático — 1,7 MB de HTML, CSS, JS e ícones. Qualquer um
destes serve, todos com plano gratuito:

**GitHub Pages** — um comando:

```bash
npm run publicar
```

O script gera o site e empurra **só o compilado** para o branch `gh-pages`
(o código-fonte não vai junto — o repositório de origem pode ser privado e o
Pages é público). Ele já inclui o `.nojekyll`, sem o qual o Jekyll do Pages
engole a pasta `/_next/` inteira e o site abre em branco.

Na primeira vez, ligue o Pages uma única vez:
**Settings → Pages → Deploy from a branch → `gh-pages` → `/ (root)`**.
O endereço fica `https://<usuario>.github.io/<repositorio>/`.

O `BASE_PATH` padrão do script é `/teste`, que é o nome do repositório. Para
outro repositório ou para um domínio próprio na raiz:

```bash
BASE_PATH=/outro-nome npm run publicar
BASE_PATH= npm run publicar          # raiz de um domínio próprio
```

> Pages em repositório **privado** só existe nos planos pagos do GitHub. Se o
> seu for privado e o plano for gratuito, ou torne o repositório público (o
> site publicado é público de qualquer forma), ou use uma das opções abaixo.

**Vercel** — um comando:

```bash
npm run publicar:vercel
```

O script gera o site na raiz do domínio, copia o `vercel.json` para dentro de
`out/` e sobe **só essa pasta**, num projeto fixado em `md-cortes`. Como o que
sobe não tem `package.json`, a Vercel não detecta framework nenhum e não
reconstrói nada — o que está na pasta é exatamente o que vai ao ar. O
`--project md-cortes` garante que o deploy não caia em cima de outro projeto da
conta.

Na primeira vez a CLI pede login (`vercel login`), que abre o navegador.

O `vercel.json` cuida do que uma PWA precisa e que não vem de graça: o `sw.js`
sai sem cache (senão o aparelho trava numa versão antiga para sempre), o
`manifest.webmanifest` sai com `application/manifest+json` (sem isso o Chrome
ignora o manifest e o convite de instalar nunca aparece), e o `/_next/static/`
sai com cache eterno, que é seguro porque esses arquivos têm hash no nome.

**Netlify / Cloudflare Pages** — arraste a pasta `out/` na área de deploy.
Nenhuma configuração, nenhum servidor Node.

**Um computador da própria loja** — `npm start` serve `out/` na rede local.

> Para instalar na tela de início e receber avisos, o endereço precisa ser
> **HTTPS** (ou `localhost`). Os três serviços acima já dão HTTPS de graça.
> Abrir o `index.html` direto do arquivo (`file://`) mostra o app, mas o
> navegador não permite service worker ali, então não instala.

---

## Instalar no celular

- **Android (Chrome):** abra o endereço → menu → *Instalar aplicativo*. O app
  também oferece o botão em **Perfil → Instalar no celular**.
- **iPhone (Safari):** abra o endereço → *Compartilhar* → *Adicionar à Tela de
  Início*. O iPhone não tem convite automático; o app explica o caminho.

Depois disso o MD_cortes abre pelo ícone, em tela cheia, sem barra de navegador.

---

## Permissões

O que separa o Maicon do Gabriel **não é esconder botão**. As políticas em
`supabase/schema.sql` decidem no banco:

- `haircuts` — o funcionário lê e escreve só as linhas em que
  `employee_id = auth.uid()`. O `employee_id` não vem do formulário: o `WITH
  CHECK` do INSERT obriga a ser o usuário autenticado, então o Gabriel não
  consegue lançar em nome do Nino nem forjando a requisição.
- `profiles` — cada um vê o próprio; quem tem `role = 'developer'` vê todos. O
  funcionário pode ajustar o próprio nome, nunca o próprio cargo.
- `notifications` — só o destinatário lê e marca como lida. **Não existe
  política de INSERT**: quem cria a notificação é um gatilho do Postgres, para
  que ninguém consiga escrever na caixa de entrada de outra pessoa.
- O Realtime respeita a RLS: cada sessão só recebe os eventos das linhas que
  poderia ler.

Trocar a rota no navegador não contorna nada — o banco simplesmente devolve
lista vazia.

---

## Como o corte vira número na tela

1. O funcionário escolhe serviço, valor e pagamento. Data, hora e autor não são
   digitados: saem do relógio e da sessão, no fuso `America/Sao_Paulo`.
2. O `INSERT` passa pela RLS, que confere o autor.
3. Um gatilho `AFTER INSERT` cria a notificação do Maicon — no banco, não no app.
4. O Realtime empurra o corte e a notificação para quem tem direito de vê-los.
5. Os painéis abertos recalculam indicadores, gráfico e lista a partir da lista
   que já está na memória. Nada volta ao banco, nada pisca: o número conta de 5
   para 6 e o ponto de hoje desliza para a nova altura.
6. Se o Maicon estiver com o app aberto, entra o toast; se tiver autorizado
   avisos, o sistema operacional avisa mesmo com o app em segundo plano.

---

## Estrutura

```
app/
  layout.tsx              casca, fontes, provedores, service worker
  page.tsx                abertura: decide login ou painel
  login/                  "Acesse sua conta" + primeiro acesso (modo local)
  (privado)/
    layout.tsx            portão de sessão + barra inferior
    inicio/               painel do funcionário ou do Maicon, conforme o cargo
    lancamentos/          histórico com filtros
    equipe/               cartões da equipe e relatório individual (só Maicon)
    perfil/               conta, instalação, avisos, sair

components/
  auth/                   LoginForm, PrimeiroAcesso
  cortes/                 RegisterHaircutForm, TodayTransactions
  equipe/                 EmployeeCard, RelatorioIndividual
  graficos/               ResultsChart, Minigrafico, matemática da curva
  layout/                 DashboardHeader, BottomNavigation, Marca
  notificacoes/           NotificationBell, NotificationPanel
  paineis/                PainelFuncionario, PainelAdmin
  pwa/                    InstallPrompt, AvisoDeModo, registro do SW
  ui/                     MetricCard, AnimatedCounter, Toast, Esqueleto…

lib/
  data/                   adapter + implementação nuvem e local
  hooks/                  sessão, cortes, histórico, notificações, PWA
  date.ts                 todo o recorte de dia/semana/mês no fuso da barbearia
  resumo.ts               fecha hoje/semana/mês por funcionário numa passada

supabase/
  schema.sql              tabelas, índices, RLS, gatilhos, Realtime
  seed.sql                serviços e cargos
```

---

## Preços dos serviços

O catálogo entra com preço **zero** de propósito. A tabela real da barbearia
não foi informada, e chutar valor de serviço é inventar dado da casa. Ajuste em
`supabase/seed.sql` (ou direto na tabela `services`) e o valor passa a aparecer
sugerido no formulário — o funcionário ainda pode mudar antes de lançar.

---

## Comandos

| | |
|---|---|
| `npm run dev` | desenvolvimento em <http://localhost:3000> |
| `npm run build` | gera o site estático em `out/` |
| `npm start` | serve `out/` para conferir antes de publicar |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emitir |
| `npm run publicar` | gera o site e publica no branch `gh-pages` |
| `npm run publicar:vercel` | gera o site e publica na Vercel, no projeto `md-cortes` |
| `npm run criar-usuarios` | cria os três usuários no Supabase Auth |
| `npm run icones` | regenera os ícones da PWA a partir de `scripts/icone.html` |
