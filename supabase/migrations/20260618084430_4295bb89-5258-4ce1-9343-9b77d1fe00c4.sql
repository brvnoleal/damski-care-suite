
-- ============ procedimento_insumo ============
CREATE TABLE IF NOT EXISTS public.procedimento_insumo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  procedimento_id uuid NOT NULL REFERENCES public.procedimento(id) ON DELETE CASCADE,
  insumo_id uuid NOT NULL REFERENCES public.insumo(id) ON DELETE CASCADE,
  quantidade integer NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (procedimento_id, insumo_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.procedimento_insumo TO authenticated;
GRANT ALL ON public.procedimento_insumo TO service_role;
ALTER TABLE public.procedimento_insumo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pi_select" ON public.procedimento_insumo FOR SELECT TO authenticated
USING (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "pi_insert" ON public.procedimento_insumo FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "pi_update" ON public.procedimento_insumo FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "pi_delete" ON public.procedimento_insumo FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));

CREATE TRIGGER pi_set_clinica BEFORE INSERT ON public.procedimento_insumo
FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();

CREATE TRIGGER pi_updated_at BEFORE UPDATE ON public.procedimento_insumo
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ agendamento_insumo ============
CREATE TABLE IF NOT EXISTS public.agendamento_insumo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  agendamento_id uuid NOT NULL REFERENCES public.agendamento(id) ON DELETE CASCADE,
  insumo_id uuid NOT NULL REFERENCES public.insumo(id) ON DELETE RESTRICT,
  quantidade integer NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agendamento_insumo TO authenticated;
GRANT ALL ON public.agendamento_insumo TO service_role;
ALTER TABLE public.agendamento_insumo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_select" ON public.agendamento_insumo FOR SELECT TO authenticated
USING (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "ai_insert" ON public.agendamento_insumo FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "ai_update" ON public.agendamento_insumo FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));
CREATE POLICY "ai_delete" ON public.agendamento_insumo FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()) OR clinica_id = get_user_clinica_id(auth.uid()));

CREATE TRIGGER ai_set_clinica BEFORE INSERT ON public.agendamento_insumo
FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();

CREATE TRIGGER ai_updated_at BEFORE UPDATE ON public.agendamento_insumo
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Trigger: baixar estoque automaticamente ============
CREATE OR REPLACE FUNCTION public.adjust_insumo_estoque()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.insumo
       SET quantidade = GREATEST(quantidade - NEW.quantidade, 0),
           updated_at = now()
     WHERE id = NEW.insumo_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.insumo
       SET quantidade = quantidade + OLD.quantidade,
           updated_at = now()
     WHERE id = OLD.insumo_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.insumo_id = OLD.insumo_id THEN
      UPDATE public.insumo
         SET quantidade = GREATEST(quantidade + OLD.quantidade - NEW.quantidade, 0),
             updated_at = now()
       WHERE id = NEW.insumo_id;
    ELSE
      UPDATE public.insumo
         SET quantidade = quantidade + OLD.quantidade, updated_at = now()
       WHERE id = OLD.insumo_id;
      UPDATE public.insumo
         SET quantidade = GREATEST(quantidade - NEW.quantidade, 0), updated_at = now()
       WHERE id = NEW.insumo_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS ai_adjust_estoque ON public.agendamento_insumo;
CREATE TRIGGER ai_adjust_estoque
AFTER INSERT OR UPDATE OR DELETE ON public.agendamento_insumo
FOR EACH ROW EXECUTE FUNCTION public.adjust_insumo_estoque();
