-- ═══════════════════════════════════════════════════════════════════════════
-- Dados iniciais.
--
-- Só entra aqui o que é ESTRUTURA, nunca dado do negócio. As categorias de
-- despesa abaixo são rótulos operacionais, editáveis na tela de
-- Configurações. Nome, telefone, endereço, produto, preço, taxa de entrega e
-- horário NÃO são semeados: nada disso foi confirmado pela proprietária, e
-- número inventado em painel financeiro é pior que campo vazio.
--
-- O painel começa vazio de propósito e diz "Nenhum pedido ainda".
-- ═══════════════════════════════════════════════════════════════════════════

insert into comida_caseira_expense_categories (name, slug, sort_order) values
  ('Ingredientes',  'ingredientes',  10),
  ('Mercadoria',    'mercadoria',    20),
  ('Embalagens',    'embalagens',    30),
  ('Gás',           'gas',           40),
  ('Energia',       'energia',       50),
  ('Água',          'agua',          60),
  ('Internet',      'internet',      70),
  ('Aluguel',       'aluguel',       80),
  ('Funcionários',  'funcionarios',  90),
  ('Taxas',         'taxas',        100),
  ('Delivery',      'delivery',     110),
  ('Marketing',     'marketing',    120),
  ('Limpeza',       'limpeza',      130),
  ('Transporte',    'transporte',   140),
  ('Manutenção',    'manutencao',   150),
  ('Outros',        'outros',       160)
on conflict (slug) do nothing;

-- ─────────────────────── tempo real do painel ───────────────────────
-- Pedido novo precisa aparecer sem recarregar a página. Só a tabela de
-- pedidos entra na publicação: quem escuta já passou pela RLS, e não há
-- motivo para transmitir despesa e caixa por websocket.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table comida_caseira_orders;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PRIMEIRO ACESSO — o que fazer depois de rodar as migrations
--
-- Não existe cadastro público de administrador, de propósito. Para criar o
-- primeiro usuário:
--
--   1. Painel do Supabase → Authentication → Users → "Add user"
--      Informe e-mail e senha. Marque "Auto Confirm User".
--
--   2. Volte ao SQL editor e ligue esse usuário ao painel:
--
--        insert into comida_caseira_users (user_id, name, email, role)
--        select id, 'Márcia Costa', email, 'owner'
--          from auth.users
--         where email = 'ENDERECO-QUE-VOCE-CRIOU';
--
--   3. Entre em /admin/login com esse e-mail e senha.
--
-- Sem o passo 2 o login funciona mas o painel não abre nada: `is_admin()`
-- devolve falso e a RLS bloqueia tudo. É o comportamento correto — conta de
-- autenticação não é, sozinha, permissão de acesso ao caixa.
--
-- Para adicionar mais gente depois, use a tela Configurações → Usuários
-- (só o papel `owner` enxerga).
-- ═══════════════════════════════════════════════════════════════════════════
