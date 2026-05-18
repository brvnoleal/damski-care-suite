
-- Replace blanket FOR ALL policies with split SELECT/INSERT/UPDATE (all 3 roles) and DELETE (admin + RT only)

DO $$
DECLARE
  t text;
  tables text[] := ARRAY['paciente','dentista','agendamento','insumo','despesa','sessao','paciente_foto'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Role-gated access to %I" ON public.%I', t, t);

    EXECUTE format($f$
      CREATE POLICY "%1$s_select" ON public.%1$I FOR SELECT TO authenticated
        USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'responsavel_tecnico'::app_role) OR has_role(auth.uid(),'recepcionista'::app_role));
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "%1$s_insert" ON public.%1$I FOR INSERT TO authenticated
        WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'responsavel_tecnico'::app_role) OR has_role(auth.uid(),'recepcionista'::app_role));
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "%1$s_update" ON public.%1$I FOR UPDATE TO authenticated
        USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'responsavel_tecnico'::app_role) OR has_role(auth.uid(),'recepcionista'::app_role))
        WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'responsavel_tecnico'::app_role) OR has_role(auth.uid(),'recepcionista'::app_role));
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "%1$s_delete" ON public.%1$I FOR DELETE TO authenticated
        USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'responsavel_tecnico'::app_role));
    $f$, t);
  END LOOP;
END $$;
