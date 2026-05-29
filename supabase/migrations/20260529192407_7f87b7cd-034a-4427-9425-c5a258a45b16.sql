CREATE TABLE public.procedimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(150) NOT NULL,
  plano varchar(100),
  especialidade varchar(100),
  preco numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.procedimento TO authenticated;
GRANT ALL ON public.procedimento TO service_role;

ALTER TABLE public.procedimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY procedimento_select ON public.procedimento FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'responsavel_tecnico') OR has_role(auth.uid(),'recepcionista'));

CREATE POLICY procedimento_insert ON public.procedimento FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'responsavel_tecnico'));

CREATE POLICY procedimento_update ON public.procedimento FOR UPDATE TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'responsavel_tecnico'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'responsavel_tecnico'));

CREATE POLICY procedimento_delete ON public.procedimento FOR DELETE TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'responsavel_tecnico'));

CREATE TRIGGER update_procedimento_updated_at
BEFORE UPDATE ON public.procedimento
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();