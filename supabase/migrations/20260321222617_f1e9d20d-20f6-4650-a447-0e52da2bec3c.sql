
-- 1. Fix profiles: Drop dangerous public INSERT policy, add scoped authenticated one
DROP POLICY IF EXISTS "Allow insert for auth trigger" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Fix get_user_role: Add caller validation
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
    AND (
      _user_id = auth.uid()
      OR has_role(auth.uid(), 'admin')
    )
  LIMIT 1;
$$;

-- 3. Fix RLS on clinical tables: Replace permissive policies with role-gated ones

-- agendamento
DROP POLICY IF EXISTS "Authenticated full access to agendamento" ON public.agendamento;
CREATE POLICY "Role-gated access to agendamento"
  ON public.agendamento FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'responsavel_tecnico') OR
    has_role(auth.uid(), 'recepcionista')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'responsavel_tecnico') OR
    has_role(auth.uid(), 'recepcionista')
  );

-- dentista
DROP POLICY IF EXISTS "Authenticated full access to dentista" ON public.dentista;
CREATE POLICY "Role-gated access to dentista"
  ON public.dentista FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'responsavel_tecnico') OR
    has_role(auth.uid(), 'recepcionista')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'responsavel_tecnico') OR
    has_role(auth.uid(), 'recepcionista')
  );

-- despesa
DROP POLICY IF EXISTS "Authenticated full access to despesa" ON public.despesa;
CREATE POLICY "Role-gated access to despesa"
  ON public.despesa FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'responsavel_tecnico') OR
    has_role(auth.uid(), 'recepcionista')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'responsavel_tecnico') OR
    has_role(auth.uid(), 'recepcionista')
  );

-- insumo
DROP POLICY IF EXISTS "Authenticated full access to insumo" ON public.insumo;
CREATE POLICY "Role-gated access to insumo"
  ON public.insumo FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'responsavel_tecnico') OR
    has_role(auth.uid(), 'recepcionista')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'responsavel_tecnico') OR
    has_role(auth.uid(), 'recepcionista')
  );

-- paciente
DROP POLICY IF EXISTS "Authenticated full access to paciente" ON public.paciente;
CREATE POLICY "Role-gated access to paciente"
  ON public.paciente FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'responsavel_tecnico') OR
    has_role(auth.uid(), 'recepcionista')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'responsavel_tecnico') OR
    has_role(auth.uid(), 'recepcionista')
  );
