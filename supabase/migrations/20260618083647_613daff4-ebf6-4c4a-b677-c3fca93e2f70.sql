
ALTER TABLE public.dentista
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS dentista_user_id_unique
  ON public.dentista(user_id) WHERE user_id IS NOT NULL;

-- Backfill: cria dentista para cada usuário admin/responsavel_tecnico sem cadastro
INSERT INTO public.dentista (clinica_id, user_id, nome, especialidade, cro, status)
SELECT cm.clinica_id, cm.user_id,
       COALESCE(NULLIF(p.nome,''), 'Usuário'),
       'Não informado',
       'PENDENTE-' || substr(cm.user_id::text, 1, 8),
       'ativo'
FROM public.clinica_membro cm
JOIN public.profiles p ON p.id = cm.user_id
WHERE cm.role IN ('admin','responsavel_tecnico')
  AND NOT EXISTS (SELECT 1 FROM public.dentista d WHERE d.user_id = cm.user_id);
