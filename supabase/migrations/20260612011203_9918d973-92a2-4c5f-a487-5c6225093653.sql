DROP POLICY IF EXISTS clinica_membro_update ON public.clinica_membro;
CREATE POLICY clinica_membro_update ON public.clinica_membro
  FOR UPDATE
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR (
      has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
      AND (role <> ALL (ARRAY['admin'::app_role, 'responsavel_tecnico'::app_role]))
      AND (user_id <> auth.uid())
    )
  )
  WITH CHECK (
    is_super_admin(auth.uid()) OR (
      has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
      AND (role <> ALL (ARRAY['admin'::app_role, 'responsavel_tecnico'::app_role]))
      AND (user_id <> auth.uid())
    )
  );