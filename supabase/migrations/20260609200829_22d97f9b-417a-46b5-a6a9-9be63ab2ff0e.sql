
GRANT SELECT, INSERT, UPDATE ON public.paciente_documento_token TO authenticated;

CREATE POLICY "pdoc_token_select_tenant" ON public.paciente_documento_token
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.paciente_documento d
    WHERE d.id = documento_id
      AND (d.clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()))
  ));

CREATE POLICY "pdoc_token_insert_tenant" ON public.paciente_documento_token
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.paciente_documento d
    WHERE d.id = documento_id
      AND (d.clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()))
  ));
