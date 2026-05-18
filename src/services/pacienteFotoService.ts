/**
 * Camada de serviço — Fotos clínicas do paciente
 * Metadados em `paciente_foto`, binário em Storage `paciente-fotos`.
 */
import { supabase } from "@/integrations/supabase/client";

export type FotoCategoria = "antes" | "depois" | "durante" | "outro";

export interface PacienteFoto {
  id: string;
  paciente_id: string;
  storage_path: string;
  nome_arquivo: string;
  categoria: FotoCategoria;
  descricao?: string | null;
  data: string;
  url: string; // signed url para exibição
  created_at?: string;
}

const BUCKET = "paciente-fotos";
const SIGNED_URL_TTL = 60 * 60; // 1h

const signUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error) return "";
  return data?.signedUrl || "";
};

export const pacienteFotoService = {
  listarPorPaciente: async (pacienteId: string): Promise<PacienteFoto[]> => {
    const { data, error } = await supabase
      .from("paciente_foto")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = data || [];
    const urls = await Promise.all(rows.map((r: any) => signUrl(r.storage_path)));
    return rows.map((r: any, i: number) => ({
      id: r.id,
      paciente_id: r.paciente_id,
      storage_path: r.storage_path,
      nome_arquivo: r.nome_arquivo,
      categoria: r.categoria,
      descricao: r.descricao,
      data: r.data,
      created_at: r.created_at,
      url: urls[i],
    }));
  },

  upload: async (
    pacienteId: string,
    file: File,
    meta: { categoria: FotoCategoria; descricao?: string },
  ): Promise<PacienteFoto> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${pacienteId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from("paciente_foto")
      .insert({
        paciente_id: pacienteId,
        storage_path: path,
        nome_arquivo: file.name,
        categoria: meta.categoria,
        descricao: meta.descricao || null,
        data: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();
    if (error) throw error;

    const url = await signUrl(path);
    return {
      id: data.id,
      paciente_id: data.paciente_id,
      storage_path: data.storage_path,
      nome_arquivo: data.nome_arquivo,
      categoria: data.categoria,
      descricao: data.descricao,
      data: data.data,
      created_at: data.created_at,
      url,
    };
  },

  excluir: async (foto: PacienteFoto): Promise<void> => {
    await supabase.storage.from(BUCKET).remove([foto.storage_path]);
    const { error } = await supabase
      .from("paciente_foto")
      .delete()
      .eq("id", foto.id);
    if (error) throw error;
  },
};
