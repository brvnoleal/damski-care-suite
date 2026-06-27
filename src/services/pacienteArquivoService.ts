/**
 * Camada de serviço — Arquivos anexados ao paciente (exames, atestados, PDFs, imagens).
 * Bucket privado: `paciente-arquivos` com pastas <clinica_id>/<paciente_id>/<file>.
 */
import { supabase } from "@/integrations/supabase/client";

export interface PacienteArquivo {
  id: string;
  clinica_id: string;
  paciente_id: string;
  nome: string;
  mime_type: string | null;
  tamanho: number | null;
  storage_path: string;
  descricao: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

const BUCKET = "paciente-arquivos";

export const pacienteArquivoService = {
  listarPorPaciente: async (pacienteId: string): Promise<PacienteArquivo[]> => {
    const { data, error } = await supabase
      .from("paciente_arquivo" as any)
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as PacienteArquivo[];
  },

  upload: async (
    pacienteId: string,
    file: File,
    descricao?: string,
  ): Promise<PacienteArquivo> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sessão expirada.");
    const { data: membro } = await supabase
      .from("clinica_membro")
      .select("clinica_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const clinicaId = (membro as any)?.clinica_id;
    if (!clinicaId) throw new Error("Usuário sem clínica vinculada.");

    const ext = file.name.split(".").pop() || "bin";
    const path = `${clinicaId}/${pacienteId}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw upErr;

    const { data, error } = await supabase
      .from("paciente_arquivo" as any)
      .insert({
        paciente_id: pacienteId,
        nome: file.name,
        mime_type: file.type || null,
        tamanho: file.size,
        storage_path: path,
        descricao: descricao || null,
        uploaded_by: user.id,
      } as any)
      .select("*")
      .single();
    if (error) {
      await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
      throw error;
    }
    return data as unknown as PacienteArquivo;
  },

  getSignedUrl: async (path: string, expiresIn = 3600): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },

  excluir: async (arquivo: PacienteArquivo): Promise<void> => {
    await supabase.storage.from(BUCKET).remove([arquivo.storage_path]).catch(() => {});
    const { error } = await supabase
      .from("paciente_arquivo" as any)
      .delete()
      .eq("id", arquivo.id);
    if (error) throw error;
  },
};
