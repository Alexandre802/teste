-- =====================================================================
-- Semente de EXEMPLO — não é dado real da barbearia.
--
-- Este arquivo NÃO roda sozinho. Ele existe para você ver o produto
-- funcionando antes de ter as informações do Maicon em mãos.
--
-- Antes de abrir para clientes: rode /admin/configuracoes e /admin/servicos
-- e substitua tudo que está aqui por informação confirmada — expediente,
-- preço, duração e política de cancelamento.
-- =====================================================================

-- Expediente de exemplo (VALORES FICTÍCIOS)
update public.business_hours set is_open = false, opens_at = null, closes_at = null,
  break_start = null, break_end = null where weekday = 0;
update public.business_hours set is_open = true, opens_at = '09:00', closes_at = '19:00',
  break_start = '12:00', break_end = '13:00' where weekday in (2, 3, 4);
update public.business_hours set is_open = true, opens_at = '09:00', closes_at = '20:00',
  break_start = '12:00', break_end = '13:00' where weekday = 5;
update public.business_hours set is_open = true, opens_at = '09:00', closes_at = '18:00',
  break_start = null, break_end = null where weekday = 6;
update public.business_hours set is_open = false, opens_at = null, closes_at = null,
  break_start = null, break_end = null where weekday = 1;

-- Serviços de exemplo (PREÇOS FICTÍCIOS)
insert into public.services (name, description, price_cents, duration_minutes, active, sort_order)
values
  ('Corte Degradê', 'Máquina e tesoura, acabamento na navalha.', 6000, 40, true, 1),
  ('Barba', 'Toalha quente, navalha e finalização.', 4000, 30, true, 2),
  ('Corte + Barba', 'O combo completo, em uma sessão só.', 9000, 60, true, 3)
on conflict do nothing;
