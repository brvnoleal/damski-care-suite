
-- Tabela: Paciente
CREATE TABLE public.paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(150),
    instagram VARCHAR(100),
    data_nascimento DATE NOT NULL,
    cep VARCHAR(10),
    estado VARCHAR(2),
    cidade VARCHAR(100),
    bairro VARCHAR(100),
    rua VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    ponto_referencia VARCHAR(200),
    status VARCHAR(10) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: Dentista
CREATE TABLE public.dentista (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    cro VARCHAR(20) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(150),
    instagram VARCHAR(100),
    cep VARCHAR(10),
    estado VARCHAR(2),
    cidade VARCHAR(100),
    bairro VARCHAR(100),
    rua VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    ponto_referencia VARCHAR(200),
    status VARCHAR(10) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: Agendamento
CREATE TABLE public.agendamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data DATE NOT NULL,
    horario TIME NOT NULL,
    paciente_id UUID NOT NULL REFERENCES public.paciente(id) ON DELETE CASCADE,
    dentista_id UUID NOT NULL REFERENCES public.dentista(id) ON DELETE CASCADE,
    procedimento VARCHAR(30) NOT NULL DEFAULT 'avaliacao',
    status VARCHAR(15) NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'realizado', 'cancelado')),
    valor NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (valor >= 0),
    forma_pagamento VARCHAR(20) NOT NULL DEFAULT 'dinheiro' CHECK (forma_pagamento IN ('pix', 'credito', 'debito', 'dinheiro', 'boleto')),
    parcelas INTEGER NOT NULL DEFAULT 1,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: Insumo
CREATE TABLE public.insumo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    fabricante VARCHAR(150) NOT NULL,
    lote VARCHAR(50) NOT NULL,
    validade DATE NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    pacientes_vinculados INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: Despesa
CREATE TABLE public.despesa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao VARCHAR(200) NOT NULL,
    categoria VARCHAR(50),
    fornecedor VARCHAR(150),
    valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
    forma_pagamento VARCHAR(20),
    vencimento DATE NOT NULL,
    observacoes TEXT,
    status VARCHAR(15) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_agendamento_paciente ON public.agendamento(paciente_id);
CREATE INDEX idx_agendamento_dentista ON public.agendamento(dentista_id);
CREATE INDEX idx_agendamento_data ON public.agendamento(data);
CREATE INDEX idx_paciente_cpf ON public.paciente(cpf);
CREATE INDEX idx_dentista_cro ON public.dentista(cro);
CREATE INDEX idx_insumo_validade ON public.insumo(validade);
CREATE INDEX idx_despesa_vencimento ON public.despesa(vencimento);

-- RLS - desabilitar temporariamente para acesso público (sem auth implementado)
ALTER TABLE public.paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dentista ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insumo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesa ENABLE ROW LEVEL SECURITY;

-- Policies de acesso público (temporárias - até implementar autenticação)
CREATE POLICY "Allow all access to paciente" ON public.paciente FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to dentista" ON public.dentista FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to agendamento" ON public.agendamento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to insumo" ON public.insumo FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to despesa" ON public.despesa FOR ALL USING (true) WITH CHECK (true);
