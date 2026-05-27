ALTER TABLE public.insumo
  ADD COLUMN IF NOT EXISTS categoria character varying,
  ADD COLUMN IF NOT EXISTS unidade_medida character varying,
  ADD COLUMN IF NOT EXISTS sem_validade boolean NOT NULL DEFAULT false;

ALTER TABLE public.insumo ALTER COLUMN validade DROP NOT NULL;