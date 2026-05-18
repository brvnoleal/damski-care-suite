
-- Seed: dados fictícios para demonstração
-- Limpar dados anteriores para evitar duplicidade ao re-rodar
DELETE FROM public.sessao;
DELETE FROM public.agendamento;
DELETE FROM public.despesa;
DELETE FROM public.insumo;
DELETE FROM public.paciente WHERE cpf IN ('123.456.789-12','234.567.890-45','345.678.901-78','456.789.012-23','567.890.123-56','678.901.234-89');
DELETE FROM public.dentista WHERE cro IN ('CRO-SP 12345','CRO-SP 23456','CRO-SP 34567','CRO-SP 45678');

-- Pacientes
INSERT INTO public.paciente (id, nome, cpf, telefone, email, instagram, data_nascimento, cep, estado, cidade, bairro, rua, numero, status) VALUES
  ('11111111-1111-1111-1111-111111111111','Maria Silva','123.456.789-12','(11) 99999-1234','maria@email.com','@maria.silva','1985-03-15','01310-100','SP','São Paulo','Bela Vista','Av. Paulista','1000','ativo'),
  ('22222222-2222-2222-2222-222222222222','João Oliveira','234.567.890-45','(11) 98888-5678','joao@email.com','@joao.oliveira','1990-07-22','04538-132','SP','São Paulo','Itaim Bibi','Rua Joaquim Floriano','500','ativo'),
  ('33333333-3333-3333-3333-333333333333','Ana Costa','345.678.901-78','(11) 97777-9012','ana@email.com','@ana.costa','1978-11-08','05402-000','SP','São Paulo','Pinheiros','Rua dos Pinheiros','200','ativo'),
  ('44444444-4444-4444-4444-444444444444','Pedro Santos','456.789.012-23','(11) 96666-3456','pedro@email.com',NULL,'1995-01-30','01415-001','SP','São Paulo','Consolação','Rua Augusta','1500','ativo'),
  ('55555555-5555-5555-5555-555555555555','Carla Dias','567.890.123-56','(11) 95555-7890','carla@email.com','@carla.dias','1988-09-14','04094-050','SP','São Paulo','Vila Mariana','Rua Domingos de Morais','800','inativo'),
  ('66666666-6666-6666-6666-666666666666','Lucas Mendes','678.901.234-89','(11) 94444-2345','lucas@email.com','@lucas.mendes','1992-05-20','05409-002','SP','São Paulo','Pinheiros','Rua Cardeal Arcoverde','1200','ativo');

-- Dentistas
INSERT INTO public.dentista (id, nome, especialidade, cro, telefone, email, status) VALUES
  ('aaaaaaa1-0000-0000-0000-000000000001','Dra. Amanda Costa','Harmonização Orofacial','CRO-SP 12345','(11) 99000-1111','amanda@saasodonto.com','ativo'),
  ('aaaaaaa2-0000-0000-0000-000000000002','Dr. Ricardo Ferreira','Ortodontia','CRO-SP 23456','(11) 99000-2222','ricardo@saasodonto.com','ativo'),
  ('aaaaaaa3-0000-0000-0000-000000000003','Dra. Beatriz Lima','Endodontia','CRO-SP 34567','(11) 99000-3333','beatriz@saasodonto.com','ativo'),
  ('aaaaaaa4-0000-0000-0000-000000000004','Dr. Carlos Mendes','Implantodontia','CRO-SP 45678','(11) 99000-4444','carlos@saasodonto.com','inativo');

-- Insumos (alguns próximos do vencimento para alertas)
INSERT INTO public.insumo (nome, fabricante, lote, validade, quantidade, pacientes_vinculados) VALUES
  ('Ácido Hialurônico 1ml','Allergan','LOT-AH-2026-01', CURRENT_DATE + INTERVAL '180 days', 12, 3),
  ('Toxina Botulínica 100U','Allergan','LOT-TB-2026-02', CURRENT_DATE + INTERVAL '90 days', 5, 2),
  ('Anestésico Lidocaína','DFL','LOT-LD-2026-03', CURRENT_DATE + INTERVAL '5 days', 20, 0),
  ('Fio PDO','MintLift','LOT-PDO-2026-04', CURRENT_DATE + INTERVAL '365 days', 30, 1),
  ('Luvas Cirúrgicas','Supermax','LOT-LV-2026-05', CURRENT_DATE + INTERVAL '730 days', 200, 0),
  ('Resina Composta','3M','LOT-RC-2026-06', CURRENT_DATE + INTERVAL '6 days', 8, 0),
  ('Bioestimulador Sculptra','Galderma','LOT-SC-2026-07', CURRENT_DATE + INTERVAL '270 days', 4, 1),
  ('Agulhas 30G','BD','LOT-AG-2026-08', CURRENT_DATE + INTERVAL '450 days', 500, 0);

-- Despesas
INSERT INTO public.despesa (descricao, categoria, fornecedor, valor, vencimento, status, forma_pagamento) VALUES
  ('Aluguel da clínica','Aluguel','Imobiliária Central', 8500.00, CURRENT_DATE + INTERVAL '5 days','pendente','boleto'),
  ('Energia elétrica','Utilidades','Enel', 1240.50, CURRENT_DATE - INTERVAL '2 days','pago','pix'),
  ('Compra de insumos','Insumos','Allergan Brasil', 4300.00, CURRENT_DATE - INTERVAL '10 days','pago','credito'),
  ('Internet e telefonia','Utilidades','Vivo', 380.00, CURRENT_DATE + INTERVAL '12 days','pendente','debito'),
  ('Manutenção equipamento','Manutenção','Tech Odonto', 950.00, CURRENT_DATE - INTERVAL '20 days','pago','pix'),
  ('Marketing digital','Marketing','Agência Bloom', 2200.00, CURRENT_DATE + INTERVAL '8 days','pendente','pix');

-- Agendamentos
INSERT INTO public.agendamento (data, horario, paciente_id, dentista_id, procedimento, status, valor, forma_pagamento, parcelas) VALUES
  (CURRENT_DATE, '09:00','11111111-1111-1111-1111-111111111111','aaaaaaa1-0000-0000-0000-000000000001','limpeza','confirmado',150,'pix',1),
  (CURRENT_DATE, '10:30','33333333-3333-3333-3333-333333333333','aaaaaaa1-0000-0000-0000-000000000001','avaliacao','agendado',0,'dinheiro',1),
  (CURRENT_DATE, '14:00','44444444-4444-4444-4444-444444444444','aaaaaaa2-0000-0000-0000-000000000002','restauracao','agendado',350,'credito',3),
  (CURRENT_DATE + INTERVAL '1 day', '08:30','22222222-2222-2222-2222-222222222222','aaaaaaa1-0000-0000-0000-000000000001','retorno','agendado',100,'debito',1),
  (CURRENT_DATE + INTERVAL '1 day', '11:00','66666666-6666-6666-6666-666666666666','aaaaaaa3-0000-0000-0000-000000000003','clareamento','confirmado',800,'credito',6),
  (CURRENT_DATE + INTERVAL '3 day', '15:30','11111111-1111-1111-1111-111111111111','aaaaaaa1-0000-0000-0000-000000000001','outro','agendado',1800,'pix',1),
  (CURRENT_DATE - INTERVAL '2 day', '09:00','11111111-1111-1111-1111-111111111111','aaaaaaa3-0000-0000-0000-000000000003','canal','realizado',1200,'boleto',4),
  (CURRENT_DATE - INTERVAL '5 day', '15:00','55555555-5555-5555-5555-555555555555','aaaaaaa2-0000-0000-0000-000000000002','urgencia','cancelado',200,'dinheiro',1);

-- Sessões clínicas
INSERT INTO public.sessao (paciente_id, dentista_id, data, procedimento, tecnica, substancia_lote, assinado, observacoes) VALUES
  ('11111111-1111-1111-1111-111111111111','aaaaaaa3-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '2 day','Tratamento de Canal','Endodontia mecanizada','—', true,'Procedimento realizado sem intercorrências.'),
  ('22222222-2222-2222-2222-222222222222','aaaaaaa1-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '15 day','Preenchimento labial','Técnica russa','LOT-AH-2026-01', true,'Aplicado 1ml de ácido hialurônico.'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaa1-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '30 day','Toxina botulínica','Pontos padrão terço superior','LOT-TB-2026-02', true,'Aplicação em testa e glabela.'),
  ('66666666-6666-6666-6666-666666666666','aaaaaaa1-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '7 day','Bioestimulador','Vetorização malar','LOT-SC-2026-07', true,'Resultado em 30 dias.'),
  ('44444444-4444-4444-4444-444444444444','aaaaaaa2-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '1 day','Avaliação ortodôntica',NULL,NULL, false,'Paciente iniciará tratamento em 15 dias.');
