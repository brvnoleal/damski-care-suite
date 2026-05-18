
-- Lock down SECURITY DEFINER functions: only authenticated users can call get_user_role; revoke from anon for all.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Hide all sensitive tables from the public (anon) GraphQL schema. RLS still applies for authenticated users.
REVOKE SELECT ON public.paciente, public.dentista, public.agendamento, public.insumo, public.despesa,
                 public.sessao, public.paciente_foto, public.profiles, public.user_roles
  FROM anon;
