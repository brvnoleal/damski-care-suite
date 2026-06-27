
-- 1) Add audit trigger to paciente_arquivo so deletions/inserts/updates are logged
DROP TRIGGER IF EXISTS audit_paciente_arquivo ON public.paciente_arquivo;
CREATE TRIGGER audit_paciente_arquivo
AFTER INSERT OR UPDATE OR DELETE ON public.paciente_arquivo
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- 2) Extend exportar_dados_paciente to also include attached files (arquivos)
CREATE OR REPLACE FUNCTION public.exportar_dados_paciente(_paciente_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    'consentimentos', COALESCE((SELECT jsonb_agg(to_jsonb(c)) FROM public.paciente_consentimento c WHERE paciente_id = _paciente_id), '[]'::jsonb),
    'arquivos', COALESCE((SELECT jsonb_agg(to_jsonb(ar)) FROM public.paciente_arquivo ar WHERE paciente_id = _paciente_id), '[]'::jsonb),
    'documentos', COALESCE((SELECT jsonb_agg(to_jsonb(pd)) FROM public.paciente_documento pd WHERE paciente_id = _paciente_id), '[]'::jsonb),
    'anamneses', COALESCE((SELECT jsonb_agg(to_jsonb(pa)) FROM public.paciente_anamnese pa WHERE paciente_id = _paciente_id), '[]'::jsonb)
  ) INTO v_result;

  INSERT INTO public.audit_log (clinica_id, user_id, action, entity, entity_id, diff)
  VALUES (v_clinica, auth.uid(), 'EXPORT', 'paciente', _paciente_id,
          jsonb_build_object('motivo','LGPD - portabilidade / fiscalização'));

  RETURN v_result;
END;
$function$;
