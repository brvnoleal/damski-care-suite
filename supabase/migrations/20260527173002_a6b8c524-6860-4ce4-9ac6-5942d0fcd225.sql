
CREATE TABLE public.paciente_debito (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL,
  descricao VARCHAR NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  forma_pagamento VARCHAR,
  data_vencimento DATE NOT NULL,
  modalidade VARCHAR NOT NULL DEFAULT 'avista',
  parcelas INTEGER NOT NULL DEFAULT 1,
  status VARCHAR NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.paciente_debito TO authenticated;
GRANT ALL ON public.paciente_debito TO service_role;

ALTER TABLE public.paciente_debito ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paciente_debito_select" ON public.paciente_debito FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'responsavel_tecnico'::app_role) OR has_role(auth.uid(), 'recepcionista'::app_role));
CREATE POLICY "paciente_debito_insert" ON public.paciente_debito FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'responsavel_tecnico'::app_role) OR has_role(auth.uid(), 'recepcionista'::app_role));
CREATE POLICY "paciente_debito_update" ON public.paciente_debito FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'responsavel_tecnico'::app_role) OR has_role(auth.uid(), 'recepcionista'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'responsavel_tecnico'::app_role) OR has_role(auth.uid(), 'recepcionista'::app_role));
CREATE POLICY "paciente_debito_delete" ON public.paciente_debito FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'responsavel_tecnico'::app_role));

CREATE TRIGGER update_paciente_debito_updated_at BEFORE UPDATE ON public.paciente_debito
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_paciente_debito_paciente ON public.paciente_debito(paciente_id);


CREATE TABLE public.evolucao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL,
  dentista_id UUID,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.evolucao TO authenticated;
GRANT ALL ON public.evolucao TO service_role;

ALTER TABLE public.evolucao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evolucao_select" ON public.evolucao FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'responsavel_tecnico'::app_role) OR has_role(auth.uid(), 'recepcionista'::app_role));
CREATE POLICY "evolucao_insert" ON public.evolucao FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'responsavel_tecnico'::app_role) OR has_role(auth.uid(), 'recepcionista'::app_role));
CREATE POLICY "evolucao_update" ON public.evolucao FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'responsavel_tecnico'::app_role) OR has_role(auth.uid(), 'recepcionista'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'responsavel_tecnico'::app_role) OR has_role(auth.uid(), 'recepcionista'::app_role));
CREATE POLICY "evolucao_delete" ON public.evolucao FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'responsavel_tecnico'::app_role));

CREATE TRIGGER update_evolucao_updated_at BEFORE UPDATE ON public.evolucao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_evolucao_paciente ON public.evolucao(paciente_id);
