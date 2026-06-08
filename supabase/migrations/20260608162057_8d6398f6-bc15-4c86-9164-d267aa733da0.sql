
-- ============================================
-- Módulo de Anamnese — Fichas digitais com vínculo por CPF
-- ============================================

-- 1) Tabela principal: paciente_anamnese
CREATE TABLE public.paciente_anamnese (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES public.paciente(id) ON DELETE CASCADE,
  versao integer NOT NULL DEFAULT 1,
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  assinatura_paciente text NOT NULL,
  assinatura_ip text,
  assinatura_user_agent text,
  assinatura_em timestamptz NOT NULL DEFAULT now(),
  origem text NOT NULL DEFAULT 'link_publico'
    CHECK (origem IN ('link_publico','link_individual','tablet_recepcao','interno')),
  token_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.paciente_anamnese TO authenticated;
GRANT ALL ON public.paciente_anamnese TO service_role;

ALTER TABLE public.paciente_anamnese ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anamnese_select_tenant" ON public.paciente_anamnese FOR SELECT TO authenticated
  USING (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "anamnese_insert_tenant" ON public.paciente_anamnese FOR INSERT TO authenticated
  WITH CHECK (clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "anamnese_update_tenant" ON public.paciente_anamnese FOR UPDATE TO authenticated
  USING (clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "anamnese_delete_super" ON public.paciente_anamnese FOR DELETE TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE INDEX idx_anamnese_paciente ON public.paciente_anamnese(paciente_id);
CREATE INDEX idx_anamnese_clinica ON public.paciente_anamnese(clinica_id);

CREATE TRIGGER trg_anamnese_updated_at
  BEFORE UPDATE ON public.paciente_anamnese
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_anamnese_set_clinica
  BEFORE INSERT ON public.paciente_anamnese
  FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();

-- 2) Tokens individuais para envio de link específico
CREATE TABLE public.anamnese_token (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES public.paciente(id) ON DELETE SET NULL,
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.anamnese_token TO authenticated;
GRANT ALL ON public.anamnese_token TO service_role;

ALTER TABLE public.anamnese_token ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anamnese_token_select_tenant" ON public.anamnese_token FOR SELECT TO authenticated
  USING (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "anamnese_token_insert_tenant" ON public.anamnese_token FOR INSERT TO authenticated
  WITH CHECK (clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "anamnese_token_update_tenant" ON public.anamnese_token FOR UPDATE TO authenticated
  USING (clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "anamnese_token_delete_tenant" ON public.anamnese_token FOR DELETE TO authenticated
  USING (clinica_id = get_user_clinica_id(auth.uid()));

CREATE INDEX idx_anamnese_token_token ON public.anamnese_token(token);
CREATE INDEX idx_anamnese_token_clinica ON public.anamnese_token(clinica_id);

CREATE TRIGGER trg_anamnese_token_set_clinica
  BEFORE INSERT ON public.anamnese_token
  FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();

-- 3) Tentativas (rate limit do lookup/validação por CPF)
CREATE TABLE public.anamnese_tentativa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  cpf_hash text NOT NULL,
  tentativas integer NOT NULL DEFAULT 0,
  bloqueado_ate timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clinica_id, cpf_hash)
);

-- Acesso apenas via service_role (edge functions)
GRANT ALL ON public.anamnese_tentativa TO service_role;

ALTER TABLE public.anamnese_tentativa ENABLE ROW LEVEL SECURITY;
-- Sem policies para anon/authenticated: tabela é privada às edge functions.

CREATE INDEX idx_anamnese_tentativa_lookup ON public.anamnese_tentativa(clinica_id, cpf_hash);

CREATE TRIGGER trg_anamnese_tentativa_updated_at
  BEFORE UPDATE ON public.anamnese_tentativa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
