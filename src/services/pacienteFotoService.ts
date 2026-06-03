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
    // Upload é validado server-side pela edge function (MIME real, tamanho, extensão).
    const form = new FormData();
    form.append("file", file);
    form.append("paciente_id", pacienteId);
    form.append("categoria", meta.categoria);
    if (meta.descricao) form.append("descricao", meta.descricao);

    const { data, error } = await supabase.functions.invoke("upload-paciente-foto", {
      body: form,
    });
    if (error) throw error;
    const row = (data as any)?.foto;
    if (!row) throw new Error("Falha no upload");

    const url = await signUrl(row.storage_path);
    return {
      id: row.id,
      paciente_id: row.paciente_id,
      storage_path: row.storage_path,
      nome_arquivo: row.nome_arquivo,
      categoria: row.categoria,
      descricao: row.descricao,
      data: row.data,
      created_at: row.created_at,
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
