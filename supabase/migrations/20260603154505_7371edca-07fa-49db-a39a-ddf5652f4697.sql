
-- 1) Storage policies scoped by clinic for paciente-fotos
DROP POLICY IF EXISTS "Role-gated read paciente-fotos" ON storage.objects;
DROP POLICY IF EXISTS "Role-gated insert paciente-fotos" ON storage.objects;
DROP POLICY IF EXISTS "Role-gated update paciente-fotos" ON storage.objects;
DROP POLICY IF EXISTS "Role-gated delete paciente-fotos" ON storage.objects;

CREATE POLICY "paciente-fotos clinic-scoped select"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'paciente-fotos'
  AND EXISTS (
    SELECT 1 FROM public.paciente p
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
      AND (p.clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()))
  )
);

CREATE POLICY "paciente-fotos clinic-scoped insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'paciente-fotos'
  AND EXISTS (
    SELECT 1 FROM public.paciente p
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
      AND p.clinica_id = public.get_user_clinica_id(auth.uid())
  )
);

CREATE POLICY "paciente-fotos clinic-scoped update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'paciente-fotos'
  AND EXISTS (
    SELECT 1 FROM public.paciente p
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
      AND p.clinica_id = public.get_user_clinica_id(auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'paciente-fotos'
  AND EXISTS (
    SELECT 1 FROM public.paciente p
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
      AND p.clinica_id = public.get_user_clinica_id(auth.uid())
  )
);

CREATE POLICY "paciente-fotos clinic-scoped delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'paciente-fotos'
  AND EXISTS (
    SELECT 1 FROM public.paciente p
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
      AND p.clinica_id = public.get_user_clinica_id(auth.uid())
      AND (public.has_clinica_role(auth.uid(), p.clinica_id, 'admin'::app_role)
           OR public.has_clinica_role(auth.uid(), p.clinica_id, 'responsavel_tecnico'::app_role))
  )
);

-- 2) Prevent privilege escalation in clinica_membro
DROP POLICY IF EXISTS clinica_membro_manage ON public.clinica_membro;

-- Only super_admins can assign elevated roles (admin / responsavel_tecnico)
CREATE POLICY clinica_membro_insert
ON public.clinica_membro FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (
    public.has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
    AND role NOT IN ('admin'::app_role, 'responsavel_tecnico'::app_role)
  )
);

CREATE POLICY clinica_membro_update
ON public.clinica_membro FOR UPDATE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR public.has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
)
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (
    public.has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
    AND role NOT IN ('admin'::app_role, 'responsavel_tecnico'::app_role)
  )
);

CREATE POLICY clinica_membro_delete
ON public.clinica_membro FOR DELETE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (
    public.has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role)
    AND role NOT IN ('admin'::app_role, 'responsavel_tecnico'::app_role)
    AND user_id <> auth.uid()
  )
);

-- 3) Revoke EXECUTE from anon/public on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.get_user_clinica_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_clinica_role(uuid, uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.anonimizar_paciente(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.exportar_dados_paciente(uuid) FROM PUBLIC, anon;
