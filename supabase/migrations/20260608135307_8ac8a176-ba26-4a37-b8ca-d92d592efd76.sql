
-- Tighten user_roles: only super_admin can insert/update/delete (table holds only super_admin role)
DROP POLICY IF EXISTS user_roles_insert ON public.user_roles;
DROP POLICY IF EXISTS user_roles_update ON public.user_roles;
DROP POLICY IF EXISTS user_roles_delete ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY user_roles_insert_super_only ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY user_roles_update_super_only ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY user_roles_delete_super_only ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Add explicit DELETE policy for paciente_consentimento
DROP POLICY IF EXISTS paciente_consentimento_delete ON public.paciente_consentimento;

CREATE POLICY paciente_consentimento_delete ON public.paciente_consentimento
  FOR DELETE TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR (
      EXISTS (
        SELECT 1 FROM public.paciente p
        WHERE p.id = paciente_consentimento.paciente_id
          AND p.clinica_id = public.get_user_clinica_id(auth.uid())
      )
      AND (
        public.has_clinica_role(auth.uid(), public.get_user_clinica_id(auth.uid()), 'admin'::app_role)
        OR public.has_clinica_role(auth.uid(), public.get_user_clinica_id(auth.uid()), 'responsavel_tecnico'::app_role)
      )
    )
  );
