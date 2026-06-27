/**
 * Camada de serviço — Pacientes
 * Operações CRUD via Supabase.
 */
import { supabase } from "@/integrations/supabase/client";
import { Paciente } from "@/types";
import { notificationStore } from "@/stores/notificationStore";

const mapRow = (row: any): Paciente => ({
  id: row.id,
  nome: row.nome,
  cpf: row.cpf,
  rg: row.rg || undefined,
  emissor: row.emissor || undefined,
  sexo: row.sexo || undefined,
  estado_civil: row.estado_civil || undefined,
  profissao: row.profissao || undefined,
  indicacao_tipo: row.indicacao_tipo || undefined,
  indicacao_nome: row.indicacao_nome || undefined,
  tags: Array.isArray(row.tags) ? row.tags : [],
  plano: row.plano || undefined,
  numero_plano: row.numero_plano || undefined,
  numero_prontuario: row.numero_prontuario || undefined,
  telefone: row.telefone || "",
  email: row.email || "",
  instagram: row.instagram || undefined,
  data_nascimento: row.data_nascimento,
  cep: row.cep || undefined,
  estado: row.estado || undefined,
  cidade: row.cidade || undefined,
  bairro: row.bairro || undefined,
  rua: row.rua || undefined,
  numero: row.numero || undefined,
  complemento: row.complemento || undefined,
  ponto_referencia: row.ponto_referencia || undefined,
  avatar_url: row.avatar_url || undefined,
  status: row.status,
  created_at: row.created_at,
});

export const pacienteService = {
  listar: async (): Promise<Paciente[]> => {
    const { data, error } = await supabase.from("paciente").select("*").order("nome");
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  buscarPorId: async (id: string): Promise<Paciente | null> => {
    const { data, error } = await supabase.from("paciente").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  criar: async (dados: Omit<Paciente, "id" | "created_at">): Promise<Paciente> => {
    const { data, error } = await supabase.from("paciente").insert(dados as any).select().single();
    if (error) throw error;
    const item = mapRow(data);
    notificationStore.add("create", "paciente", "Paciente cadastrado", `${item.nome} foi adicionado.`);
    return item;
  },

  atualizar: async (id: string, dados: Partial<Paciente>): Promise<Paciente | null> => {
    const { created_at, id: _, ...updateData } = dados as any;
    const { data, error } = await supabase.from("paciente").update({ ...updateData, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    if (data) {
      const item = mapRow(data);
      notificationStore.add("update", "paciente", "Paciente atualizado", `Dados de ${item.nome} foram alterados.`);
      return item;
    }
    return null;
  },

  excluir: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("paciente").delete().eq("id", id);
    if (error) throw error;
    notificationStore.add("delete", "paciente", "Paciente removido", "Um paciente foi excluído.");
    return true;
  },

  uploadAvatar: async (id: string, file: File): Promise<string> => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    // RLS exige que o primeiro segmento do path seja o paciente_id.
    const path = `${id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("paciente-fotos")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) throw upErr;
    const { error } = await supabase
      .from("paciente")
      .update({ avatar_url: path, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    const { data } = await supabase.storage
      .from("paciente-fotos")
      .createSignedUrl(path, 60 * 60);
    return data?.signedUrl || "";
  },

  getAvatarSignedUrl: async (path: string): Promise<string> => {
    if (!path) return "";
    const { data } = await supabase.storage
      .from("paciente-fotos")
      .createSignedUrl(path, 60 * 60);
    return data?.signedUrl || "";
  },
};
