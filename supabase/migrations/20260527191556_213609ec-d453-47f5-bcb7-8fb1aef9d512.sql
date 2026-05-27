REVOKE ALL ON public.evolucao FROM anon;
REVOKE ALL ON public.paciente_debito FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evolucao TO authenticated;
GRANT ALL ON public.evolucao TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paciente_debito TO authenticated;
GRANT ALL ON public.paciente_debito TO service_role;