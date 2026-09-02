-- 0007: catálogo oficial extraído da fonte pública da própria casa em 02/09/2026.
-- Mantém preço/opções do servidor iguais ao cardápio exibido ao cliente.

insert into comida_caseira_products (id, nome, categoria, price_cents, ativo) values
('5030162','Bife a Cavalo','marmitex-irresistivel',2100,true),
('5030182','Bife Acebolado','marmitex-irresistivel',2100,true),
('5030282','Filé de Frango Grelhado','marmitex-irresistivel',1800,true),
('5030174','Filé de Frango Parmegiana','marmitex-irresistivel',1800,true),
('5030171','Filé de Frango Milanesa','marmitex-irresistivel',1800,true),
('5030709','Omelete','marmitex-irresistivel',1800,true),
('5030239','Parmegiana de Bife','marmitex-irresistivel',2000,true),
('5031534','Coca Cola Mini','bebidas',400,true),
('5031539','Coca Cola Lata','bebidas',700,true),
('5031542','Fanta Laranja 2L','bebidas',1400,true),
('5036067','Frutuba 2L','bebidas',800,true),
('5545973','Coca Cola Normal 2L','bebidas',1700,true)
on conflict (id) do update set
  nome=excluded.nome, categoria=excluded.categoria, price_cents=excluded.price_cents,
  ativo=excluded.ativo, updated_at=now();

-- Remove somente opções destes produtos para recriar o espelho fiel.
delete from comida_caseira_product_options where product_id in
('5030162','5030182','5030282','5030174','5030171','5030709','5030239');

insert into comida_caseira_product_options
(id,product_id,grupo_id,grupo_nome,nome,price_delta_cents,ativo) values
('5030162:9462417','5030162','5030162:1155279','Escolha seu Tamanho!','Tamanho P',0,true),
('5030162:9462418','5030162','5030162:1155279','Escolha seu Tamanho!','Tamanho M',200,true),
('5030162:9462419','5030162','5030162:1155279','Escolha seu Tamanho!','Tamanho G',500,true),
('5030162:10587628','5030162','5030162:1162832','Acompanhamentos','Batata Rústica',0,true),
('5030162:10635103','5030162','5030162:1162832','Acompanhamentos','Farofa',0,true),
('5030182:9462423','5030182','5030182:1155281','Escolha seu Tamanho!','Tamanho P',0,true),
('5030182:9462424','5030182','5030182:1155281','Escolha seu Tamanho!','Tamanho M',200,true),
('5030182:9462425','5030182','5030182:1155281','Escolha seu Tamanho!','Tamanho G',500,true),
('5030182:10587628','5030182','5030182:1162832','Acompanhamentos','Batata Rústica',0,true),
('5030182:10635103','5030182','5030182:1162832','Acompanhamentos','Farofa',0,true),
('5030282:9462571','5030282','5030282:1155313','Escolha seu Tamanho!','Tamanho P',0,true),
('5030282:9462572','5030282','5030282:1155313','Escolha seu Tamanho!','Tamanho M',200,true),
('5030282:9462573','5030282','5030282:1155313','Escolha seu Tamanho!','Tamanho G',500,true),
('5030282:10587628','5030282','5030282:1162832','Acompanhamentos','Batata Rústica',0,true),
('5030282:10635103','5030282','5030282:1162832','Acompanhamentos','Farofa',0,true),
('5030174:9462577','5030174','5030174:1155315','Escolha seu Tamanho!','Tamanho P',0,true),
('5030174:9462578','5030174','5030174:1155315','Escolha seu Tamanho!','Tamanho M',200,true),
('5030174:9462579','5030174','5030174:1155315','Escolha seu Tamanho!','Tamanho G',500,true),
('5030174:10587628','5030174','5030174:1162832','Acompanhamentos','Batata Rústica',0,true),
('5030174:10635103','5030174','5030174:1162832','Acompanhamentos','Farofa',0,true),
('5030171:9462574','5030171','5030171:1155314','Escolha seu Tamanho!','Tamanho P',0,true),
('5030171:9462575','5030171','5030171:1155314','Escolha seu Tamanho!','Tamanho M',200,true),
('5030171:9462576','5030171','5030171:1155314','Escolha seu Tamanho!','Tamanho G',500,true),
('5030171:10587628','5030171','5030171:1162832','Acompanhamentos','Batata Rústica',0,true),
('5030171:10635103','5030171','5030171:1162832','Acompanhamentos','Farofa',0,true),
('5030709:9462809','5030709','5030709:1155363','Escolha seu Tamanho!','Tamanho P',0,true),
('5030709:9462810','5030709','5030709:1155363','Escolha seu Tamanho!','Tamanho M',200,true),
('5030709:9462811','5030709','5030709:1155363','Escolha seu Tamanho!','Tamanho G',400,true),
('5030709:10587628','5030709','5030709:1162832','Acompanhamentos','Batata Rústica',0,true),
('5030709:10635103','5030709','5030709:1162832','Acompanhamentos','Farofa',0,true),
('5030239:9462658','5030239','5030239:1155342','Escolha seu Tamanho!','Tamanho P',100,true),
('5030239:9462659','5030239','5030239:1155342','Escolha seu Tamanho!','Tamanho M',300,true),
('5030239:9462660','5030239','5030239:1155342','Escolha seu Tamanho!','Tamanho G',600,true),
('5030239:10587628','5030239','5030239:1162832','Acompanhamentos','Batata Rústica',0,true),
('5030239:10635103','5030239','5030239:1162832','Acompanhamentos','Farofa',0,true);

update comida_caseira_settings set
  telefone='5512981892680',
  whatsapp='5512996011026',
  endereco='Av. Augusto Rodrigues, 511 - Jardim Maria Amelia, Jacareí - SP',
  horarios='[{"dias":"Todos os dias","horario":"08:30 às 15:00"},{"dias":"Domingo a quinta","horario":"16:00 às 23:00"},{"dias":"Sexta e sábado","horario":"16:00 às 23:30"}]'::jsonb,
  updated_at=now()
where id=true;
