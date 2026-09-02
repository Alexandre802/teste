-- ===========================================================================
-- 0005: cadastros iniciais da Comida Caseira da Marcia Costa
-- ===========================================================================
-- Aqui NAO entra dado inventado. Entram apenas:
--  - as categorias de despesa pedidas no briefing (rotulos, nao valores);
--  - as duas cidades atendidas, confirmadas nas pecas da propria casa, com
--    taxa, pedido minimo e prazo em NULL ate a Marcia confirmar.
-- Produtos e precos NAO sao semeados aqui: eles vem do cardapio, pelo
-- script scripts/sincronizar-produtos.mjs.
-- ===========================================================================

insert into comida_caseira_expense_categories (nome, ordem) values
  ('Ingredientes', 10),
  ('Mercadoria', 20),
  ('Embalagens', 30),
  ('Gás', 40),
  ('Energia', 50),
  ('Água', 60),
  ('Internet', 70),
  ('Aluguel', 80),
  ('Funcionários', 90),
  ('Taxas', 100),
  ('Delivery', 110),
  ('Marketing', 120),
  ('Limpeza', 130),
  ('Transporte', 140),
  ('Manutenção', 150),
  ('Outros', 999)
on conflict (nome) do nothing;

-- Cidade sem bairro = faixa padrao daquela cidade.
insert into comida_caseira_delivery_zones (cidade, bairro, fee_cents, pedido_minimo_cents, prazo_minutos)
values
  ('Jacareí - SP', '', null, null, null),
  ('São José dos Campos - SP', '', null, null, null)
on conflict (cidade, bairro) do nothing;
