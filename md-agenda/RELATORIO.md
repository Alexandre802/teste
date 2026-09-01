# MD_agenda — relatório de entrega

## Onde o projeto está

Aplicação nova e autocontida em `md-agenda/`, na raiz do repositório. Ela não
toca no site da Michel Food House que já existia aqui — outro produto, outro
`package.json`, outro deploy.

---

## Banco criado

`supabase/migrations/0001_init.sql`

### Tabelas

| Tabela | Para quê |
| --- | --- |
| `profiles` | Quem pode entrar no painel. Linha criada à mão pelo dono. |
| `services` | Serviços: nome, descrição, preço em centavos, duração, ativo, ordem. |
| `business_hours` | Expediente por dia da semana, com intervalo opcional. |
| `blocked_periods` | Bloqueios do barbeiro (compromisso, folga, período). |
| `appointments` | Agendamentos, com snapshot de nome/preço/duração do serviço. |
| `notifications` | Avisos internos que alimentam o Realtime do painel. |
| `settings` | Linha única: regras de agenda e dados da barbearia. |
| `customers_overview` | Visão (não tabela) com clientes derivados dos agendamentos. |

### Garantias do próprio banco

- **`appointments_no_overlap`** — exclusion constraint sobre
  `tstzrange(starts_at, ends_at, '[)')` restrita a `pending` e `confirmed`.
  É o que impede dois clientes no mesmo horário mesmo com pedidos simultâneos
  em réplicas diferentes.
- **`appointments_reject_blocked`** — trigger que recusa gravação em cima de um
  bloqueio.
- `updated_at` automático em `services`, `appointments`, `business_hours` e
  `settings`.
- Publicação `supabase_realtime` em `appointments` e `notifications`.

### RLS

Ligada em **todas** as tabelas.

- **Nenhuma policy para `anon`.** O cliente anônimo não lista agendamento, não
  lista cliente e não alcança telefone de ninguém. A área pública é servida
  pelo servidor do Next com service role, que devolve só o necessário.
- **`authenticated`**: acesso total, porém condicionado a `public.is_admin()` —
  ou seja, à existência de uma linha em `profiles` com `role = 'admin'`. Um
  usuário que apenas se autentica, sem essa linha, não enxerga nada.
- A visão `customers_overview` usa `security_invoker = on`, então respeita a
  RLS de quem consulta em vez de rodar com os poderes do dono.

---

## Arquivos criados

### Configuração
`package.json` · `tsconfig.json` · `next.config.ts` · `postcss.config.mjs` ·
`eslint.config.mjs` · `playwright.config.ts` · `.env.example` · `.gitignore` ·
`README.md` · `RELATORIO.md`

### Domínio e regras
- `types/index.ts` — tipos de domínio, status e rótulos em português.
- `lib/time.ts` — **todo** o fuso horário do produto (UTC ↔ America/Sao_Paulo).
- `lib/scheduling/engine.ts` — motor de disponibilidade (função pura).
- `lib/scheduling/availability.ts` — ponte entre banco e motor.
- `lib/scheduling/booking.ts` — criação e cancelamento com revalidação.
- `lib/format.ts` — telefone, preço, código do agendamento.
- `lib/validation.ts` — schemas Zod de todo payload que entra.
- `lib/rate-limit.ts` — janela deslizante por IP, telefone e e-mail.
- `lib/config.ts` — leitura de ambiente e detecção do que está configurado.
- `lib/settings.ts` · `lib/api.ts` · `lib/brand-icon.ts`

### Dados
- `lib/db/store.ts` — contrato do armazenamento.
- `lib/db/supabase-store.ts` — implementação Supabase.
- `lib/db/memory.ts` — banco local (desenvolvimento e testes).
- `lib/db/defaults.ts` · `lib/db/index.ts`
- `lib/supabase/admin.ts` · `server.ts` · `client.ts`

### Autenticação
- `lib/auth/admin.ts` — Supabase Auth, ou credencial local com cookie HMAC.
- `lib/auth/guard.ts` — `requireAdmin()` server-side.

### Notificações
- `lib/notifications/whatsapp.ts` — `buildAppointmentMessage()` e
  `getWhatsappAppointmentUrl()`, fonte única do texto.
- `lib/notifications/whatsapp-api.ts` — Cloud API (extra).
- `lib/notifications/notify.ts` — notificação interna + envio externo.

### Rotas
`app/page.tsx` · `app/meus-agendamentos/page.tsx` · `app/informacoes/page.tsx` ·
`app/politica-de-privacidade/page.tsx` · `app/offline/page.tsx` ·
`app/layout.tsx` · `app/manifest.ts` · `app/robots.ts` · `app/sitemap.ts` ·
`app/icon.tsx` · `app/apple-icon.tsx` · `app/icons/[variant]/route.tsx`

`app/admin/login/page.tsx` · `app/admin/actions.ts` ·
`app/admin/(painel)/layout.tsx` · `page.tsx` · `agenda/page.tsx` ·
`clientes/page.tsx` · `servicos/page.tsx` · `configuracoes/page.tsx`

`app/api/servicos` · `app/api/disponibilidade` · `app/api/agendamentos` ·
`app/api/agendamentos/consulta` · `app/api/agendamentos/cancelar` ·
`app/api/whatsapp/webhook` · `app/api/local/seed`

### Interface
- `components/ui/` — Logo, Button, Field, StatusBadge, Feedback, Motion,
  StoreNotice.
- `components/client/` — Hero, BookingFlow, ServiceCards, DateStrip, TimeGrid,
  CustomerForm, Stepper, Summary, SuccessScreen, LookupPanel, HowItWorks,
  SiteHeader, SiteFooter, BottomNav.
- `components/admin/` — AdminShell, StatCards, AppointmentItem, BlocksManager,
  ServicesManager, SettingsForm, BusinessHoursForm, LoginForm,
  RealtimeRefresher.
- `components/pwa/RegistrarSW.tsx` · `public/sw.js` · `app/globals.css`

### Testes
`tests/unit/agenda.test.ts` · `tests/unit/mensagem.test.ts` ·
`tests/e2e/{agendamento,conflito,cancelamento,bloqueio,admin,seguranca,responsivo}.spec.ts` ·
`tests/e2e/apoio.ts` · `tests/alias-loader.mjs` · `tests/alias-register.mjs`

## Arquivos alterados fora de `md-agenda/`

Nenhum. O site da Michel Food House ficou intacto.

---

## Funcionalidades

### Cliente
- Fluxo contínuo em uma tela: serviço → data → horário → dados → confirmação,
  com o estado preservado ao voltar.
- Faixa de datas navegável, sem passado e sem passar da janela configurada.
- Horários calculados de verdade: expediente, duração do serviço, ocupações,
  bloqueios, intervalo, antecedência mínima e data escolhida.
- Horário ocupado aparece desabilitado, não some — o cliente entende o porquê.
- Máscara brasileira de telefone e validação de DDD.
- Resumo completo antes de confirmar.
- Código curto (`MD-A83F2`) sem caracteres que se confundem ao ditar.
- Consulta e cancelamento sem conta, com telefone **e** código.
- Cancelamento respeita `cancel_before_minutes`; fora do prazo, orienta a falar
  com o barbeiro.

### Painel
- Login protegido, com verificação server-side no layout e em cada ação.
- Dashboard com números reais do dia, próximo cliente e atividade da semana.
- Agenda de hoje em timeline; detalhe com telefone, observação e criação.
- Ações: confirmar, concluir, não compareceu, cancelar e reagendar.
- Reagendamento passa pelo mesmo motor de disponibilidade — o painel não fura a
  própria agenda.
- Calendário com visões hoje/semana/mês e filtros por status e serviço.
- Bloqueios por horário, período ou dia inteiro.
- Clientes derivados dos agendamentos, sem cadastro manual.
- Serviços: criar, editar, ativar/desativar, preço, duração e ordem.
- Configurações: expediente da semana com intervalo, regras de agenda,
  confirmação automática e dados da barbearia.

### Snapshot do serviço
`service_name_snapshot`, `service_price_snapshot` e
`service_duration_snapshot` são gravados na criação. Mudar o preço de R$ 60
para R$ 70 amanhã não reescreve o que foi combinado hoje — coberto por teste.

---

## Motion implementado

- Hero: `opacity 0 → 1` e `translateY ~15px → 0`, em stagger curto.
- Serviços: stagger de 45 ms; ao selecionar, `scale → 1.015`, borda dourada e
  check entrando com `scale`, em 180–200 ms.
- Datas: slide horizontal curto ao trocar de bloco, com `AnimatePresence`.
- Horários: stagger de 20 ms; selecionado ganha micro-scale e check.
- Etapas: transição de opacidade com deslocamento horizontal de 12 px.
- Sucesso: check de `scale 0.8 → 1` com um anel que se expande e some.
- Painel: cards em stagger, timeline suave, detalhe abrindo por altura.
- `prefers-reduced-motion`: as distâncias vão a zero e as durações somem —
  o conteúdo é o mesmo, parado. Coberto por teste.

---

## PWA

- `manifest.webmanifest` gerado pelo App Router, `display: standalone`,
  `theme_color` e `background_color` `#070d14`, atalhos para as duas rotas.
- Ícones **PNG de verdade** em 192, 512 e as duas variantes `maskable`,
  gerados a partir do mesmo SVG da marca (`app/icons/[variant]/route.tsx`),
  mais `icon` e `apple-icon`.
- Service worker (`public/sw.js`): estático em cache-first com atualização em
  segundo plano; navegação em network-first com página offline. **Não** cacheia
  `/api/`, `/admin`, ícones nem o manifesto — nenhuma criação ou cancelamento
  de agendamento passa por cache.
- Atualização automática: procura versão nova ao abrir, ao voltar do segundo
  plano e ao recuperar conexão. Ninguém precisa reinstalar o PWA.

---

## Testes

### Unidade — 27 casos, todos passando
`npm test`

Fuso horário (ida, volta e consistência), grade de horários (expediente,
duração, colisão, encaixe sem sobreposição, intervalo, bloqueio, antecedência,
mudança de intervalo), validação de horário específico (fora do expediente,
ocupado, fora da janela, no passado) e a mensagem do WhatsApp travada
caractere a caractere.

### E2E — 68 casos, todos passando em celular e desktop
`npm run test:e2e`

| Arquivo | Cobre |
| --- | --- |
| `agendamento` | Fluxo completo; horário some depois de agendado; ocupado aparece desabilitado; dia fechado; telefone inválido |
| `conflito` | **Dois pedidos simultâneos no mesmo horário: um 201 e um 409**; duplicação sequencial; serviço longo que invadiria outro |
| `cancelamento` | Consulta por telefone + código; cancelamento; horário volta para a agenda; código errado não abre nada; prazo proibido |
| `bloqueio` | Bloqueio criado no painel some da tela do cliente; dia inteiro; intervalo do almoço |
| `admin` | Painel fechado sem sessão; senha errada; ver agendamento novo; confirmar; reagendar; reagendar em cima de outro é recusado; criar serviço que aparece para o cliente |
| `seguranca` | Payload adulterado; preço/duração/status/código vindos do cliente são ignorados; consulta não devolve agenda alheia; texto gigante; token da rota local; webhook; rotas do painel; excesso de tentativas |
| `responsivo` | 360 a 1920 px sem rolagem horizontal; alvos de toque ≥ 44 px; manifesto; ícones e service worker; SEO e JSON-LD; `prefers-reduced-motion` |

### Build
`npm run lint` · `npm run typecheck` · `npm run build` — os três limpos.

---

## O que funciona

- Cliente agenda sozinho, do link à confirmação, em menos de um minuto.
- Não existe conflito de horário — garantido no banco, não só na tela.
- O agendamento é gravado com snapshot de preço e duração.
- O horário ocupado sai da agenda na mesma hora.
- O barbeiro vê o pedido no painel; com Supabase, sem recarregar a página.
- Confirmar, concluir, cancelar, marcar falta e reagendar.
- Bloquear horário, período ou dia inteiro.
- Cliente consulta e cancela sem criar conta.
- Mensagem do WhatsApp montada e entregue pelo `wa.me`, sem credencial.
- Funciona em celular e desktop, instala como PWA.
- Sessão do painel protegida no servidor.
- Build e testes passam.

---

## ⚠️ Configuração necessária

1. **Supabase** — criar o projeto, rodar `supabase/migrations/0001_init.sql` e
   preencher `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
   `SUPABASE_SERVICE_ROLE_KEY` em `.env.local`. Sem isso o agendamento falha
   fechado, com mensagem honesta.
2. **Usuário do Maicon** — criar em Authentication → Users e inserir a linha em
   `public.profiles` com `role = 'admin'` (SQL pronto em `supabase/README.md`).
   Sem a linha, ele autentica mas não vê nada.
3. **`NEXT_PUBLIC_SITE_URL`** — domínio real, usado em canonical, sitemap,
   robots e Open Graph.
4. **`MAICON_WHATSAPP_NUMBER`** — ou o campo equivalente em
   `/admin/configuracoes`. Sem número, o botão de WhatsApp simplesmente não
   aparece.
5. **Realtime** — confirmar no painel do Supabase que `appointments` e
   `notifications` estão publicadas (a migration tenta fazer isso).
6. **Cloud API do WhatsApp (opcional)** — `WHATSAPP_TOKEN`,
   `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`. Sem elas o produto
   funciona igual, pelo `wa.me`.
7. **Rate limit** — a contagem é por instância do servidor. Em várias réplicas,
   trocar `lib/rate-limit.ts` por Redis/Upstash; a estrutura já é a de um
   limitador externo (só a função `hit` muda).

---

## ❓ Preciso da informação do Maicon

Nada disso foi inventado. Enquanto não for preenchido, o site diz que a agenda
não está aberta, em vez de mostrar número que ninguém confirmou.

1. **Expediente real** — quais dias abre, que horas abre e fecha, e se há
   intervalo. *A semana nasce fechada de propósito.*
2. **Serviços reais** — nome, preço e duração de cada um. *Nenhum serviço vem
   cadastrado.*
3. **Telefone/WhatsApp** que recebe os pedidos.
4. **Dias de folga e feriados** — entram como bloqueios em `/admin/agenda`.
5. **Política de cancelamento** — com quanta antecedência o cliente ainda pode
   cancelar sozinho (o padrão técnico é 120 min, não é uma regra dele).
6. **Confirmação automática** — o pedido já entra confirmado ou ele confirma um
   a um? (o padrão está em "ele confirma").
7. **Endereço** da barbearia, se quiser mostrar no site.
8. **Foto dele** — uma URL `https://`. Sem foto confirmada, entra o selo da
   marca; nenhuma imagem de banco é usada no lugar dele.
9. **Dados da empresa** para a política de privacidade — razão social, CNPJ e
   canal de atendimento ao titular.
10. **Intervalo entre horários** — 30 min é o padrão técnico; ele pode preferir
    15, 20 ou 60.

`supabase/seed-exemplo.sql` existe só para você ver o produto rodando antes de
ter essas respostas. Os valores lá dentro são fictícios e estão marcados como
tal.

---

## Checklist final

### PRONTO ✅
- Motor de disponibilidade centralizado, com teste de unidade.
- Proteção contra agendamento duplo em três camadas, com teste de concorrência.
- Snapshot de preço e duração.
- Fuso `America/Sao_Paulo` isolado em um arquivo, com teste.
- Fluxo do cliente completo, com resumo e tela de sucesso.
- Consulta e cancelamento sem conta, protegidos por telefone + código.
- Painel completo: dashboard, agenda, clientes, serviços, configurações.
- Confirmar, concluir, cancelar, não compareceu e reagendar.
- Bloqueios de horário, período e dia inteiro.
- Realtime no painel (com Supabase configurado).
- RLS ligada, sem acesso anônimo a agendamento ou telefone.
- Rate limit, validação e sanitização em todo payload.
- PWA instalável, com ícones PNG e service worker seguro.
- Motion discreto, com `prefers-reduced-motion` respeitado.
- Responsivo de 360 a 1920 px.
- SEO: title, description, Open Graph, canonical, robots, sitemap e JSON-LD.
- Política de privacidade.
- 27 testes de unidade e 68 E2E passando; lint, typecheck e build limpos.

### CONFIGURAÇÃO NECESSÁRIA ⚠️
- Projeto Supabase, migration aplicada e chaves em `.env.local`.
- Usuário do Maicon promovido a admin em `profiles`.
- `NEXT_PUBLIC_SITE_URL` com o domínio real.
- Número de WhatsApp de destino.
- Realtime publicado nas duas tabelas.
- Cloud API do WhatsApp, se quiser envio automático (opcional).
- Rate limit externo, se for rodar em várias réplicas.

### PRECISO DE INFORMAÇÃO DO MAICON ❓
- Expediente, serviços com preço e duração, telefone, folgas, política de
  cancelamento, confirmação automática, endereço, foto, dados da empresa e
  intervalo entre horários — a lista completa está na seção acima.
