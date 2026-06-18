/**
 * Camada de serviço — Dentistas
 * Operações CRUD via Supabase.
 */
import { supabase } from "@/integrations/supabase/client";
import { Dentista } from "@/types";
import { notificationStore } from "@/stores/notificationStore";

const mapRow = (row: any): Dentista => ({
  id: row.id,
  nome: row.nome,
  especialidade: row.especialidade,
  cro: row.cro,
  telefone: row.telefone || undefined,
  email: row.email || undefined,
  instagram: row.instagram || undefined,
  cep: row.cep || undefined,
  estado: row.estado || undefined,
  cidade: row.cidade || undefined,
  bairro: row.bairro || undefined,
  rua: row.rua || undefined,
  numero: row.numero || undefined,
  complemento: row.complemento || undefined,
  ponto_referencia: row.ponto_referencia || undefined,
  status: row.status,
  created_at: row.created_at,
});

export const dentistaService = {
  listar: async (): Promise<Dentista[]> => {
    const { data, error } = await supabase.from("dentista").select("*").order("nome");
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  /**
   * Lista apenas dentistas vinculados a usuários do sistema com perfil
   * Administrador ou Responsável Técnico. Usado no combo de agendamentos.
   */
  listarUsuariosDentistas: async (): Promise<Dentista[]> => {
    const { data: membros, error: mErr } = await supabase
      .from("clinica_membro")
      .select("user_id, role")
      .in("role", ["admin", "responsavel_tecnico"]);
    if (mErr) throw mErr;
    const userIds = (membros || []).map((m: any) => m.user_id).filter(Boolean);
    if (userIds.length === 0) return [];
    const { data, error } = await supabase
      .from("dentista")
      .select("*")
      .in("user_id", userIds)
      .order("nome");
    if (error) throw error;
    return (data || []).map(mapRow);
  },



  buscarPorId: async (id: string): Promise<Dentista | null> => {
    const { data, error } = await supabase.from("dentista").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  criar: async (dados: Omit<Dentista, "id" | "created_at">): Promise<Dentista> => {
    const { data, error } = await supabase.from("dentista").insert(dados as any).select().single();
    if (error) throw error;
    const item = mapRow(data);
    notificationStore.add("create", "dentista", "Dentista cadastrado", `${item.nome} (CRO ${item.cro}).`);
    return item;
  },

  atualizar: async (id: string, dados: Partial<Dentista>): Promise<Dentista | null> => {
    const { created_at, id: _, ...updateData } = dados as any;
    const { data, error } = await supabase.from("dentista").update({ ...updateData, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    if (data) {
      const item = mapRow(data);
      notificationStore.add("update", "dentista", "Dentista atualizado", `Dados de ${item.nome} foram alterados.`);
      return item;
    }
    return null;
  },

  excluir: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("dentista").delete().eq("id", id);
    if (error) throw error;
    notificationStore.add("delete", "dentista", "Dentista removido", "Um dentista foi excluído.");
    return true;
  },
};
