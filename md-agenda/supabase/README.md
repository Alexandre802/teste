# Banco do MD_agenda

## Aplicar

Pelo SQL Editor do Supabase, na ordem:

1. `migrations/0001_init.sql` — obrigatório.
2. `seed-exemplo.sql` — **opcional e fictício**. Só para ver o produto rodando
   antes de ter os dados reais. Substitua tudo pelo painel depois.

Ou, com a CLI:

```bash
supabase db push
```

## Liberar o acesso do Maicon ao painel

1. Supabase → Authentication → Users → **Add user** (e-mail + senha).
2. No SQL Editor, promova esse usuário a admin:

```sql
insert into public.profiles (id, full_name, role)
select id, 'Maicon', 'admin' from auth.users where email = 'email-do-maicon@exemplo.com'
on conflict (id) do update set role = 'admin';
```

Sem a linha em `profiles`, o usuário até autentica, mas a RLS não devolve
nenhum dado — o painel fica vazio de propósito.

## O que o banco garante sozinho

- `appointments_no_overlap`: dois clientes não ocupam o mesmo intervalo. É
  uma exclusion constraint sobre `tstzrange(starts_at, ends_at)` restrita aos
  status que ocupam agenda (`pending`, `confirmed`). Vale mesmo com pedidos
  simultâneos em réplicas diferentes.
- `appointments_reject_blocked`: nada é gravado em cima de um bloqueio.
- RLS ligada em todas as tabelas, sem nenhuma policy para `anon` — cliente
  anônimo não lê agendamento, cliente nem telefone.
