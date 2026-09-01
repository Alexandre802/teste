# Publicar o MD_agenda

Do zero a um link funcionando: Supabase para o banco, Vercel para o site.
Ambos têm plano gratuito suficiente para uma barbearia.

---

## 1. Banco no Supabase

1. [supabase.com](https://supabase.com) → **New project**. Escolha a região
   **South America (São Paulo)** e guarde a senha do banco.
2. No projeto, abra **SQL Editor** → **New query**.
3. Cole o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   e rode. Isso cria as tabelas, a proteção contra horário duplicado e a RLS.
4. **Opcional, só para ver o produto com dados na tela:** rode também
   [`supabase/seed-exemplo.sql`](supabase/seed-exemplo.sql). Os valores são
   fictícios — troque tudo pelo painel antes de abrir para clientes.

### Liberar o acesso do Maicon

1. **Authentication** → **Users** → **Add user** → e-mail e senha dele.
2. De volta ao **SQL Editor**, promova esse usuário a administrador:

```sql
insert into public.profiles (id, full_name, role)
select id, 'Maicon', 'admin' from auth.users
where email = 'email-do-maicon@exemplo.com'
on conflict (id) do update set role = 'admin';
```

Sem essa linha ele até autentica, mas a RLS não devolve nada e o painel fica
vazio — de propósito.

### Realtime

**Database** → **Replication** → confirme que `appointments` e `notifications`
estão publicadas. A migration tenta fazer isso sozinha.

### As três chaves

**Project Settings** → **API**. Anote:

| Chave no Supabase | Variável |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

A `service_role` ignora a RLS. Ela vai **só** na Vercel, nunca em arquivo
versionado e nunca em variável com prefixo `NEXT_PUBLIC_`.

---

## 2. Site na Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → importe o
   repositório.
2. **Root Directory:** `md-agenda` ← este passo é obrigatório. O repositório
   guarda dois projetos, e sem isso a Vercel constrói o errado.
3. Framework: Next.js (detectado sozinho). Não mexa em build command.
4. **Environment Variables**, antes do primeiro deploy:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://seu-projeto.vercel.app
MAICON_WHATSAPP_NUMBER=5512999999999
```

5. **Deploy**. Ao final, ajuste `NEXT_PUBLIC_SITE_URL` para a URL real que a
   Vercel gerou (ou para o domínio próprio) e faça um redeploy — ela alimenta
   canonical, sitemap, robots e Open Graph.

---

## 3. Primeiro acesso

1. Abra `https://sua-url/admin/login` e entre com o usuário criado no passo 1.
2. **Configurações** → marque os dias de atendimento e os horários reais.
   *A semana nasce fechada: enquanto nenhum dia estiver aberto, o site não
   oferece horário nenhum.*
3. **Serviços** → cadastre os serviços com preço e duração reais.
4. Ajuste antecedência mínima, janela de agendamento, prazo de cancelamento e
   se o agendamento já entra confirmado.
5. Abra `https://sua-url/` e marque um horário de teste para ver o pedido
   aparecer no painel.

---

## 4. WhatsApp

O link `wa.me` funciona assim que `MAICON_WHATSAPP_NUMBER` estiver preenchido
(ou o campo equivalente em **Configurações**, que tem precedência). Não precisa
de mais nada.

A **Cloud API** é um extra, para o envio sair automático sem o cliente tocar em
nada. Se quiser ligar depois: crie o app no Meta for Developers e adicione
`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` e `WHATSAPP_VERIFY_TOKEN`,
apontando o webhook para `https://sua-url/api/whatsapp/webhook`. Sem essas
variáveis o produto funciona igual — e a tela de sucesso não promete envio
automático que não aconteceu.

---

## Antes de divulgar o link

- [ ] Expediente real configurado
- [ ] Serviços com preço e duração reais
- [ ] Número de WhatsApp de destino
- [ ] Usuário do Maicon promovido a admin em `profiles`
- [ ] `NEXT_PUBLIC_SITE_URL` com a URL final
- [ ] Um agendamento de teste feito e visto no painel
- [ ] Razão social e CNPJ preenchidos na política de privacidade
