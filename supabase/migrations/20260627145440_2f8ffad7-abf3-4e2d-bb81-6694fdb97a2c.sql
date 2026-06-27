ALTER TABLE public.paciente RENAME COLUMN situacao_profissional TO profissao;
ALTER TABLE public.paciente ADD COLUMN IF NOT EXISTS indicacao_tipo text;
ALTER TABLE public.paciente ADD COLUMN IF NOT EXISTS indicacao_nome text;
ALTER TABLE public.paciente ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';