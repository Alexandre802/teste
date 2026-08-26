-- ═══════════════════════════════════════════════════════════════════════════
-- MD_cortes — dados iniciais
-- Rode depois de schema.sql. Também é idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Serviços da casa ──────────────────────────────────────────────────────
-- Os preços abaixo são apenas o valor que aparece pré-preenchido no formulário;
-- o funcionário pode alterar antes de lançar. Ajuste para a tabela real da
-- barbearia — nenhum destes valores foi confirmado com a casa.

insert into public.services (name, default_price, sort_order) values
  ('Corte',          0, 1),
  ('Corte Degradê',  0, 2),
  ('Barba',          0, 3),
  ('Corte + Barba',  0, 4),
  ('Sobrancelha',    0, 5),
  ('Acabamento',     0, 6),
  ('Outro',          0, 7)
on conflict (name) do nothing;

-- ── Cargos dos três usuários ──────────────────────────────────────────────
-- Os usuários em si são criados no painel (Authentication → Users → Add user)
-- ou pelo script `npm run criar-usuarios`. A senha nunca passa por aqui.
--
-- Depois de criados, rode este bloco para acertar cargo e função de cada um.
-- Troque os e-mails pelos que você cadastrou de verdade.

update public.profiles set name = 'Maicon',  role = 'developer', job_title = 'Desenvolvedor'
  where email = 'maicon@mdcortes.app';

update public.profiles set name = 'Gabriel', role = 'employee',  job_title = 'Funcionário 1'
  where email = 'gabriel@mdcortes.app';

update public.profiles set name = 'Nino',    role = 'employee',  job_title = 'Funcionário 2'
  where email = 'nino@mdcortes.app';

-- Confirmação — deve listar os três com o cargo certo.
select name, email, role, job_title from public.profiles order by role, name;
