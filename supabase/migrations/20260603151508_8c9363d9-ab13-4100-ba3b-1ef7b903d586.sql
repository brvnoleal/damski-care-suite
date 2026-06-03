
-- Tabela clinica
CREATE TABLE public.clinica (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar NOT NULL,
  cnpj varchar,
  email varchar,
  telefone varchar,
  status varchar NOT NULL DEFAULT 'ativa',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinica TO authenticated;
GRANT ALL ON public.clinica TO service_role;
ALTER TABLE public.clinica ENABLE ROW LEVEL SECURITY;

-- Tabela clinica_membro
CREATE TABLE public.clinica_membro (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  clinica_id uuid NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
CREATE INDEX idx_clinica_membro_clinica ON public.clinica_membro(clinica_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinica_membro TO authenticated;
GRANT ALL ON public.clinica_membro TO service_role;
ALTER TABLE public.clinica_membro ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_user_clinica_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT clinica_id FROM public.clinica_membro WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_clinica_role(_user_id uuid, _clinica_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.clinica_membro WHERE user_id = _user_id AND clinica_id = _clinica_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.set_clinica_id_from_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.clinica_id IS NULL THEN
    NEW.clinica_id := public.get_user_clinica_id(auth.uid());
  END IF;
  IF NEW.clinica_id IS NULL THEN
    RAISE EXCEPTION 'clinica_id não pôde ser determinada (usuário sem clínica vinculada)';
  END IF;
  RETURN NEW;
END;
$$;

-- Policies clinica
CREATE POLICY clinica_select ON public.clinica FOR SELECT TO authenticated
  USING (id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY clinica_update ON public.clinica FOR UPDATE TO authenticated
  USING ((id = public.get_user_clinica_id(auth.uid()) AND public.has_clinica_role(auth.uid(), id, 'admin'))
         OR public.is_super_admin(auth.uid()))
  WITH CHECK ((id = public.get_user_clinica_id(auth.uid()) AND public.has_clinica_role(auth.uid(), id, 'admin'))
              OR public.is_super_admin(auth.uid()));
CREATE POLICY clinica_insert ON public.clinica FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY clinica_delete ON public.clinica FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Policies clinica_membro
CREATE POLICY clinica_membro_select ON public.clinica_membro FOR SELECT TO authenticated
  USING (user_id = auth.uid()
         OR clinica_id = public.get_user_clinica_id(auth.uid())
         OR public.is_super_admin(auth.uid()));
CREATE POLICY clinica_membro_manage ON public.clinica_membro FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_clinica_role(auth.uid(), clinica_id, 'admin'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_clinica_role(auth.uid(), clinica_id, 'admin'));

-- Backfill + super_admin
DO $$
DECLARE
  v_clinica_id uuid;
BEGIN
  INSERT INTO public.clinica (nome, status) VALUES ('Clínica Padrão', 'ativa') RETURNING id INTO v_clinica_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES ('1b84c643-f109-490b-be18-aa4518dbe7e1', 'super_admin')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.clinica_membro (user_id, clinica_id, role)
  SELECT ur.user_id, v_clinica_id, ur.role FROM public.user_roles ur
  WHERE ur.role <> 'super_admin'
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.clinica_membro (user_id, clinica_id, role)
  VALUES ('1b84c643-f109-490b-be18-aa4518dbe7e1', v_clinica_id, 'admin')
  ON CONFLICT (user_id) DO NOTHING;

  -- Add clinica_id columns + backfill + NOT NULL + index for each table
  ALTER TABLE public.paciente ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.paciente SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.paciente ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_paciente_clinica ON public.paciente(clinica_id);

  ALTER TABLE public.agendamento ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.agendamento SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.agendamento ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_agendamento_clinica ON public.agendamento(clinica_id);

  ALTER TABLE public.dentista ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.dentista SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.dentista ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_dentista_clinica ON public.dentista(clinica_id);

  ALTER TABLE public.despesa ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.despesa SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.despesa ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_despesa_clinica ON public.despesa(clinica_id);

  ALTER TABLE public.evolucao ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.evolucao SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.evolucao ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_evolucao_clinica ON public.evolucao(clinica_id);

  ALTER TABLE public.insumo ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.insumo SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.insumo ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_insumo_clinica ON public.insumo(clinica_id);

  ALTER TABLE public.odontograma_procedimento ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.odontograma_procedimento SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.odontograma_procedimento ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_odontograma_clinica ON public.odontograma_procedimento(clinica_id);

  ALTER TABLE public.paciente_debito ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.paciente_debito SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.paciente_debito ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_paciente_debito_clinica ON public.paciente_debito(clinica_id);

  ALTER TABLE public.paciente_foto ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.paciente_foto SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.paciente_foto ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_paciente_foto_clinica ON public.paciente_foto(clinica_id);

  ALTER TABLE public.procedimento ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.procedimento SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.procedimento ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_procedimento_clinica ON public.procedimento(clinica_id);

  ALTER TABLE public.sessao ADD COLUMN clinica_id uuid REFERENCES public.clinica(id);
  EXECUTE format('UPDATE public.sessao SET clinica_id = %L WHERE clinica_id IS NULL', v_clinica_id);
  ALTER TABLE public.sessao ALTER COLUMN clinica_id SET NOT NULL;
  CREATE INDEX idx_sessao_clinica ON public.sessao(clinica_id);
END $$;

-- Triggers auto-fill
CREATE TRIGGER trg_paciente_set_clinica BEFORE INSERT ON public.paciente FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();
CREATE TRIGGER trg_agendamento_set_clinica BEFORE INSERT ON public.agendamento FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();
CREATE TRIGGER trg_dentista_set_clinica BEFORE INSERT ON public.dentista FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();
CREATE TRIGGER trg_despesa_set_clinica BEFORE INSERT ON public.despesa FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();
CREATE TRIGGER trg_evolucao_set_clinica BEFORE INSERT ON public.evolucao FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();
CREATE TRIGGER trg_insumo_set_clinica BEFORE INSERT ON public.insumo FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();
CREATE TRIGGER trg_odontograma_set_clinica BEFORE INSERT ON public.odontograma_procedimento FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();
CREATE TRIGGER trg_paciente_debito_set_clinica BEFORE INSERT ON public.paciente_debito FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();
CREATE TRIGGER trg_paciente_foto_set_clinica BEFORE INSERT ON public.paciente_foto FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();
CREATE TRIGGER trg_procedimento_set_clinica BEFORE INSERT ON public.procedimento FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();
CREATE TRIGGER trg_sessao_set_clinica BEFORE INSERT ON public.sessao FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();

CREATE TRIGGER trg_clinica_updated_at BEFORE UPDATE ON public.clinica
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Drop old policies and recreate with clinica_id scoping
-- paciente
DROP POLICY IF EXISTS paciente_select ON public.paciente;
DROP POLICY IF EXISTS paciente_insert ON public.paciente;
DROP POLICY IF EXISTS paciente_update ON public.paciente;
DROP POLICY IF EXISTS paciente_delete ON public.paciente;
CREATE POLICY paciente_select ON public.paciente FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY paciente_insert ON public.paciente FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY paciente_update ON public.paciente FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY paciente_delete ON public.paciente FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));

-- agendamento
DROP POLICY IF EXISTS agendamento_select ON public.agendamento;
DROP POLICY IF EXISTS agendamento_insert ON public.agendamento;
DROP POLICY IF EXISTS agendamento_update ON public.agendamento;
DROP POLICY IF EXISTS agendamento_delete ON public.agendamento;
CREATE POLICY agendamento_select ON public.agendamento FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY agendamento_insert ON public.agendamento FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY agendamento_update ON public.agendamento FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY agendamento_delete ON public.agendamento FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));

-- dentista
DROP POLICY IF EXISTS dentista_select ON public.dentista;
DROP POLICY IF EXISTS dentista_insert ON public.dentista;
DROP POLICY IF EXISTS dentista_update ON public.dentista;
DROP POLICY IF EXISTS dentista_delete ON public.dentista;
CREATE POLICY dentista_select ON public.dentista FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY dentista_insert ON public.dentista FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY dentista_update ON public.dentista FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY dentista_delete ON public.dentista FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));

-- despesa
DROP POLICY IF EXISTS despesa_select ON public.despesa;
DROP POLICY IF EXISTS despesa_insert ON public.despesa;
DROP POLICY IF EXISTS despesa_update ON public.despesa;
DROP POLICY IF EXISTS despesa_delete ON public.despesa;
CREATE POLICY despesa_select ON public.despesa FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY despesa_insert ON public.despesa FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY despesa_update ON public.despesa FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY despesa_delete ON public.despesa FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));

-- evolucao
DROP POLICY IF EXISTS evolucao_select ON public.evolucao;
DROP POLICY IF EXISTS evolucao_insert ON public.evolucao;
DROP POLICY IF EXISTS evolucao_update ON public.evolucao;
DROP POLICY IF EXISTS evolucao_delete ON public.evolucao;
CREATE POLICY evolucao_select ON public.evolucao FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY evolucao_insert ON public.evolucao FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY evolucao_update ON public.evolucao FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY evolucao_delete ON public.evolucao FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));

-- insumo
DROP POLICY IF EXISTS insumo_select ON public.insumo;
DROP POLICY IF EXISTS insumo_insert ON public.insumo;
DROP POLICY IF EXISTS insumo_update ON public.insumo;
DROP POLICY IF EXISTS insumo_delete ON public.insumo;
CREATE POLICY insumo_select ON public.insumo FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY insumo_insert ON public.insumo FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY insumo_update ON public.insumo FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY insumo_delete ON public.insumo FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));

-- odontograma_procedimento
DROP POLICY IF EXISTS odontograma_select ON public.odontograma_procedimento;
DROP POLICY IF EXISTS odontograma_insert ON public.odontograma_procedimento;
DROP POLICY IF EXISTS odontograma_update ON public.odontograma_procedimento;
DROP POLICY IF EXISTS odontograma_delete ON public.odontograma_procedimento;
CREATE POLICY odontograma_select ON public.odontograma_procedimento FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY odontograma_insert ON public.odontograma_procedimento FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY odontograma_update ON public.odontograma_procedimento FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY odontograma_delete ON public.odontograma_procedimento FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));

-- paciente_debito
DROP POLICY IF EXISTS paciente_debito_select ON public.paciente_debito;
DROP POLICY IF EXISTS paciente_debito_insert ON public.paciente_debito;
DROP POLICY IF EXISTS paciente_debito_update ON public.paciente_debito;
DROP POLICY IF EXISTS paciente_debito_delete ON public.paciente_debito;
CREATE POLICY paciente_debito_select ON public.paciente_debito FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY paciente_debito_insert ON public.paciente_debito FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY paciente_debito_update ON public.paciente_debito FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY paciente_debito_delete ON public.paciente_debito FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));

-- paciente_foto
DROP POLICY IF EXISTS paciente_foto_select ON public.paciente_foto;
DROP POLICY IF EXISTS paciente_foto_insert ON public.paciente_foto;
DROP POLICY IF EXISTS paciente_foto_update ON public.paciente_foto;
DROP POLICY IF EXISTS paciente_foto_delete ON public.paciente_foto;
CREATE POLICY paciente_foto_select ON public.paciente_foto FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY paciente_foto_insert ON public.paciente_foto FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY paciente_foto_update ON public.paciente_foto FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY paciente_foto_delete ON public.paciente_foto FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));

-- procedimento
DROP POLICY IF EXISTS procedimento_select ON public.procedimento;
DROP POLICY IF EXISTS procedimento_insert ON public.procedimento;
DROP POLICY IF EXISTS procedimento_update ON public.procedimento;
DROP POLICY IF EXISTS procedimento_delete ON public.procedimento;
CREATE POLICY procedimento_select ON public.procedimento FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY procedimento_insert ON public.procedimento FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY procedimento_update ON public.procedimento FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY procedimento_delete ON public.procedimento FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));

-- sessao
DROP POLICY IF EXISTS sessao_select ON public.sessao;
DROP POLICY IF EXISTS sessao_insert ON public.sessao;
DROP POLICY IF EXISTS sessao_update ON public.sessao;
DROP POLICY IF EXISTS sessao_delete ON public.sessao;
CREATE POLICY sessao_select ON public.sessao FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY sessao_insert ON public.sessao FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY sessao_update ON public.sessao FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()))
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()));
CREATE POLICY sessao_delete ON public.sessao FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid())
         AND (public.has_clinica_role(auth.uid(), clinica_id, 'admin')
              OR public.has_clinica_role(auth.uid(), clinica_id, 'responsavel_tecnico')));
