-- =========================
-- Table: sessao (clinical session log)
-- =========================
CREATE TABLE public.sessao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL,
  dentista_id uuid,
  agendamento_id uuid,
  data date NOT NULL,
  procedimento varchar NOT NULL,
  tecnica text,
  substancia_lote text,
  assinado boolean NOT NULL DEFAULT false,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessao_paciente ON public.sessao(paciente_id);
CREATE INDEX idx_sessao_data ON public.sessao(data DESC);

ALTER TABLE public.sessao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role-gated access to sessao"
  ON public.sessao
  FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'responsavel_tecnico'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'responsavel_tecnico'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
  );

-- =========================
-- Table: paciente_foto (clinical photos)
-- =========================
CREATE TYPE public.foto_categoria AS ENUM ('antes', 'depois', 'durante', 'outro');

CREATE TABLE public.paciente_foto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL,
  storage_path text NOT NULL,
  nome_arquivo text NOT NULL,
  categoria public.foto_categoria NOT NULL DEFAULT 'outro',
  descricao text,
  data date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_paciente_foto_paciente ON public.paciente_foto(paciente_id);

ALTER TABLE public.paciente_foto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role-gated access to paciente_foto"
  ON public.paciente_foto
  FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'responsavel_tecnico'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'responsavel_tecnico'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
  );

-- =========================
-- Trigger: update updated_at on sessao
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_sessao_updated_at
  BEFORE UPDATE ON public.sessao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Storage bucket: paciente-fotos (private)
-- =========================
INSERT INTO storage.buckets (id, name, public)
VALUES ('paciente-fotos', 'paciente-fotos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Role-gated read paciente-fotos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'paciente-fotos'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'responsavel_tecnico'::app_role)
      OR has_role(auth.uid(), 'recepcionista'::app_role)
    )
  );

CREATE POLICY "Role-gated insert paciente-fotos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'paciente-fotos'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'responsavel_tecnico'::app_role)
      OR has_role(auth.uid(), 'recepcionista'::app_role)
    )
  );

CREATE POLICY "Role-gated update paciente-fotos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'paciente-fotos'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'responsavel_tecnico'::app_role)
      OR has_role(auth.uid(), 'recepcionista'::app_role)
    )
  );

CREATE POLICY "Role-gated delete paciente-fotos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'paciente-fotos'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'responsavel_tecnico'::app_role)
      OR has_role(auth.uid(), 'recepcionista'::app_role)
    )
  );