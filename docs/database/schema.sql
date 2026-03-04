-- ============================================
-- Damski Odonto — Script de Criação do Banco de Dados
-- SGBD: PostgreSQL 15+
-- Projeto Integrador — Desenvolvimento Web
-- ============================================

-- Tabela: Paciente
CREATE TABLE paciente (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(150)    NOT NULL,
    cpf         VARCHAR(14)     NOT NULL UNIQUE,
    telefone    VARCHAR(20),
    email       VARCHAR(150),
    data_nascimento DATE        NOT NULL,
    status      VARCHAR(10)     NOT NULL DEFAULT 'ativo'
                CHECK (status IN ('ativo', 'inativo')),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Tabela: Dentista
CREATE TABLE dentista (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            VARCHAR(150)    NOT NULL,
    especialidade   VARCHAR(100)    NOT NULL,
    cro             VARCHAR(20)     NOT NULL UNIQUE,
    telefone        VARCHAR(20),
    email           VARCHAR(150),
    status          VARCHAR(10)     NOT NULL DEFAULT 'ativo'
                    CHECK (status IN ('ativo', 'inativo')),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Tabela: Agendamento
CREATE TABLE agendamento (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data            DATE            NOT NULL,
    horario         TIME            NOT NULL,
    paciente_id     UUID            NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    dentista_id     UUID            NOT NULL REFERENCES dentista(id) ON DELETE CASCADE,
    status          VARCHAR(15)     NOT NULL DEFAULT 'agendado'
                    CHECK (status IN ('agendado', 'confirmado', 'realizado', 'cancelado')),
    observacoes     TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Tabela: Procedimento
CREATE TABLE procedimento (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(150)    NOT NULL,
    descricao   TEXT,
    valor       NUMERIC(10,2)   NOT NULL CHECK (valor >= 0),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Tabela: Pagamento
CREATE TABLE pagamento (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id      UUID            NOT NULL REFERENCES agendamento(id) ON DELETE CASCADE,
    valor_pago          NUMERIC(10,2)   NOT NULL CHECK (valor_pago >= 0),
    forma_pagamento     VARCHAR(20)     NOT NULL
                        CHECK (forma_pagamento IN ('pix', 'credito', 'debito', 'dinheiro', 'boleto')),
    data_pagamento      DATE            NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================
-- Índices para performance
-- ============================================
CREATE INDEX idx_agendamento_paciente ON agendamento(paciente_id);
CREATE INDEX idx_agendamento_dentista ON agendamento(dentista_id);
CREATE INDEX idx_agendamento_data     ON agendamento(data);
CREATE INDEX idx_pagamento_agendamento ON pagamento(agendamento_id);
CREATE INDEX idx_paciente_cpf         ON paciente(cpf);
CREATE INDEX idx_dentista_cro         ON dentista(cro);
