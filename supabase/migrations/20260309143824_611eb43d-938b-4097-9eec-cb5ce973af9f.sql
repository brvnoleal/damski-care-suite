
-- Inserir Dentistas
INSERT INTO public.dentista (id, nome, especialidade, cro, telefone, email, instagram, status) VALUES
('d1000000-0000-4000-a000-000000000001', 'Dra. Amanda Damski', 'Harmonização Orofacial', 'CRO-SP 12345', '(11) 99000-1111', 'amanda@damski.com', '@dra.amandadamski', 'ativo'),
('d1000000-0000-4000-a000-000000000002', 'Dr. Ricardo Ferreira', 'Ortodontia', 'CRO-SP 23456', '(11) 99000-2222', 'ricardo@damski.com', '@dr.ricardo', 'ativo'),
('d1000000-0000-4000-a000-000000000003', 'Dra. Beatriz Lima', 'Endodontia', 'CRO-SP 34567', '(11) 99000-3333', 'beatriz@damski.com', '@dra.beatriz', 'ativo'),
('d1000000-0000-4000-a000-000000000004', 'Dr. Carlos Mendes', 'Implantodontia', 'CRO-SP 45678', '(11) 99000-4444', 'carlos@damski.com', NULL, 'inativo');

-- Inserir Pacientes
INSERT INTO public.paciente (id, nome, cpf, telefone, email, instagram, data_nascimento, status) VALUES
('a1000000-0000-4000-a000-000000000001', 'Maria Silva', '123.456.789-12', '(11) 99999-1234', 'maria@email.com', '@maria.silva', '1985-03-15', 'ativo'),
('a1000000-0000-4000-a000-000000000002', 'João Oliveira', '234.567.890-45', '(11) 98888-5678', 'joao@email.com', '@joao.oliveira', '1990-07-22', 'ativo'),
('a1000000-0000-4000-a000-000000000003', 'Ana Costa', '345.678.901-78', '(11) 97777-9012', 'ana@email.com', '@ana.costa', '1978-11-08', 'ativo'),
('a1000000-0000-4000-a000-000000000004', 'Pedro Santos', '456.789.012-23', '(11) 96666-3456', 'pedro@email.com', NULL, '1995-01-30', 'ativo'),
('a1000000-0000-4000-a000-000000000005', 'Carla Dias', '567.890.123-56', '(11) 95555-7890', 'carla@email.com', '@carla.dias', '1988-09-14', 'inativo'),
('a1000000-0000-4000-a000-000000000006', 'Lucas Mendes', '678.901.234-89', '(11) 94444-2345', 'lucas@email.com', '@lucas.mendes', '1992-05-20', 'ativo'),
('a1000000-0000-4000-a000-000000000007', 'Fernanda Lima', '789.012.345-01', '(11) 93333-6789', 'fernanda@email.com', '@fernanda.lima', '1983-12-05', 'ativo'),
('a1000000-0000-4000-a000-000000000008', 'Roberto Almeida', '890.123.456-34', '(11) 92222-0123', 'roberto@email.com', NULL, '1975-06-18', 'ativo'),
('a1000000-0000-4000-a000-000000000009', 'Juliana Martins', '901.234.567-67', '(11) 91111-4567', 'juliana@email.com', '@ju.martins', '1998-02-28', 'ativo'),
('a1000000-0000-4000-a000-000000000010', 'Marcos Pereira', '012.345.678-90', '(11) 90000-8901', 'marcos@email.com', '@marcos.pereira', '1987-08-10', 'ativo');

-- Inserir Agendamentos
INSERT INTO public.agendamento (data, horario, paciente_id, dentista_id, procedimento, status, valor, forma_pagamento, parcelas, observacoes) VALUES
('2026-01-05', '09:00', 'a1000000-0000-4000-a000-000000000001', 'd1000000-0000-4000-a000-000000000001', 'limpeza', 'realizado', 250, 'pix', 1, NULL),
('2026-01-07', '10:30', 'a1000000-0000-4000-a000-000000000002', 'd1000000-0000-4000-a000-000000000002', 'ortodontia', 'realizado', 3500, 'credito', 10, 'Início tratamento ortodôntico'),
('2026-01-10', '14:00', 'a1000000-0000-4000-a000-000000000003', 'd1000000-0000-4000-a000-000000000001', 'clareamento', 'realizado', 1200, 'credito', 3, NULL),
('2026-01-12', '08:30', 'a1000000-0000-4000-a000-000000000006', 'd1000000-0000-4000-a000-000000000003', 'canal', 'realizado', 1800, 'boleto', 4, 'Dente 36'),
('2026-01-15', '16:00', 'a1000000-0000-4000-a000-000000000004', 'd1000000-0000-4000-a000-000000000001', 'avaliacao', 'realizado', 0, 'dinheiro', 1, 'Primeira consulta'),
('2026-01-20', '11:00', 'a1000000-0000-4000-a000-000000000007', 'd1000000-0000-4000-a000-000000000001', 'implante', 'realizado', 4500, 'credito', 12, NULL),
('2026-01-22', '09:30', 'a1000000-0000-4000-a000-000000000008', 'd1000000-0000-4000-a000-000000000002', 'restauracao', 'realizado', 450, 'debito', 1, NULL),
('2026-01-25', '15:00', 'a1000000-0000-4000-a000-000000000009', 'd1000000-0000-4000-a000-000000000001', 'limpeza', 'cancelado', 250, 'dinheiro', 1, 'Paciente não compareceu'),
('2026-02-03', '09:00', 'a1000000-0000-4000-a000-000000000001', 'd1000000-0000-4000-a000-000000000001', 'retorno', 'realizado', 100, 'pix', 1, NULL),
('2026-02-05', '10:00', 'a1000000-0000-4000-a000-000000000010', 'd1000000-0000-4000-a000-000000000003', 'extracao', 'realizado', 600, 'pix', 1, 'Siso superior direito'),
('2026-02-07', '14:30', 'a1000000-0000-4000-a000-000000000003', 'd1000000-0000-4000-a000-000000000001', 'clareamento', 'realizado', 1200, 'credito', 3, 'Segunda sessão'),
('2026-02-10', '08:00', 'a1000000-0000-4000-a000-000000000006', 'd1000000-0000-4000-a000-000000000003', 'retorno', 'realizado', 150, 'dinheiro', 1, 'Retorno do canal'),
('2026-02-12', '11:30', 'a1000000-0000-4000-a000-000000000004', 'd1000000-0000-4000-a000-000000000001', 'restauracao', 'realizado', 350, 'pix', 1, NULL),
('2026-02-14', '09:00', 'a1000000-0000-4000-a000-000000000002', 'd1000000-0000-4000-a000-000000000002', 'ortodontia', 'realizado', 350, 'credito', 1, 'Manutenção mensal'),
('2026-02-17', '15:00', 'a1000000-0000-4000-a000-000000000007', 'd1000000-0000-4000-a000-000000000001', 'retorno', 'realizado', 200, 'debito', 1, 'Retorno implante'),
('2026-02-19', '10:00', 'a1000000-0000-4000-a000-000000000009', 'd1000000-0000-4000-a000-000000000001', 'limpeza', 'realizado', 250, 'pix', 1, NULL),
('2026-02-21', '14:00', 'a1000000-0000-4000-a000-000000000008', 'd1000000-0000-4000-a000-000000000002', 'protese', 'realizado', 3200, 'credito', 8, 'Prótese parcial removível'),
('2026-02-24', '08:30', 'a1000000-0000-4000-a000-000000000005', 'd1000000-0000-4000-a000-000000000001', 'urgencia', 'cancelado', 300, 'dinheiro', 1, 'Cancelado pelo paciente'),
('2026-03-03', '09:00', 'a1000000-0000-4000-a000-000000000001', 'd1000000-0000-4000-a000-000000000002', 'canal', 'realizado', 1200, 'boleto', 4, NULL),
('2026-03-04', '09:00', 'a1000000-0000-4000-a000-000000000001', 'd1000000-0000-4000-a000-000000000001', 'limpeza', 'confirmado', 250, 'pix', 1, NULL),
('2026-03-04', '10:30', 'a1000000-0000-4000-a000-000000000003', 'd1000000-0000-4000-a000-000000000001', 'avaliacao', 'agendado', 0, 'dinheiro', 1, NULL),
('2026-03-04', '14:00', 'a1000000-0000-4000-a000-000000000004', 'd1000000-0000-4000-a000-000000000002', 'restauracao', 'agendado', 350, 'credito', 3, NULL),
('2026-03-05', '08:30', 'a1000000-0000-4000-a000-000000000002', 'd1000000-0000-4000-a000-000000000001', 'retorno', 'agendado', 100, 'debito', 1, NULL),
('2026-03-05', '11:00', 'a1000000-0000-4000-a000-000000000006', 'd1000000-0000-4000-a000-000000000003', 'clareamento', 'confirmado', 800, 'credito', 6, NULL),
('2026-03-06', '09:00', 'a1000000-0000-4000-a000-000000000007', 'd1000000-0000-4000-a000-000000000001', 'implante', 'confirmado', 4500, 'credito', 12, 'Segunda fase implante'),
('2026-03-06', '14:00', 'a1000000-0000-4000-a000-000000000009', 'd1000000-0000-4000-a000-000000000002', 'limpeza', 'agendado', 250, 'pix', 1, NULL),
('2026-03-07', '10:00', 'a1000000-0000-4000-a000-000000000010', 'd1000000-0000-4000-a000-000000000003', 'retorno', 'agendado', 150, 'dinheiro', 1, 'Retorno extração'),
('2026-03-10', '09:00', 'a1000000-0000-4000-a000-000000000008', 'd1000000-0000-4000-a000-000000000001', 'protese', 'agendado', 3200, 'credito', 8, 'Ajuste prótese'),
('2026-03-10', '11:00', 'a1000000-0000-4000-a000-000000000003', 'd1000000-0000-4000-a000-000000000001', 'clareamento', 'confirmado', 1200, 'credito', 3, 'Terceira sessão'),
('2026-03-12', '14:00', 'a1000000-0000-4000-a000-000000000004', 'd1000000-0000-4000-a000-000000000002', 'ortodontia', 'agendado', 3500, 'credito', 10, NULL);

-- Inserir Insumos
INSERT INTO public.insumo (nome, fabricante, lote, validade, quantidade, pacientes_vinculados) VALUES
('Ácido Hialurônico 20mg/ml', 'Galderma', 'AH2024-089', '2026-03-15', 3, 2),
('Toxina Botulínica 100U', 'Allergan', 'TB2024-156', '2026-03-22', 8, 5),
('Ácido Hialurônico 24mg/ml', 'Galderma', 'AH2024-112', '2026-06-10', 12, 0),
('Bioestimulador PLLA', 'Sinclair', 'BIO2024-034', '2026-09-01', 6, 3),
('Fio PDO Espiculado', 'Croma', 'PDO2024-067', '2026-02-28', 15, 1),
('Enzima Hialuronidase', 'Hylenex', 'HYA2024-023', '2026-04-15', 4, 0),
('Anestésico Articaína 4%', 'DFL', 'AN2024-312', '2026-03-12', 20, 8),
('Resina Composta A2', '3M ESPE', 'RC2024-445', '2027-01-20', 10, 0),
('Cimento Ionômero Vidro', 'GC', 'CIV2024-078', '2026-08-15', 5, 3);

-- Inserir Despesas
INSERT INTO public.despesa (descricao, categoria, fornecedor, valor, forma_pagamento, vencimento, status) VALUES
('Aluguel consultório', 'aluguel', 'Imobiliária Central', 8500, 'boleto', '2026-03-05', 'pendente'),
('Material odontológico', 'material', 'Dental Cremer', 4200, 'boleto', '2026-03-10', 'pendente'),
('Folha de pagamento', 'folha', NULL, 12800, 'boleto', '2026-03-01', 'pago'),
('Energia elétrica', 'utilidades', 'CPFL', 1350, 'debito', '2026-03-15', 'pendente'),
('Internet / Telefone', 'utilidades', 'Vivo', 450, 'debito', '2026-03-12', 'pendente'),
('Software de gestão', 'software', 'Lovable', 299, 'pix', '2026-03-01', 'pago'),
('Manutenção autoclave', 'material', 'Bio-Art', 1800, 'pix', '2026-02-20', 'pago'),
('Marketing digital', 'marketing', 'Agência Pulse', 2500, 'boleto', '2026-03-08', 'pendente'),
('Aluguel consultório - Fev', 'aluguel', 'Imobiliária Central', 8500, 'boleto', '2026-02-05', 'pago'),
('Material odontológico - Fev', 'material', 'Dental Cremer', 3800, 'boleto', '2026-02-10', 'pago'),
('Folha de pagamento - Fev', 'folha', NULL, 12800, 'boleto', '2026-02-01', 'pago'),
('Energia elétrica - Fev', 'utilidades', 'CPFL', 1280, 'debito', '2026-02-15', 'pago'),
('Aluguel consultório - Jan', 'aluguel', 'Imobiliária Central', 8500, 'boleto', '2026-01-05', 'pago'),
('Material odontológico - Jan', 'material', 'Dental Cremer', 5100, 'boleto', '2026-01-10', 'pago'),
('Folha de pagamento - Jan', 'folha', NULL, 12800, 'boleto', '2026-01-01', 'pago');
