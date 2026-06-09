
-- ============== documento_modelo ==============
CREATE TABLE public.documento_modelo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('contrato','tcle','receituario','atestado','personalizado')),
  nome text NOT NULL,
  conteudo text NOT NULL,
  requer_assinatura_paciente boolean NOT NULL DEFAULT true,
  requer_assinatura_responsavel boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documento_modelo TO authenticated;
GRANT ALL ON public.documento_modelo TO service_role;

ALTER TABLE public.documento_modelo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modelo_select_tenant" ON public.documento_modelo
  FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "modelo_insert_tenant" ON public.documento_modelo
  FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "modelo_update_tenant" ON public.documento_modelo
  FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "modelo_delete_tenant" ON public.documento_modelo
  FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE TRIGGER trg_documento_modelo_set_clinica
  BEFORE INSERT ON public.documento_modelo
  FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();

CREATE TRIGGER trg_documento_modelo_updated
  BEFORE UPDATE ON public.documento_modelo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== paciente_documento ==============
CREATE TABLE public.paciente_documento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES public.paciente(id) ON DELETE CASCADE,
  modelo_id uuid REFERENCES public.documento_modelo(id) ON DELETE SET NULL,
  tipo text NOT NULL CHECK (tipo IN ('contrato','tcle','receituario','atestado','personalizado')),
  titulo text NOT NULL,
  conteudo_renderizado text NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','assinado','expirado','cancelado')),
  assinatura_paciente_dataurl text,
  assinatura_responsavel_dataurl text,
  assinado_em timestamptz,
  assinado_ip text,
  assinado_user_agent text,
  expira_em timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_paciente_documento_paciente ON public.paciente_documento(paciente_id);
CREATE INDEX idx_paciente_documento_clinica ON public.paciente_documento(clinica_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.paciente_documento TO authenticated;
GRANT ALL ON public.paciente_documento TO service_role;

ALTER TABLE public.paciente_documento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pdoc_select_tenant" ON public.paciente_documento
  FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "pdoc_insert_tenant" ON public.paciente_documento
  FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "pdoc_update_tenant" ON public.paciente_documento
  FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "pdoc_delete_tenant" ON public.paciente_documento
  FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE TRIGGER trg_paciente_documento_set_clinica
  BEFORE INSERT ON public.paciente_documento
  FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();

CREATE TRIGGER trg_paciente_documento_updated
  BEFORE UPDATE ON public.paciente_documento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== paciente_documento_token ==============
CREATE TABLE public.paciente_documento_token (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id uuid NOT NULL REFERENCES public.paciente_documento(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pdoc_token_documento ON public.paciente_documento_token(documento_id);

-- Apenas service_role lê/escreve (resolução via edge function).
GRANT ALL ON public.paciente_documento_token TO service_role;

ALTER TABLE public.paciente_documento_token ENABLE ROW LEVEL SECURITY;
-- Sem políticas para authenticated/anon → bloqueado para o cliente.
