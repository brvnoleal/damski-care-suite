
CREATE TABLE public.comissao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  dentista_id UUID NOT NULL REFERENCES public.dentista(id) ON DELETE CASCADE,
  procedimento_id UUID NOT NULL REFERENCES public.procedimento(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'percentual' CHECK (tipo IN ('percentual','fixo')),
  valor NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (valor >= 0),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinica_id, dentista_id, procedimento_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comissao TO authenticated;
GRANT ALL ON public.comissao TO service_role;

ALTER TABLE public.comissao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comissao_select_clinica" ON public.comissao
  FOR SELECT TO authenticated
  USING (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));

CREATE POLICY "comissao_insert_admin_rt" ON public.comissao
  FOR INSERT TO authenticated
  WITH CHECK (
    is_super_admin(auth.uid())
    OR (clinica_id = get_user_clinica_id(auth.uid())
        AND (has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
             OR has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico'::app_role)))
  );

CREATE POLICY "comissao_update_admin_rt" ON public.comissao
  FOR UPDATE TO authenticated
  USING (
    is_super_admin(auth.uid())
    OR (clinica_id = get_user_clinica_id(auth.uid())
        AND (has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
             OR has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico'::app_role)))
  );

CREATE POLICY "comissao_delete_admin_rt" ON public.comissao
  FOR DELETE TO authenticated
  USING (
    is_super_admin(auth.uid())
    OR (clinica_id = get_user_clinica_id(auth.uid())
        AND (has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
             OR has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico'::app_role)))
  );

CREATE TRIGGER set_clinica_id_comissao
  BEFORE INSERT ON public.comissao
  FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();

CREATE TRIGGER update_updated_at_comissao
  BEFORE UPDATE ON public.comissao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_comissao
  AFTER INSERT OR UPDATE OR DELETE ON public.comissao
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE INDEX idx_comissao_dentista ON public.comissao(dentista_id);
CREATE INDEX idx_comissao_procedimento ON public.comissao(procedimento_id);
CREATE INDEX idx_comissao_clinica ON public.comissao(clinica_id);
