
REVOKE EXECUTE ON FUNCTION public.get_user_clinica_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_clinica_role(uuid, uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.anonimizar_paciente(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.exportar_dados_paciente(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_user_clinica_id(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_clinica_role(uuid, uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.anonimizar_paciente(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.exportar_dados_paciente(uuid) TO authenticated, service_role;
