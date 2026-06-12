
-- Enforce one clinic per user (current data already complies) and make get_user_clinica_id deterministic.
ALTER TABLE public.clinica_membro ADD CONSTRAINT clinica_membro_user_id_unique UNIQUE (user_id);

CREATE OR REPLACE FUNCTION public.get_user_clinica_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT clinica_id FROM public.clinica_membro
  WHERE user_id = _user_id
  ORDER BY created_at ASC, id ASC
  LIMIT 1;
$function$;
