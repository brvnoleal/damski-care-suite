
CREATE TABLE public.odontograma_procedimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL,
  dente smallint NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente','em_andamento','concluido','removido')),
  procedimento varchar(50) NOT NULL,
  valor numeric(10,2) NOT NULL DEFAULT 0,
  dentista_id uuid NULL,
  observacoes text NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.odontograma_procedimento TO authenticated;
GRANT ALL ON public.odontograma_procedimento TO service_role;

ALTER TABLE public.odontograma_procedimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY odontograma_select ON public.odontograma_procedimento FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'responsavel_tecnico'::app_role) OR has_role(auth.uid(),'recepcionista'::app_role));

CREATE POLICY odontograma_insert ON public.odontograma_procedimento FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'responsavel_tecnico'::app_role) OR has_role(auth.uid(),'recepcionista'::app_role));

CREATE POLICY odontograma_update ON public.odontograma_procedimento FOR UPDATE TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'responsavel_tecnico'::app_role) OR has_role(auth.uid(),'recepcionista'::app_role))
WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'responsavel_tecnico'::app_role) OR has_role(auth.uid(),'recepcionista'::app_role));

CREATE POLICY odontograma_delete ON public.odontograma_procedimento FOR DELETE TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'responsavel_tecnico'::app_role));

CREATE INDEX idx_odontograma_paciente_dente ON public.odontograma_procedimento(paciente_id, dente);

CREATE TRIGGER trg_odontograma_updated_at
BEFORE UPDATE ON public.odontograma_procedimento
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
