
-- Drop all open policies on clinical tables
DROP POLICY IF EXISTS "Allow all access to paciente" ON public.paciente;
DROP POLICY IF EXISTS "Allow all access to dentista" ON public.dentista;
DROP POLICY IF EXISTS "Allow all access to agendamento" ON public.agendamento;
DROP POLICY IF EXISTS "Allow all access to insumo" ON public.insumo;
DROP POLICY IF EXISTS "Allow all access to despesa" ON public.despesa;

-- Replace with authenticated-only policies
CREATE POLICY "Authenticated full access to paciente"
  ON public.paciente FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access to dentista"
  ON public.dentista FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access to agendamento"
  ON public.agendamento FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access to insumo"
  ON public.insumo FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access to despesa"
  ON public.despesa FOR ALL TO authenticated USING (true) WITH CHECK (true);
