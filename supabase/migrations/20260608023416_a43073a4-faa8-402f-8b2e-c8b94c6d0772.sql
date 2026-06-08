
-- 1) user_roles: prevent admin self-escalation to super_admin
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY user_roles_select ON public.user_roles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()) OR user_id = auth.uid());

CREATE POLICY user_roles_insert ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    is_super_admin(auth.uid())
    OR (has_role(auth.uid(), 'admin'::app_role) AND role <> 'super_admin'::app_role)
  );

CREATE POLICY user_roles_update ON public.user_roles
  FOR UPDATE TO authenticated
  USING (
    is_super_admin(auth.uid())
    OR (has_role(auth.uid(), 'admin'::app_role) AND role <> 'super_admin'::app_role)
  )
  WITH CHECK (
    is_super_admin(auth.uid())
    OR (has_role(auth.uid(), 'admin'::app_role) AND role <> 'super_admin'::app_role)
  );

CREATE POLICY user_roles_delete ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    is_super_admin(auth.uid())
    OR (has_role(auth.uid(), 'admin'::app_role) AND role <> 'super_admin'::app_role AND user_id <> auth.uid())
  );

-- 2) clinica_membro: tighten UPDATE USING to prevent admins from editing protected-role rows
DROP POLICY IF EXISTS clinica_membro_update ON public.clinica_membro;

CREATE POLICY clinica_membro_update ON public.clinica_membro
  FOR UPDATE TO authenticated
  USING (
    is_super_admin(auth.uid())
    OR (
      has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
      AND role <> ALL (ARRAY['admin'::app_role, 'responsavel_tecnico'::app_role])
      AND user_id <> auth.uid()
    )
  )
  WITH CHECK (
    is_super_admin(auth.uid())
    OR (
      has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
      AND role <> ALL (ARRAY['admin'::app_role, 'responsavel_tecnico'::app_role])
      AND user_id <> auth.uid()
    )
  );

-- 3) Revoke EXECUTE from anon/PUBLIC on trigger functions
REVOKE EXECUTE ON FUNCTION public.set_clinica_id_from_user() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.audit_trigger() FROM PUBLIC, anon;
