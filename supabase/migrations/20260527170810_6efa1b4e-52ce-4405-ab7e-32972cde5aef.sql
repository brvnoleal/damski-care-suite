ALTER TABLE public.paciente
  ADD COLUMN IF NOT EXISTS rg character varying,
  ADD COLUMN IF NOT EXISTS emissor character varying,
  ADD COLUMN IF NOT EXISTS sexo character varying,
  ADD COLUMN IF NOT EXISTS estado_civil character varying,
  ADD COLUMN IF NOT EXISTS situacao_profissional character varying,
  ADD COLUMN IF NOT EXISTS plano character varying,
  ADD COLUMN IF NOT EXISTS numero_plano character varying,
  ADD COLUMN IF NOT EXISTS numero_prontuario character varying,
  ADD COLUMN IF NOT EXISTS avatar_url text;