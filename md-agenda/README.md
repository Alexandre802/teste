# MD_agenda

**Seu horário, sem complicação.**

Sistema de agendamento para barbearia: o cliente abre o link, escolhe serviço,
data e horário, deixa nome e telefone e pronto — o horário fica reservado na
mesma hora e o barbeiro vê o pedido no painel, sem recarregar a página.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Framer Motion · Supabase · PWA

---

## Como rodar

### 1. Dependências

```bash
npm install
```

### 2. Ambiente

```bash
cp .env.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
`SUPABASE_SERVICE_ROLE_KEY`. O que cada variável faz está comentado no próprio
`.env.example`.

### 3. Banco

No SQL Editor do Supabase, rode `supabase/migrations/0001_init.sql`.
Detalhes e o passo para liberar o acesso do barbeiro estão em
[`supabase/README.md`](supabase/README.md).

### 4. Subir

```bash
npm run dev     # desenvolvimento
npm run build && npm start   # produção
```

Para publicar em um link de verdade (Supabase + Vercel), o passo a passo está
em [`DEPLOY.md`](DEPLOY.md).

### Experimentar sem Supabase, em um comando

```bash
npm install
npm run demo
```

Sobe o servidor com um banco local em memória e semeia um cenário de
**exemplo** — expediente, serviços e preços fictícios. O terminal imprime os
endereços e as credenciais do painel:

```
Agendar:  http://127.0.0.1:3000
Painel:   http://127.0.0.1:3000/admin
   e-mail: maicon@demo.local
   senha:  demo-md-agenda
```

O banco local só liga quando **não** há Supabase configurado, e enquanto está
ativo a interface avisa na tela que os dados não são permanentes — eles somem
quando o servidor para. Um ambiente com banco real nunca cai nele por acidente:
com `.env.local` preenchido, `npm run demo` não semeia nada e usa o Supabase.

---

## Rotas

### Cliente (sem conta)

| Rota | O que faz |
| --- | --- |
| `/` | Agendamento: serviço → data → horário → dados → confirmação |
| `/meus-agendamentos` | Consulta e cancelamento com telefone + código |
| `/informacoes` | Expediente, contato e política de cancelamento |
| `/politica-de-privacidade` | Uso de nome, telefone e agendamento |

### Painel (Supabase Auth)

| Rota | O que faz |
| --- | --- |
| `/admin/login` | Entrada do barbeiro |
| `/admin` | Dashboard: números do dia, próximo cliente, agenda, semana |
| `/admin/agenda` | Calendário (hoje/semana/mês), filtros e bloqueios |
| `/admin/clientes` | Lista montada a partir dos agendamentos |
| `/admin/servicos` | Criar, editar, ativar/desativar, preço e duração |
| `/admin/configuracoes` | Expediente, regras de agenda e dados da barbearia |

### API

| Rota | Método | O que faz |
| --- | --- | --- |
| `/api/servicos` | GET | Serviços ativos |
| `/api/disponibilidade` | GET | Horários de um dia para um serviço |
| `/api/agendamentos` | POST | Cria o agendamento (revalida tudo no servidor) |
| `/api/agendamentos/consulta` | POST | Consulta por telefone + código |
| `/api/agendamentos/cancelar` | POST | Cancelamento pelo cliente |
| `/api/whatsapp/webhook` | GET/POST | Webhook da Cloud API (falha fechada sem token) |

---

## Como a agenda decide um horário

Toda pergunta sobre disponibilidade passa por **um** motor:
[`lib/scheduling/engine.ts`](lib/scheduling/engine.ts) — função pura, sem banco
e sem rede. Ele recebe expediente, ocupações, bloqueios, regras e o instante
atual, e devolve os horários. Cliente, API e painel usam a mesma função; a
regra não é reescrita em lugar nenhum.

Um horário só é oferecido quando o serviço **inteiro** cabe: 10:00 para um
serviço de 60 min não aparece se 10:30 estiver ocupado.

### Agendamento duplo

Três camadas, da mais externa para a mais interna:

1. A tela mostra apenas horários que o servidor considera livres.
2. `POST /api/agendamentos` revalida tudo — serviço ativo, preço, duração,
   expediente, intervalo, bloqueio, antecedência, janela e colisão.
3. O banco recusa por conta própria: uma *exclusion constraint* sobre
   `tstzrange(starts_at, ends_at)`, restrita aos status que ocupam agenda.
   Dois pedidos no mesmo milissegundo, em réplicas diferentes: um grava, o
   outro recebe `23P01` e vira "esse horário acabou de ser reservado".

---

## Fuso horário

O banco guarda UTC (`timestamptz`); a interface e as regras trabalham em
`America/Sao_Paulo`. Toda conversão passa por
[`lib/time.ts`](lib/time.ts) — nenhum outro arquivo faz aritmética de fuso.

---

## Testes

```bash
npm run lint
npm run typecheck
npm test          # unidade: motor de agenda, fuso, mensagem do WhatsApp
npm run test:e2e  # Playwright, celular e desktop (constrói antes)
npm run test:all  # tudo em sequência
```

A suíte E2E roda contra o build de produção com o armazenamento local ligado —
o mesmo código de servidor que atende o Supabase, com outro banco por trás.

---

## Nada de função falsa

Regra que vale para o projeto todo: **método que não funciona de verdade não
aparece na tela.**

- Sem número de WhatsApp configurado, o botão de envio some — não existe botão
  que não leva a lugar nenhum.
- A tela de sucesso só diz "enviado automaticamente" quando a Cloud API
  confirmou a entrega. Sem ela, diz que o pedido entrou na agenda e oferece o
  `wa.me`, que é o caminho garantido.
- Sem banco configurado, o agendamento falha fechado com mensagem honesta em
  vez de simular sucesso.
- Sem `WHATSAPP_VERIFY_TOKEN`, o webhook recusa a verificação em vez de aceitar
  qualquer chamada.

## Segredos

Nunca escreva chave em arquivo versionado, e **jamais** em variável
`NEXT_PUBLIC_*` — esse prefixo entrega o valor ao navegador. A service role do
Supabase só existe no servidor, em módulos marcados `server-only`.
