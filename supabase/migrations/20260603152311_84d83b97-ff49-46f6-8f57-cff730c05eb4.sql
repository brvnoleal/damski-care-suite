
-- ============ AUDIT LOG ============
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid,
  user_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_select ON public.audit_log
  FOR SELECT TO authenticated
  USING (
    is_super_admin(auth.uid())
    OR (clinica_id = get_user_clinica_id(auth.uid())
        AND has_clinica_role(auth.uid(), clinica_id, 'admin'::app_role))
  );

-- INSERT only via SECURITY DEFINER triggers; deny direct user inserts
CREATE POLICY audit_log_no_direct_insert ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- No update/delete policies => denied. Also revoke at table level:
REVOKE UPDATE, DELETE ON public.audit_log FROM authenticated, anon, service_role;

-- Generic trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinica uuid;
  v_entity_id uuid;
  v_diff jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_clinica := (to_jsonb(OLD)->>'clinica_id')::uuid;
    v_entity_id := (to_jsonb(OLD)->>'id')::uuid;
    v_diff := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'UPDATE' THEN
    v_clinica := (to_jsonb(NEW)->>'clinica_id')::uuid;
    v_entity_id := (to_jsonb(NEW)->>'id')::uuid;
    v_diff := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSE
    v_clinica := (to_jsonb(NEW)->>'clinica_id')::uuid;
    v_entity_id := (to_jsonb(NEW)->>'id')::uuid;
    v_diff := jsonb_build_object('new', to_jsonb(NEW));
  END IF;

  INSERT INTO public.audit_log (clinica_id, user_id, action, entity, entity_id, diff)
  VALUES (v_clinica, auth.uid(), TG_OP, TG_TABLE_NAME, v_entity_id, v_diff);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach triggers to sensitive tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'paciente','sessao','evolucao','paciente_debito','despesa',
    'insumo','agendamento','clinica_membro','paciente_foto',
    'odontograma_procedimento','dentista','procedimento','clinica'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON public.%I;', t, t);
    EXECUTE format('CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();', t, t);
  END LOOP;
END $$;

-- ============ LGPD CONSENT ============
CREATE TABLE public.paciente_consentimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL,
  paciente_id uuid NOT NULL,
  finalidade text NOT NULL,
  versao text NOT NULL DEFAULT '1.0',
  conteudo text NOT NULL,
  aceito boolean NOT NULL DEFAULT true,
  aceito_em timestamptz NOT NULL DEFAULT now(),
  revogado_em timestamptz,
  ip text,
  user_agent text,
  registrado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.paciente_consentimento TO authenticated;
GRANT ALL ON public.paciente_consentimento TO service_role;

ALTER TABLE public.paciente_consentimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY consent_select ON public.paciente_consentimento
  FOR SELECT TO authenticated
  USING (clinica_id = get_user_clinica_id(auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY consent_insert ON public.paciente_consentimento
  FOR INSERT TO authenticated
  WITH CHECK (clinica_id = get_user_clinica_id(auth.uid()));

CREATE POLICY consent_update ON public.paciente_consentimento
  FOR UPDATE TO authenticated
  USING (clinica_id = get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = get_user_clinica_id(auth.uid()));

CREATE TRIGGER set_clinica_consent BEFORE INSERT ON public.paciente_consentimento
  FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();

CREATE TRIGGER audit_paciente_consentimento AFTER INSERT OR UPDATE OR DELETE
  ON public.paciente_consentimento FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- ============ LGPD: anonimização e exportação ============
CREATE OR REPLACE FUNCTION public.anonimizar_paciente(_paciente_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinica uuid;
BEGIN
  SELECT clinica_id INTO v_clinica FROM public.paciente WHERE id = _paciente_id;
  IF v_clinica IS NULL THEN
    RAISE EXCEPTION 'Paciente não encontrado';
  END IF;
  IF NOT (is_super_admin(auth.uid())
          OR (v_clinica = get_user_clinica_id(auth.uid())
              AND (has_clinica_role(auth.uid(), v_clinica, 'admin'::app_role)
                   OR has_clinica_role(auth.uid(), v_clinica, 'responsavel_tecnico'::app_role)))) THEN
    RAISE EXCEPTION 'Sem permissão para anonimizar paciente';
  END IF;

  UPDATE public.paciente SET
    nome = 'ANONIMIZADO',
    cpf = '000.000.000-00',
    rg = NULL, emissor = NULL,
    telefone = NULL, email = NULL, instagram = NULL,
    cep = NULL, rua = NULL, numero = NULL, complemento = NULL,
    bairro = NULL, cidade = NULL, estado = NULL, ponto_referencia = NULL,
    avatar_url = NULL,
    status = 'anonimizado',
    updated_at = now()
  WHERE id = _paciente_id;

  INSERT INTO public.audit_log (clinica_id, user_id, action, entity, entity_id, diff)
  VALUES (v_clinica, auth.uid(), 'ANONIMIZE', 'paciente', _paciente_id,
          jsonb_build_object('motivo','LGPD - direito ao esquecimento'));
END;
$$;

CREATE OR REPLACE FUNCTION public.exportar_dados_paciente(_paciente_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinica uuid;
  v_result jsonb;
BEGIN
  SELECT clinica_id INTO v_clinica FROM public.paciente WHERE id = _paciente_id;
  IF v_clinica IS NULL THEN
    RAISE EXCEPTION 'Paciente não encontrado';
  END IF;
  IF NOT (is_super_admin(auth.uid()) OR v_clinica = get_user_clinica_id(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  SELECT jsonb_build_object(
    'exportado_em', now(),
    'paciente', (SELECT to_jsonb(p) FROM public.paciente p WHERE id = _paciente_id),
    'sessoes', COALESCE((SELECT jsonb_agg(to_jsonb(s)) FROM public.sessao s WHERE paciente_id = _paciente_id), '[]'::jsonb),
    'evolucoes', COALESCE((SELECT jsonb_agg(to_jsonb(e)) FROM public.evolucao e WHERE paciente_id = _paciente_id), '[]'::jsonb),
    'agendamentos', COALESCE((SELECT jsonb_agg(to_jsonb(a)) FROM public.agendamento a WHERE paciente_id = _paciente_id), '[]'::jsonb),
    'debitos', COALESCE((SELECT jsonb_agg(to_jsonb(d)) FROM public.paciente_debito d WHERE paciente_id = _paciente_id), '[]'::jsonb),
    'fotos', COALESCE((SELECT jsonb_agg(to_jsonb(f)) FROM public.paciente_foto f WHERE paciente_id = _paciente_id), '[]'::jsonb),
    'odontograma', COALESCE((SELECT jsonb_agg(to_jsonb(o)) FROM public.odontograma_procedimento o WHERE paciente_id = _paciente_id), '[]'::jsonb),
    'consentimentos', COALESCE((SELECT jsonb_agg(to_jsonb(c)) FROM public.paciente_consentimento c WHERE paciente_id = _paciente_id), '[]'::jsonb)
  ) INTO v_result;

  INSERT INTO public.audit_log (clinica_id, user_id, action, entity, entity_id, diff)
  VALUES (v_clinica, auth.uid(), 'EXPORT', 'paciente', _paciente_id,
          jsonb_build_object('motivo','LGPD - portabilidade'));

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.anonimizar_paciente(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exportar_dados_paciente(uuid) TO authenticated;
