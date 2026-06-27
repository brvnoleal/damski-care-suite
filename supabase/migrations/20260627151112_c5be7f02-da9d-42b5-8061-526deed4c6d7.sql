
CREATE TABLE public.paciente_arquivo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL,
  paciente_id uuid NOT NULL REFERENCES public.paciente(id) ON DELETE CASCADE,
  nome text NOT NULL,
  mime_type text,
  tamanho bigint,
  storage_path text NOT NULL,
  descricao text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.paciente_arquivo TO authenticated;
GRANT ALL ON public.paciente_arquivo TO service_role;

ALTER TABLE public.paciente_arquivo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arquivo_select_clinica" ON public.paciente_arquivo
  FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "arquivo_insert_clinica" ON public.paciente_arquivo
  FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "arquivo_update_clinica" ON public.paciente_arquivo
  FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "arquivo_delete_clinica" ON public.paciente_arquivo
  FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinica_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE TRIGGER set_clinica_id_paciente_arquivo
  BEFORE INSERT ON public.paciente_arquivo
  FOR EACH ROW EXECUTE FUNCTION public.set_clinica_id_from_user();

CREATE TRIGGER update_paciente_arquivo_updated_at
  BEFORE UPDATE ON public.paciente_arquivo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_paciente_arquivo_paciente ON public.paciente_arquivo(paciente_id, created_at DESC);

CREATE POLICY "arquivos_storage_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'paciente-arquivos'
    AND (storage.foldername(name))[1] = public.get_user_clinica_id(auth.uid())::text
  );

CREATE POLICY "arquivos_storage_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'paciente-arquivos'
    AND (storage.foldername(name))[1] = public.get_user_clinica_id(auth.uid())::text
  );

CREATE POLICY "arquivos_storage_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'paciente-arquivos'
    AND (storage.foldername(name))[1] = public.get_user_clinica_id(auth.uid())::text
  );
